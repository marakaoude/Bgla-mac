import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Search,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  UserCheck,
  DoorOpen,
  MapPin,
  Calendar,
  X,
  Sparkles,
  Smartphone,
  Check,
  RefreshCw,
  Clock,
  Crown,
  Star,
  Users,
} from 'lucide-react';
import jsQR from 'jsqr';
import { PurchasedTicket } from '../../types';
import { PRE_SEEDED_TICKETS } from '../../data/mockData';
import { apiClient } from '../../utils/apiClient';

interface TicketScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketScanned?: (ticket: PurchasedTicket) => void;
}

export const TicketScannerModal: React.FC<TicketScannerModalProps> = ({
  isOpen,
  onClose,
  onTicketScanned,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Verification result state
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'valid' | 'already_used' | 'invalid';
    ticket?: PurchasedTicket;
    message?: string;
  }>({ status: 'idle' });

  // Scan logs
  const [scanHistory, setScanHistory] = useState<{
    id: string;
    ticketRef: string;
    buyerName: string;
    tier: string;
    status: 'valid' | 'already_used' | 'invalid';
    timestamp: string;
  }[]>([]);

  // Video and Canvas refs for real-time QR scanning
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Play audio tones using Web Audio API
  const playTone = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        // High pleasant double chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'warning') {
        // Warning buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.setValueAtTime(260, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
      } else {
        // Low error buzz
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch {
      // Audio fallback silent
    }
  };

  // Retrieve all tickets from localStorage or mockData
  const getAllTickets = (): PurchasedTicket[] => {
    try {
      const saved = localStorage.getItem('bgla_mac_tickets');
      if (saved) {
        const parsed = JSON.parse(saved) as PurchasedTicket[];
        // Merge with pre-seeded if not present
        const merged = [...parsed];
        PRE_SEEDED_TICKETS.forEach((seed) => {
          if (!merged.some((t) => t.id === seed.id || t.transactionRef === seed.transactionRef)) {
            merged.push(seed);
          }
        });
        return merged;
      }
    } catch (e) {
      console.error(e);
    }
    return PRE_SEEDED_TICKETS;
  };

  const handleVerifyCode = (code: string) => {
    const query = code.trim();
    if (!query) return;

    const tickets = getAllTickets();
    // Search by qrHash, transactionRef, or ticket ID
    const found = tickets.find(
      (t) =>
        t.qrHash.toLowerCase() === query.toLowerCase() ||
        t.transactionRef.toLowerCase() === query.toLowerCase() ||
        t.id.toLowerCase() === query.toLowerCase() ||
        (query.length >= 6 && t.transactionRef.toLowerCase().includes(query.toLowerCase()))
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!found) {
      playTone('error');
      setScanResult({
        status: 'invalid',
        message: 'Code inconnu ou billet introuvable. Contrefaçon suspectée.',
      });
      setScanHistory((prev) => [
        {
          id: Math.random().toString(),
          ticketRef: query,
          buyerName: 'Inconnu',
          tier: 'Invalide',
          status: 'invalid',
          timestamp: timeStr,
        },
        ...prev.slice(0, 19),
      ]);
      return;
    }

    if (found.status === 'used') {
      playTone('warning');
      setScanResult({
        status: 'already_used',
        ticket: found,
        message: `ALERTE : Ce billet a déjà été validé à l’entrée (${found.usedAt || 'précédemment'}). Fraude de duplication détectée !`,
      });
      setScanHistory((prev) => [
        {
          id: Math.random().toString(),
          ticketRef: found.transactionRef,
          buyerName: found.buyerName,
          tier: found.tier.toUpperCase(),
          status: 'already_used',
          timestamp: timeStr,
        },
        ...prev.slice(0, 19),
      ]);
    } else {
      playTone('success');
      setScanResult({
        status: 'valid',
        ticket: found,
        message: `Billet Authentique et Valide ! Place attribuée : ${found.seatNumber}.`,
      });
      setScanHistory((prev) => [
        {
          id: Math.random().toString(),
          ticketRef: found.transactionRef,
          buyerName: found.buyerName,
          tier: found.tier.toUpperCase(),
          status: 'valid',
          timestamp: timeStr,
        },
        ...prev.slice(0, 19),
      ]);
      onTicketScanned?.(found);
    }
  };

  // Stamp and validate ticket as USED both locally and on the server database
  const handlePunchTicket = async (ticketToPunch: PurchasedTicket) => {
    try {
      // Async server call to punch ticket on backend database
      apiClient.punchTicket(ticketToPunch.qrHash, 'Guichetier BGla Mac #01').catch((err) => {
        console.warn('Server punch error:', err);
      });

      const tickets = getAllTickets();
      const nowStr = `${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      const updated = tickets.map((t) => {
        if (t.id === ticketToPunch.id || t.transactionRef === ticketToPunch.transactionRef) {
          return {
            ...t,
            status: 'used' as const,
            usedAt: nowStr,
            scannedBy: 'Guichetier BGla Mac #01',
          };
        }
        return t;
      });

      localStorage.setItem('bgla_mac_tickets', JSON.stringify(updated));

      // Update current result
      setScanResult({
        status: 'already_used',
        ticket: {
          ...ticketToPunch,
          status: 'used',
          usedAt: nowStr,
          scannedBy: 'Guichetier BGla Mac #01',
        },
        message: `Billet composté avec succès ! Entrée autorisée pour ${ticketToPunch.buyerName}. Enregistré sur la base de données.`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Reset current scan
  const handleResetScan = () => {
    setScanResult({ status: 'idle' });
    setManualCode('');
  };

  // Camera handling for QR scanning
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès à la caméra n'est pas supporté par ce navigateur.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      setCameraError("Impossible d'accéder à la caméra (autorisation refusée ou absence de périphérique). Utilisez les boutons de simulation rapide ci-dessous !");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraActive(false);
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleVerifyCode(code.data);
            stopCamera();
            return;
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const validScansCount = scanHistory.filter((h) => h.status === 'valid').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#222222] bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-300 p-0.5 flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <div className="w-full h-full bg-[#101010] rounded-[10px] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase font-['Syne',sans-serif] tracking-wide">
                  Scanner d’Entrée • BGla Mac
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Contrôle d’Accès Direct
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Vérification instantanée Standard, VIP, VVIP & détection des doublons
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                soundEnabled
                  ? 'bg-[#1e1e1e] border-[#333] text-[#D4AF37]'
                  : 'bg-[#181818] border-[#222] text-zinc-500'
              }`}
              title={soundEnabled ? 'Son actif' : 'Son coupé'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-zinc-400 hover:text-white border border-[#2e2e2e] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Real-time stats bar */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#181818] rounded-xl border border-[#262626]">
            <div className="text-center">
              <div className="text-xs text-zinc-400">Total Scans</div>
              <div className="text-base font-extrabold text-white font-mono">{scanHistory.length}</div>
            </div>
            <div className="text-center border-x border-[#282828]">
              <div className="text-xs text-emerald-400">Entrées Validées</div>
              <div className="text-base font-extrabold text-emerald-400 font-mono">{validScansCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-amber-400">Doublons / Rejets</div>
              <div className="text-base font-extrabold text-amber-400 font-mono">
                {scanHistory.filter((h) => h.status !== 'valid').length}
              </div>
            </div>
          </div>

          {/* Scanner view & Camera area */}
          <div className="relative rounded-2xl bg-[#090909] border border-[#222] overflow-hidden">
            {cameraActive ? (
              <div className="relative aspect-video w-full flex items-center justify-center bg-black">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* Animated scanner overlay box */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-56 h-56 border-2 border-[#D4AF37] rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                    {/* Animated scanning laser line */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse shadow-[0_0_10px_#D4AF37]" style={{ top: '45%' }} />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Cible QR Code
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-xs border border-zinc-700 backdrop-blur-sm"
                >
                  Arrêter Caméra
                </button>
              </div>
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center">
                  <Camera className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scanner avec la Caméra du Smartphone / PC</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    Pointez l’objectif vers le QR code sur l’écran du spectateur ou son billet imprimé.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/20 transition-all inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activer la Caméra Scanner</span>
                </button>

                {cameraError && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs text-left flex items-start gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick simulator buttons (Ensures immediate testing regardless of physical camera availability) */}
          <div className="bg-[#161616] border border-[#262626] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Simulateur de scan rapide (Tests Démo) :
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">1-Clic pour tester</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleVerifyCode('BGLA-VVIP-2026-001')}
                className="p-2 rounded-lg bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <Crown className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-bold">Billet VVIP</span>
                <span className="text-[9px] text-zinc-400">50 000 FCFA</span>
              </button>

              <button
                type="button"
                onClick={() => handleVerifyCode('BGLA-VIP-2026-042')}
                className="p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 text-amber-200 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold">Billet VIP</span>
                <span className="text-[9px] text-zinc-400">25 000 FCFA</span>
              </button>

              <button
                type="button"
                onClick={() => handleVerifyCode('BGLA-STD-2026-889')}
                className="p-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold">Standard</span>
                <span className="text-[9px] text-zinc-400">10 000 FCFA</span>
              </button>

              <button
                type="button"
                onClick={() => handleVerifyCode('BGLA-USED-2026-999')}
                className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-200 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] font-bold">Déjà Utilisé</span>
                <span className="text-[9px] text-zinc-400">Alerte Fraude</span>
              </button>
            </div>
          </div>

          {/* Manual input search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode(manualCode)}
                placeholder="Entrer référence billet (ex: BGLA-VVIP-2026-001)..."
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="button"
              onClick={() => handleVerifyCode(manualCode)}
              className="px-4 py-2 rounded-xl bg-[#262626] hover:bg-[#333] text-white text-xs font-bold border border-[#3a3a3a] transition-colors"
            >
              Vérifier
            </button>
          </div>

          {/* Validation Result Box */}
          {scanResult.status !== 'idle' && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                scanResult.status === 'valid'
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : scanResult.status === 'already_used'
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                  : 'bg-red-950/30 border-red-500/50 text-red-200'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {scanResult.status === 'valid' && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  {scanResult.status === 'already_used' && (
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  {scanResult.status === 'invalid' && (
                    <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider font-['Syne',sans-serif]">
                      {scanResult.status === 'valid' && 'ACCÈS AUTORISÉ • BILLET VALIDE'}
                      {scanResult.status === 'already_used' && 'ALERTE : BILLET DÉJÀ COMPOSTÉ'}
                      {scanResult.status === 'invalid' && 'ACCÈS REFUSÉ • BILLET INCONNU'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">{scanResult.message}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetScan}
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-zinc-300 hover:text-white"
                  title="Réinitialiser"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ticket Details Inspection */}
              {scanResult.ticket && (
                <div className="mt-4 pt-3 border-t border-current/20 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/30 p-2.5 rounded-xl">
                      <span className="text-[10px] text-zinc-400 block">Spectateur</span>
                      <strong className="text-white text-xs">{scanResult.ticket.buyerName}</strong>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{scanResult.ticket.buyerPhone}</span>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-xl">
                      <span className="text-[10px] text-zinc-400 block">Catégorie & Tarif</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-0.5 ${
                          scanResult.ticket.tier === 'vvip'
                            ? 'bg-purple-500 text-white'
                            : scanResult.ticket.tier === 'vip'
                            ? 'bg-[#D4AF37] text-black'
                            : 'bg-emerald-500 text-black'
                        }`}
                      >
                        {scanResult.ticket.tier.toUpperCase()} • {scanResult.ticket.priceFCFA.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-black/30 p-2 rounded-xl">
                      <span className="text-[10px] text-zinc-400 block">Porte d’Accès</span>
                      <span className="text-white font-semibold">{scanResult.ticket.gateNumber}</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl">
                      <span className="text-[10px] text-zinc-400 block">Siège / Emplacement</span>
                      <span className="text-white font-semibold">{scanResult.ticket.seatNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 pt-1">
                    <span>Réf : {scanResult.ticket.transactionRef}</span>
                    <span>Paiement : {scanResult.ticket.paymentMethod.toUpperCase()}</span>
                  </div>

                  {/* Compost button if still valid */}
                  {scanResult.status === 'valid' && (
                    <button
                      type="button"
                      onClick={() => handlePunchTicket(scanResult.ticket!)}
                      className="w-full mt-3 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>COMPOSTER & ENREGISTRER L’ENTRÉE</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recent scan audit history */}
          {scanHistory.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Journal Récent des Entrées ({scanHistory.length}) :
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#161616] border border-[#222]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.status === 'valid'
                            ? 'bg-emerald-400'
                            : item.status === 'already_used'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`}
                      />
                      <span className="text-white font-semibold">{item.buyerName}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({item.tier})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <span>{item.timestamp}</span>
                      <span className="font-mono text-zinc-400">{item.ticketRef}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#222] bg-[#141414] flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            Système BGla Mac Verif v2.4 • Anti-fraude & Anti-doublon
          </span>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#2c2c2c] text-white text-xs font-semibold"
          >
            Fermer le Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
