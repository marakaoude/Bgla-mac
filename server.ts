import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase JSON body limit for photo uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

import { dbManager } from './src/server/database.js';

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'veo-3.1-fast-generate-preview',
    splitRatio: '95/5',
    supportedGateways: ['stripe_connect', 'paypal', 'wave', 'orange_money', 'moov_money'],
  });
});

// ========================================================
// [API Backend] Endpoints: Payments, Split 95/5, Database & Creator Accounts
// ========================================================

// 1. Process Checkout (Tickets, Subscriptions, Merch) with strict 95/5 split
app.post('/api/payments/checkout', (req, res) => {
  try {
    const {
      type = 'ticket_purchase',
      creatorId = 'artist-oude-mill',
      amountFCFA,
      paymentProvider = 'stripe_connect',
      buyerName,
      buyerPhone,
      buyerEmail,
      itemDescription,
      concert,
    } = req.body;

    if (!amountFCFA || amountFCFA <= 0) {
      return res.status(400).json({ error: 'Montant invalide en FCFA' });
    }
    if (!buyerName || !buyerPhone) {
      return res.status(400).json({ error: 'Nom et téléphone du payeur requis' });
    }

    const result = dbManager.processPaymentWithSplit({
      type,
      creatorId,
      amountFCFA: Number(amountFCFA),
      paymentProvider,
      buyerName,
      buyerPhone,
      buyerEmail,
      itemDescription: itemDescription || 'Achat de billet BGla Mac',
      concert,
    });

    console.log(`[Payment] Processed ${type} | Total: ${amountFCFA} FCFA | Split: 95% Creator (${result.split.creatorShareFCFA} FCFA) / 5% Platform (${result.split.platformFeeFCFA} FCFA) via ${paymentProvider}`);

    return res.status(200).json({
      success: true,
      message: 'Paiement confirmé avec succès et split 95/5 appliqué.',
      ...result,
    });
  } catch (error: any) {
    console.error('[Payment Error]:', error);
    return res.status(500).json({ error: error?.message || 'Erreur lors du traitement du paiement' });
  }
});

// 2. Get Creator Account details, live balance, Stripe Connect & PayPal status
app.get('/api/creators/:id', (req, res) => {
  try {
    const creator = dbManager.getCreator(req.params.id);
    return res.json({ success: true, creator });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erreur lors de la récupération du créateur' });
  }
});

