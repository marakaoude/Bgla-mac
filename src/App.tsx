/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Flame,
  Video,
  Play,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  Layers,
  Zap,
  Camera,
} from 'lucide-react';
import { AppShell, ActiveTab } from './components/AppShell';
import { PhotoUploader } from './components/PhotoUploader';
import { PromptEditor } from './components/PromptEditor';
import { MusicGenreSelector } from './components/MusicGenreSelector';
import { GenerationProgress } from './components/GenerationProgress';
import { VideoPlayerCard } from './components/VideoPlayerCard';
import { HistoryGallery } from './components/HistoryGallery';
import { AspectRatio, Resolution, GenerationJob, MusicGenre } from './types';
import { DEFAULT_CONCERT_PROMPT, OUDE_MILL_SAMPLE_IMAGE, MUSIC_GENRES } from './data/presets';
import { stadiumAudio } from './utils/audioSimulator';

export interface CameraMovementOption {
  id: string;
  name: string;
  label: string;
  description: string;
  constraintText: string;
}

export const CAMERA_MOVEMENT_OPTIONS: CameraMovementOption[] = [
  {
    id: 'slow-zoom-in',
    name: 'Slow Zoom In',
    label: 'Slow Zoom In (Zoom avant lent et dramatique)',
    description: 'Zoom avant lent et continu focalisé sur le charisme d’Oude Mill au micro.',
    constraintText: 'Mouvement de caméra imposé : Slow Zoom In (la caméra commence en plan moyen et zoome très lentement, de façon fluide et dramatique, vers le regard et le micro d’Oude Mill avec flou cinématique progressif en arrière-plan).',
  },
  {
    id: 'dynamic-panning',
    name: 'Dynamic Panning',
    label: 'Dynamic Panning (Panoramique dynamique foule & scène)',
    description: 'Balayage latéral cinématographique de gauche à droite couvrant la foule et la scène.',
    constraintText: 'Mouvement de caméra imposé : Dynamic Panning (un panoramique cinématographique fluide et dynamique balaie les 100 000 spectateurs en délire dans les gradins avant de se stabiliser sur Oude Mill en pleine gestuelle sur le beat).',
  },
  {
    id: 'aerial-drone-shot',
    name: 'Aerial Drone Shot',
    label: 'Aerial Drone Shot (Vue aérienne par drone plongeant)',
    description: 'Survol plongeant spectaculaire depuis le ciel du stade vers la scène.',
    constraintText: 'Mouvement de caméra imposé : Aerial Drone Shot (prise de vue aérienne majestueuse par drone zénithal descendant en plongeon cinématique au-dessus de tout le stade illuminé jusqu’à encadrer l’artiste).',
  },
  {
    id: '360-orbit',
    name: '360° Circular Orbit',
    label: '360° Circular Orbit (Rotation orbitale 360°)',
    description: 'Rotation circulaire continue à 360 degrés autour de l’artiste.',
    constraintText: 'Mouvement de caméra imposé : 360° Circular Orbit (rotation orbitale continue et fluide à 360° tournant autour d’Oude Mill tout en révélant les projecteurs et la marée humaine).',
  },
  {
    id: 'intimate-crane',
    name: 'Intimate Stage Crane',
    label: 'Intimate Stage Crane (Grue de scène rapprochée)',
    description: 'Mouvement descendant de grue depuis les projecteurs vers un plan rapproché.',
    constraintText: 'Mouvement de caméra imposé : Intimate Stage Crane (mouvement de grue descendant avec grâce depuis la hauteur des projecteurs vers un plan rapproché intense d’Oude Mill au micro).',
  },
  {
    id: 'tracking-dolly',
    name: 'Tracking Dolly Rush',
    label: 'Tracking Dolly Rush (Travelling scène dynamique)',
    description: 'Travelling d’avant en arrière rapide au ras de la scène.',
    constraintText: 'Mouvement de caméra imposé : Tracking Dolly Rush (travelling d’avant en arrière dynamique au ras des planches de la scène accompagnant la marche conquérante d’Oude Mill vers son public).',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [cameraMovement, setCameraMovement] = useState<string>('Slow Zoom In');
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(OUDE_MILL_SAMPLE_IMAGE);
  const [photoName, setPhotoName] = useState<string>('Oude Mill (Tenue Concert Live)');
  const [prompt, setPrompt] = useState<string>(DEFAULT_CONCERT_PROMPT);
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>(MUSIC_GENRES[0]);
  const [crowdVolume, setCrowdVolume] = useState<number>(0.65); // Default 65% crowd volume
  const [soundActive, setSoundActive] = useState<boolean>(false);

  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [completedJob, setCompletedJob] = useState<GenerationJob | null>(null);
  const [historyJobs, setHistoryJobs] = useState<GenerationJob[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handlePhotoSelected = (base64: string, sourceName: string) => {
    setCurrentPhoto(base64);
    setPhotoName(sourceName);
  };

  const handleSelectGenre = (genre: MusicGenre) => {
    setSelectedGenre(genre);
    stadiumAudio.setGenre(genre.id);
  };

  const handleCrowdVolumeChange = (vol: number) => {
    setCrowdVolume(vol);
    stadiumAudio.setVolume(vol);
    if (!soundActive && vol > 0.05) {
      // User is adjusting volume, enable ambient audio smoothly
      const started = stadiumAudio.toggle();
      setSoundActive(started);
    }
  };

  const handleToggleSound = () => {
    const newState = stadiumAudio.toggle();
    setSoundActive(newState);
    if (newState) {
      stadiumAudio.triggerBassDrop();
    }
  };

  const handleApplyGenreSnippet = (snippet: string) => {
    if (!prompt.includes(selectedGenre.name)) {
      setPrompt(prompt + '\n\n' + snippet);
    }
  };

  const handleApplyCameraConstraintToPrompt = (movementName?: string) => {
    const targetName = movementName || cameraMovement;
    const opt = CAMERA_MOVEMENT_OPTIONS.find((c) => c.name === targetName) || CAMERA_MOVEMENT_OPTIONS[0];
    if (!prompt.includes(opt.name)) {
      setPrompt(prompt + '\n\n' + opt.constraintText);
    }
  };

  const handleEnhancePrompt = async () => {
    try {
      setIsEnhancing(true);
      setGeneralError(null);
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrompt: prompt,
          cameraMovement, // Append selected camera movement style as constraint
          concertStyle: 'Concert géant Stade du 26-Mars avec Oude Mill',
          crowdEnergy: `Foule de 100 000 spectateurs (Intensité sonore de la foule : ${Math.round(crowdVolume * 100)}%), ambiance ${selectedGenre.name} (${selectedGenre.crowdMood})`,
          lightingFX: selectedGenre.lightingStyle,
          musicGenre: `${selectedGenre.name} (${selectedGenre.tempo})`,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de l’optimisation du prompt');
      }

      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Impossible d’enrichir le prompt.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const startVideoGeneration = async () => {
    try {
      setGeneralError(null);
      if (!prompt.trim() && !currentPhoto) {
        setGeneralError('Veuillez fournir une photo ou un prompt pour générer la vidéo.');
        return;
      }

      // Trigger stadium sound effect
      stadiumAudio.triggerBassDrop();

      // Append selected camera movement style as a constraint to the AI prompt generation logic
      const selectedCamOpt = CAMERA_MOVEMENT_OPTIONS.find((c) => c.name === cameraMovement) || CAMERA_MOVEMENT_OPTIONS[0];
      let promptWithConstraint = prompt;
      if (!promptWithConstraint.toLowerCase().includes(selectedCamOpt.name.toLowerCase())) {
        promptWithConstraint += `\n\n[Contrainte Mouvement de Caméra : ${selectedCamOpt.name}] ${selectedCamOpt.constraintText}`;
      }

      const newJobId = `job_${Date.now()}`;
      const tempJob: GenerationJob = {
        id: newJobId,
        operationName: 'Initialisation...',
        status: 'starting',
        prompt: promptWithConstraint,
        photoUrl: currentPhoto || undefined,
        aspectRatio,
        resolution,
        createdAt: Date.now(),
        stageMessage: `Connexion à Veo 3.1 Fast (${selectedGenre.name} • ${selectedCamOpt.name})...`,
        progressPercent: 5,
        musicGenre: selectedGenre.name,
        cameraMovement: selectedCamOpt.name,
      };

      setActiveJob(tempJob);

      // 1. Call POST /api/generate-video with prompt and cameraMovement
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentPhoto,
          prompt: promptWithConstraint,
          aspectRatio,
          resolution,
          cameraMovement: selectedCamOpt.name,
          model: 'veo-3.1-fast-generate-preview',
          musicGenre: `${selectedGenre.name} (${selectedGenre.tempo}) - ${selectedGenre.crowdMood} [Intensité sonore de la foule : ${Math.round(crowdVolume * 100)}%]`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      const opName = data.operationName;

      setActiveJob((prev) =>
        prev
          ? {
              ...prev,
              operationName: opName,
              status: 'rendering',
              stageMessage: 'Calcul cinématique en cours...',
              progressPercent: 20,
            }
          : null
      );

      // Start Polling POST /api/video-status every 4.5s
      pollStatus(opName, newJobId);
    } catch (err: any) {
      console.error('Generation start failed:', err);
      setGeneralError(err.message || 'Échec du démarrage de la génération vidéo.');
      setActiveJob(null);
    }
  };

  const pollStatus = (operationName: string, jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        if (!res.ok) {
          throw new Error('Erreur lors du suivi du rendu.');
        }

        const data = await res.json();

        if (data.error) {
          clearInterval(pollIntervalRef.current);
          setActiveJob(null);
          setGeneralError(`Erreur du moteur Veo : ${data.error}`);
          return;
        }

        if (data.done || data.hasVideo) {
          clearInterval(pollIntervalRef.current);

          const finalJob: GenerationJob = {
            id: jobId,
            operationName,
            status: 'completed',
            prompt,
            photoUrl: currentPhoto || undefined,
            aspectRatio,
            resolution,
            videoUrl: `/api/video-stream?operationName=${encodeURIComponent(operationName)}`,
            createdAt: Date.now(),
            progressPercent: 100,
            musicGenre: selectedGenre.name,
          };

          setActiveJob(null);
          setCompletedJob(finalJob);
          setHistoryJobs((prev) => [finalJob, ...prev]);

          // Bass drop on finish
          stadiumAudio.triggerBassDrop();
        }
      } catch (pollErr: any) {
        console.warn('Polling check error:', pollErr);
      }
    }, 4500);
  };

  const handleSelectTrackForVideo = (genreId: string, trackTitle: string) => {
    const found = MUSIC_GENRES.find((g) => g.id === genreId);
    if (found) {
      setSelectedGenre(found);
      stadiumAudio.setGenre(found.id);
    }
    if (!prompt.includes(trackTitle)) {
      setPrompt(prompt + `\n\n[Morceau officiel en performance : « ${trackTitle} » (${found?.name || ''})]`);
    }
    setActiveTab('studio');
  };

  const handleSelectStadiumForVideo = (stadiumName: string) => {
    if (!prompt.includes(stadiumName)) {
      setPrompt(prompt + `\n\n[Stade mondial sélectionné : ${stadiumName}]`);
    }
    setActiveTab('studio');
  };

  const handleSelectPhotoForStudio = (dataUrl: string, name: string) => {
    setCurrentPhoto(dataUrl);
    setPhotoName(name);
    setActiveTab('studio');
  };

  const handleSelectClipForVideoStudio = (promptSnippet: string, genreId: string) => {
    const found = MUSIC_GENRES.find((g) => g.id === genreId);
    if (found) {
      setSelectedGenre(found);
      stadiumAudio.setGenre(found.id);
    }
    setPrompt(promptSnippet);
    setActiveTab('studio');
  };

  const cancelActiveGeneration = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setActiveJob(null);
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aspectRatio={aspectRatio}
      onAspectRatioChange={setAspectRatio}
      activeCount={activeJob ? 1 : 0}
      genreName={selectedGenre.name}
      crowdVolume={crowdVolume}
      onCrowdVolumeChange={handleCrowdVolumeChange}
      soundActive={soundActive}
      onToggleSound={handleToggleSound}
      onSelectTrackForVideo={handleSelectTrackForVideo}
      onSelectClipForVideoStudio={handleSelectClipForVideoStudio}
      onSelectStadiumForVideo={handleSelectStadiumForVideo}
      onSelectPhotoForStudio={handleSelectPhotoForStudio}
    >
      <div className="space-y-8">
        {/* Hero Stadium Banner */}
        <section className="relative rounded-[16px] overflow-hidden border border-[#D4AF37]/30 bg-gradient-to-r from-[#181818] via-[#201c13] to-[#181818] p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold tracking-wider uppercase">
                <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Mali Rap World Tour • Oude Mill Live</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif] leading-tight">
                CONCERT GÉANT DE STADE EN VIDÉO ULTRA-RÉALISTE
              </h2>

              <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                Animez vos photos d'<strong>Oude Mill</strong> en un show mondial inoubliable : entrée sous escorte de sécurité, stade plein à craquer avec 100 000 spectateurs en transe, feux d'artifice monumentaux, lasers et qualité cinéma 4K propulsée par <strong>Google Veo 3.1 Fast</strong>.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              <div className="px-3.5 py-2 rounded-xl bg-[#1D1D1D] border border-[#2C2C2C] text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="text-zinc-300">Fidélité faciale préservée sans déformation</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#1D1D1D] border border-[#2C2C2C] text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Format vertical <strong>9:16</strong> (TikTok/Reel) ou large <strong>16:9</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Global Error Banner if any */}
        {generalError && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3 text-sm text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold">Information sur la génération</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">{generalError}</p>
            </div>
            <button
              type="button"
              onClick={() => setGeneralError(null)}
              className="text-xs text-rose-400 hover:text-white font-bold px-2 py-1"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Active Generation State Display */}
        {activeJob && (
          <GenerationProgress
            operationName={activeJob.operationName}
            aspectRatio={activeJob.aspectRatio}
            onCancel={cancelActiveGeneration}
          />
        )}

        {/* Completed Video Player */}
        {completedJob && !activeJob && (
          <VideoPlayerCard
            operationName={completedJob.operationName}
            videoUrl={completedJob.videoUrl}
            originalPhoto={completedJob.photoUrl}
            aspectRatio={completedJob.aspectRatio}
            promptUsed={completedJob.prompt}
            musicGenre={completedJob.musicGenre || selectedGenre.name}
            onRegenerate={startVideoGeneration}
          />
        )}

        {/* Workspace: 2 Column Layout (Uploader + Prompt & Director Studio) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Photo Source */}
          <div className="lg:col-span-5 space-y-4">
            <PhotoUploader
              currentPhoto={currentPhoto}
              onPhotoSelected={handlePhotoSelected}
              aspectRatio={aspectRatio}
            />

            {/* Stage settings card */}
            <div className="bg-[#1D1D1D] rounded-[16px] border border-[#2C2C2C] p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2 font-['Syne',sans-serif]">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Paramètres Moteur Veo 3.1</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Ratio toggle */}
                <div className="flex items-center justify-between py-1 border-b border-[#2C2C2C]">
                  <span className="text-zinc-400">Format d'export :</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        aspectRatio === '9:16'
                          ? 'bg-[#D4AF37] text-black shadow-sm'
                          : 'bg-[#252525] text-zinc-400 hover:text-white'
                      }`}
                    >
                      9:16 (Vertical)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        aspectRatio === '16:9'
                          ? 'bg-[#D4AF37] text-black shadow-sm'
                          : 'bg-[#252525] text-zinc-400 hover:text-white'
                      }`}
                    >
                      16:9 (Cinéma)
                    </button>
                  </div>
                </div>

                {/* Resolution */}
                <div className="flex items-center justify-between py-1 border-b border-[#2C2C2C]">
                  <span className="text-zinc-400">Résolution :</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setResolution('720p')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        resolution === '720p'
                          ? 'bg-[#D4AF37] text-black shadow-sm'
                          : 'bg-[#252525] text-zinc-400 hover:text-white'
                      }`}
                    >
                      720p HD
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolution('1080p')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        resolution === '1080p'
                          ? 'bg-[#D4AF37] text-black shadow-sm'
                          : 'bg-[#252525] text-zinc-400 hover:text-white'
                      }`}
                    >
                      1080p Full HD
                    </button>
                  </div>
                </div>

                {/* Camera Movement Dropdown */}
                <div className="py-2 border-b border-[#2C2C2C] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                      <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Mouvement de Caméra (Camera Movement) :</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/25 font-bold">
                      Contrainte IA
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={cameraMovement}
                      onChange={(e) => setCameraMovement(e.target.value)}
                      className="w-full bg-[#161616] border border-[#333] hover:border-[#D4AF37]/60 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-white text-xs font-semibold appearance-none focus:outline-none transition-all cursor-pointer shadow-inner pr-8"
                    >
                      {CAMERA_MOVEMENT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.name} className="bg-[#181818] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-zinc-400 italic truncate">
                      {CAMERA_MOVEMENT_OPTIONS.find((c) => c.name === cameraMovement)?.description}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyCameraConstraintToPrompt(cameraMovement)}
                      className="px-2 py-0.5 rounded bg-[#252525] hover:bg-[#303030] text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                      title="Injecter la consigne dans le prompt d'écriture"
                    >
                      + Insérer dans prompt
                    </button>
                  </div>
                </div>

                {/* Model */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Modèle Vidéo :</span>
                  <span className="font-mono text-[11px] text-[#D4AF37] bg-[#252525] px-2 py-0.5 rounded border border-[#D4AF37]/20">
                    veo-3.1-fast-generate-preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Music Genre + Prompt & Generation Launch */}
          <div className="lg:col-span-7 space-y-5">
            <MusicGenreSelector
              selectedGenreId={selectedGenre.id}
              onSelectGenre={handleSelectGenre}
              onApplyToPrompt={handleApplyGenreSnippet}
              crowdVolume={crowdVolume}
              onCrowdVolumeChange={handleCrowdVolumeChange}
              isAudioActive={soundActive}
              onToggleAudio={handleToggleSound}
            />

            <PromptEditor
              prompt={prompt}
              onPromptChange={setPrompt}
              onEnhanceWithAI={handleEnhancePrompt}
              isEnhancing={isEnhancing}
              selectedGenre={selectedGenre}
              crowdVolume={crowdVolume}
              onSelectGenre={handleSelectGenre}
              selectedCameraMovement={cameraMovement}
              onSelectCameraMovement={setCameraMovement}
            />

            {/* Launch Action Section */}
            <div className="bg-gradient-to-r from-[#181818] via-[#201c13] to-[#181818] rounded-[16px] border border-[#D4AF37]/40 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Zap className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-['Syne',sans-serif]">
                      Prêt pour le Tournage Virtuel
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Transforme instantanément la photo d'Oude Mill en vidéo de concert de stade 4K.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startVideoGeneration}
                  disabled={Boolean(activeJob)}
                  className={`w-full sm:w-auto px-7 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2.5 font-['Syne',sans-serif] ${
                    activeJob
                      ? 'bg-[#2A2A2A] text-zinc-500 cursor-not-allowed'
                      : 'bg-[#D4AF37] hover:bg-[#e6c148] text-black shadow-[#D4AF37]/30 hover:scale-[1.02] active:scale-[0.99]'
                  }`}
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {activeJob ? 'Tournage en cours...' : 'GÉNÉRER LA VIDÉO DU CONCERT'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* History Gallery */}
        <HistoryGallery
          jobs={historyJobs}
          onSelectJob={(job) => setCompletedJob(job)}
          onClearHistory={() => setHistoryJobs([])}
        />
      </div>
    </AppShell>
  );
}