// 3. Creator Request Payout (Virement vers Stripe Connect / PayPal / Wave)
app.post('/api/creators/:id/payout', (req, res) => {
  try {
    const { amountFCFA, method = 'stripe_connect' } = req.body;
    if (!amountFCFA || Number(amountFCFA) <= 0) {
      return res.status(400).json({ error: 'Montant de virement invalide' });
    }

    const result = dbManager.requestCreatorPayout(
      req.params.id,
      Number(amountFCFA),
      method
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    console.log(`[Payout] Creator ${req.params.id} withdrew ${amountFCFA} FCFA via ${method}`);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erreur lors du virement' });
  }
});

// 4. Renew Artist Subscription (10 000 FCFA / mois)
app.post('/api/subscription/renew', (req, res) => {
  try {
    const { creatorId = 'artist-oude-mill', paymentProvider = 'stripe_connect', buyerName = 'Oude Mill', buyerPhone = '+223 76 00 11 22' } = req.body;

    const result = dbManager.processPaymentWithSplit({
      type: 'artist_subscription',
      creatorId,
      amountFCFA: 10000,
      paymentProvider,
      buyerName,
      buyerPhone,
      itemDescription: 'Abonnement Artiste BGla Mac Pro - 10 000 FCFA/mois',
    });

    return res.json({
      success: true,
      message: 'Abonnement artiste 10 000 FCFA renouvelé avec succès pour 30 jours !',
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erreur lors du renouvellement' });
  }
});

// 5. Verify Ticket QR Code (Server-side validation against database)
app.post('/api/tickets/verify', (req, res) => {
  try {
    const { qrHash } = req.body;
    if (!qrHash) {
      return res.status(400).json({ error: 'Code QR ou hash manquant' });
    }

    const result = dbManager.verifyTicket(qrHash);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erreur lors de la vérification du billet' });
  }
});

// 6. Punch / Invalidate Ticket at Venue Gate (Prevent reuse)
app.post('/api/tickets/punch', (req, res) => {
  try {
    const { qrHash, scannedBy = 'Agent Scanner Porte Officielle' } = req.body;
    if (!qrHash) {
      return res.status(400).json({ error: 'Code QR manquant' });
    }

    const result = dbManager.punchTicket(qrHash, scannedBy);
    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log(`[Ticket Scanned] ${qrHash} checked in by ${scannedBy}`);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erreur lors du compostage' });
  }
});

// 7. Get Database State & Stats for live architecture flow inspection
app.get('/api/database/state', (req, res) => {
  try {
    const db = dbManager.getDatabase();
    const stats = dbManager.getStats();
    return res.json({
      success: true,
      stats,
      creators: db.creators,
      recentTransactions: db.transactions.slice(0, 15),
      recentTickets: db.tickets.slice(0, 15),
      recentPayouts: db.payouts.slice(0, 10),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erreur base de données' });
  }
});

// 8. Get Transactions List
app.get('/api/transactions', (req, res) => {
  try {
    const db = dbManager.getDatabase();
    return res.json({
      success: true,
      transactions: db.transactions,
      count: db.transactions.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
});

// 9. Get Tickets List
app.get('/api/tickets', (req, res) => {
  try {
    const db = dbManager.getDatabase();
    return res.json({
      success: true,
      tickets: db.tickets,
      count: db.tickets.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
});

// 10. BGla Tok Short Videos & Montage API
const BGlaTokVideosStore: any[] = [];

app.get('/api/bglatok/videos', (req, res) => {
  return res.json({
    success: true,
    videos: BGlaTokVideosStore,
    count: BGlaTokVideosStore.length,
  });
});

app.post('/api/bglatok/videos', (req, res) => {
  try {
    const newVideo = req.body;
    if (!newVideo || !newVideo.id) {
      return res.status(400).json({ error: 'Données vidéo manquantes' });
    }
    BGlaTokVideosStore.unshift(newVideo);
    console.log(`[BGla Tok] Published video ${newVideo.id} - ${newVideo.description?.slice(0, 30)}`);
    return res.json({ success: true, video: newVideo });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erreur publication vidéo' });
  }
});

app.post('/api/bglatok/videos/:id/like', (req, res) => {
  const { id } = req.params;
  const vid = BGlaTokVideosStore.find((v) => v.id === id);
  if (vid) {
    vid.likesCount = (vid.likesCount || 0) + 1;
    vid.isLiked = true;
    return res.json({ success: true, likesCount: vid.likesCount });
  }
  return res.json({ success: true, id, likesCount: 1 });
});

// Start video generation
app.post('/api/generate-video', async (req, res) => {
  try {
    const { image, prompt, aspectRatio = '9:16', resolution = '720p', model = 'veo-3.1-fast-generate-preview', musicGenre, cameraMovement, cinematicFilter } = req.body;

    if (!prompt && !image) {
      return res.status(400).json({ error: 'Prompt or image is required for video generation.' });
    }

    const ai = getGenAIClient();

    // Prepare configuration
    const validAspectRatio = aspectRatio === '16:9' ? '16:9' : '9:16';
    const configPayload: any = {
      numberOfVideos: 1,
      aspectRatio: validAspectRatio,
    };

    if (resolution) {
      configPayload.resolution = resolution;
    }

    let finalPrompt = prompt || 'Oude Mill performing live in a giant stadium concert with fireworks and ecstatic crowd';
    if (musicGenre && !finalPrompt.toLowerCase().includes(musicGenre.toLowerCase())) {
      finalPrompt += `\n\n[Genre musical & ambiance foule : ${musicGenre}]`;
    }
    if (cameraMovement && !finalPrompt.toLowerCase().includes(cameraMovement.toLowerCase())) {
      finalPrompt += `\n\n[Contrainte cinématique - Mouvement de caméra imposé : ${cameraMovement}]`;
    }
    if (cinematicFilter && !finalPrompt.toLowerCase().includes(cinematicFilter.toLowerCase())) {
      finalPrompt += `\n\n[Post-traitement cinématographique imposé : ${cinematicFilter}]`;
    }

    const generatePayload: any = {
      model: model || 'veo-3.1-fast-generate-preview',
      prompt: finalPrompt,
      config: configPayload,
    };

    // If starting image is provided, parse base64
    if (image && typeof image === 'string') {
      let base64Data = image;
      let mimeType = 'image/jpeg';

      if (image.includes(';base64,')) {
        const parts = image.split(';base64,');
        mimeType = parts[0].replace('data:', '') || 'image/jpeg';
        base64Data = parts[1];
      }

      generatePayload.image = {
        imageBytes: base64Data,
        mimeType: mimeType,
      };
    }

    console.log(`[Veo] Initiating video generation with model: ${generatePayload.model}, ratio: ${validAspectRatio}`);
    const operation = await ai.models.generateVideos(generatePayload);

    console.log(`[Veo] Operation started: ${operation.name}`);
    return res.json({
      operationName: operation.name,
      status: 'started',
      model: generatePayload.model,
      aspectRatio: validAspectRatio,
    });
  } catch (error: any) {
    console.error('[Veo] Error generating video:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to start video generation',
      details: error?.statusText || error?.toString(),
    });
  }
});

// Poll video status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGenAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (updated.error) {
      return res.json({
        done: true,
        error: updated.error.message || JSON.stringify(updated.error),
      });
    }

    const generatedVideo = updated.response?.generatedVideos?.[0];
    const hasVideo = Boolean(generatedVideo?.video?.uri);

    return res.json({
      done: Boolean(updated.done || hasVideo),
      hasVideo,
      metadata: updated.metadata,
    });
  } catch (error: any) {
    console.error('[Veo] Error checking status:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to poll video status',
    });
  }
});

// Video stream/download endpoint
app.get('/api/video-stream', async (req, res) => {
  try {
    const operationName = req.query.operationName as string;
    const customFilename = (req.query.filename as string) || 'oude-mill-concert-veo.mp4';
    const safeFilename = customFilename.endsWith('.mp4') ? customFilename : `${customFilename}.mp4`;

    if (!operationName) {
      return res.status(400).send('operationName query param is required');
    }

    // Handle official clips or demo previews smoothly
    if (operationName.startsWith('official_') || operationName.startsWith('demo_')) {
      const samplePath = path.resolve(__dirname, 'public/sample-oude-mill.mp4');
      if (fs.existsSync(samplePath)) {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        if (req.query.download === 'true') {
          res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        } else {
          res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
        }
        const fileBuffer = await fs.promises.readFile(samplePath);
        return res.send(fileBuffer);
      }
    }

    const ai = getGenAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).send('Generated video URI not found or still rendering.');
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).send(`Failed to fetch video: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('[Veo] Download error:', error);
    return res.status(500).send(error?.message || 'Failed to stream video');
  }
});

// Prompt enhancer using Gemini Flash
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { basePrompt, concertStyle, crowdEnergy, lightingFX, musicGenre, cameraMovement, cinematicFilter } = req.body;
    const ai = getGenAIClient();

    const selectedCameraMove = cameraMovement || 'Slow Zoom In';
    const selectedCinematicFilter = cinematicFilter || 'Grain 35mm (Pellicule argentique Kodak)';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an elite concert director and cinematic VFX prompt engineer for Google Veo video generation.
Enhance this concert video generation prompt featuring Malian rap icon Oude Mill.
Base user request: ${basePrompt || 'Oude Mill performing in a giant stadium'}
Style: ${concertStyle || 'Massive world stadium headliner'}
Camera Movement Constraint: ${selectedCameraMove}
Cinematic Filter & Color Grading Constraint: ${selectedCinematicFilter}
Crowd Energy & Mood: ${crowdEnergy || 'Hundreds of thousands of ecstatic fans'}
Music Genre & Rhythm: ${musicGenre || 'Afro-Rap Malien (130 BPM)'}
Lighting & FX: ${lightingFX || 'Fireworks, lasers, 4K giant screens'}

Requirements:
- Preserve Oude Mill's exact facial likeness and modern street-luxe style.
- Reflect the selected musical genre in the artist's rhythm and gestures, lighting pulses, and crowd behavior (jumping vs swaying vs fist pumping).
- STRICT CONSTRAINT: Enforce the camera movement style: "${selectedCameraMove}". Explicitly describe this exact camera movement choreography.
- STRICT CONSTRAINT: Enforce the cinematic filter post-processing aesthetic: "${selectedCinematicFilter}". Explicitly describe the color grading, film stock grain, lighting halation, and visual post-processing texture.
- Realistic, confident walking and mic delivery (no clumsy movement, sharp 4K details).
- Format output as an optimized, vivid cinematic prompt ready for Veo 3.1.
- Output ONLY the refined prompt text in French (the user's preferred language) with no meta-commentary.`,
    });

    res.json({ enhancedPrompt: response.text?.trim() });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to enhance prompt' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Oude Mill Video Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});
