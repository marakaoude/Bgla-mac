import React, { useRef, useState, useEffect } from 'react';
import {
  Download,
  RotateCcw,
  Sparkles,
  Columns,
  Share2,
  Check,
  Film,
  HardDrive,
  FolderDown,
  AlertCircle,
  Wand2,
  Sliders,
  Eye,
  Camera,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import { AspectRatio } from '../types';
import { VideoShareModal } from './VideoShareModal';
import {
  downloadVideoToLocalStorage,
  shareVideoDirectly,
  isFileSystemAccessSupported,
} from '../utils/videoExport';
import { CINEMATIC_FILTER_OPTIONS } from '../data/cinematicFilters';

interface VideoPlayerCardProps {
  operationName: string;
  videoUrl?: string;
  originalPhoto?: string | null;
  aspectRatio: AspectRatio;
  promptUsed: string;
  musicGenre?: string;
  cameraMovement?: string;
  cinematicFilter?: string;
  onRegenerate?: () => void;
}

export const VideoPlayerCard: React.FC<VideoPlayerCardProps> = ({
  operationName,
  videoUrl,
  originalPhoto,
  aspectRatio,
  promptUsed,
  musicGenre,
  cameraMovement,
  cinematicFilter,
  onRegenerate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Cinematic post-processing filter state
  const [activeFilterId, setActiveFilterId] = useState<string>(() => {
    if (cinematicFilter) {
      const match = CINEMATIC_FILTER_OPTIONS.find(
        (f) =>
          f.name.toLowerCase() === cinematicFilter.toLowerCase() ||
          f.id.toLowerCase() === cinematicFilter.toLowerCase()
      );
      if (match) return match.id;
    }
    return 'grain-35mm';
  });

  const [filterIntensity, setFilterIntensity] = useState<number>(85);
  const [postFxToast, setPostFxToast] = useState<string | null>(null);

  // Sync if prop changes
  useEffect(() => {
    if (cinematicFilter) {
      const match = CINEMATIC_FILTER_OPTIONS.find(
        (f) =>
          f.name.toLowerCase() === cinematicFilter.toLowerCase() ||
          f.id.toLowerCase() === cinematicFilter.toLowerCase()
      );
      if (match) setActiveFilterId(match.id);
    }
  }, [cinematicFilter]);

  // If videoUrl is not explicitly given, use backend stream route
  const resolvedVideoSrc =
    videoUrl || `/api/video-stream?operationName=${encodeURIComponent(operationName)}`;

  const activeFilterPreset =
    CINEMATIC_FILTER_OPTIONS.find((f) => f.id === activeFilterId) ||
    CINEMATIC_FILTER_OPTIONS[0];

  const handleSelectFilter = (filterId: string) => {
    setActiveFilterId(filterId);
    const chosen = CINEMATIC_FILTER_OPTIONS.find((f) => f.id === filterId);
    if (chosen) {
      setPostFxToast(`Post-traitement cinématographique appliqué : ${chosen.name} (${filterIntensity}%)`);
      setTimeout(() => setPostFxToast(null), 3000);
    }
  };

  // Compute CSS filter string with intensity scaling
  const getComputedCssFilter = () => {
    if (activeFilterPreset.id === 'natural-cinema' || activeFilterPreset.cssFilter === 'none') {
      return 'none';
    }
    const factor = filterIntensity / 100;
    switch (activeFilterPreset.id) {
      case 'grain-35mm':
        return `sepia(${0.22 * factor}) contrast(${1 + 0.16 * factor}) brightness(${1 - 0.04 * factor}) saturate(${1 + 0.18 * factor})`;
      case 'vhs-glitch':
        return `contrast(${1 + 0.28 * factor}) saturate(${1 - 0.2 * factor}) hue-rotate(${-10 * factor}deg)`;
      case 'noir-blanc-contrast':
        return `grayscale(${1 * factor}) contrast(${1 + 0.5 * factor}) brightness(${1 - 0.05 * factor})`;
      case 'or-sahel':
        return `sepia(${0.35 * factor}) saturate(${1 + 0.45 * factor}) contrast(${1 + 0.18 * factor}) brightness(${1 + 0.05 * factor})`;
      case 'cyberpunk-neon':
        return `contrast(${1 + 0.3 * factor}) saturate(${1 + 0.8 * factor}) hue-rotate(${185 * factor}deg)`;
      case 'teal-orange':
        return `contrast(${1 + 0.2 * factor}) saturate(${1 + 0.3 * factor})`;
      default:
        return 'none';
    }
  };

  const handleQuickDownload = async (usePicker: boolean = false) => {
    try {
      setIsDownloading(true);
      setDownloadSuccessToast(null);
      const cleanRatio = aspectRatio.replace(':', 'x');
      const fileName = `Oude_Mill_Concert_${cleanRatio}_${activeFilterPreset.id}_${Date.now()}.mp4`;

      const result = await downloadVideoToLocalStorage(
        resolvedVideoSrc,
        fileName,
        usePicker
      );

      if (result.success) {
        setDownloadSuccessToast(result.message);
        setTimeout(() => setDownloadSuccessToast(null), 4000);
      }
    } catch (err: any) {
      console.error('Quick download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleQuickShare = async () => {
    try {
      const result = await shareVideoDirectly(
        resolvedVideoSrc,
        "Oude Mill - Concert Live Veo 3.1",
        `Regarde cette vidéo exclusive de concert d'Oude Mill (${musicGenre || 'Afro-Rap'}) avec post-traitement ${activeFilterPreset.name} ! 🎤🔥 #OudeMill #Veo31 #BGlaMac`,
        `Oude_Mill_Concert_${aspectRatio.replace(':', 'x')}.mp4`
      );
      if (result.success && result.method === 'clipboard') {
        setDownloadSuccessToast(result.message);
        setTimeout(() => setDownloadSuccessToast(null), 3000);
      }
    } catch {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="bg-[#1D1D1D] rounded-[16px] border border-[#2C2C2C] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background concert glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#D4AF37] text-black shadow-md font-bold">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black text-white uppercase tracking-wider font-['Syne',sans-serif]">
                Vidéo de Concert Oude Mill Prête !
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Veo 3.1 Fast HD
              </span>
              {musicGenre && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  🎵 {musicGenre}
                </span>
              )}
              {cameraMovement && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  🎥 {cameraMovement}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Format {aspectRatio} • Post-traitement actif : <strong className="text-[#D4AF37]">{activeFilterPreset.name}</strong>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {originalPhoto && (
            <button
              type="button"
              onClick={() => setShowCompare(!showCompare)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showCompare
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{showCompare ? 'Masquer Comparatif' : 'Comparer Photo & Vidéo'}</span>
            </button>
          )}

          {/* Direct Local Download */}
          <button
            type="button"
            onClick={() => handleQuickDownload(false)}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Enregistrer la vidéo MP4 sur le stockage local"
          >
            <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Téléchargement...' : 'Télécharger MP4'}</span>
          </button>

          {/* Choose Folder Download (If Supported) */}
          {isFileSystemAccessSupported() && (
            <button
              type="button"
              onClick={() => handleQuickDownload(true)}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#D4AF37] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Choisir le dossier local de sauvegarde (File System)"
            >
              <FolderDown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Dossier au choix</span>
            </button>
          )}

          {/* Full Direct Share & Export Modal */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#e6c148] text-black text-xs font-bold shadow-md shadow-[#D4AF37]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Partager directement ou exporter vers vos applications"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Partager</span>
          </button>
        </div>
      </div>

      {/* Success Notification Toast */}
      {downloadSuccessToast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadSuccessToast(null)}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Post-processing FX Switch Toast */}
      {postFxToast && (
        <div className="mb-4 p-3 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-between text-xs text-[#D4AF37] animate-fadeIn">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="font-semibold">{postFxToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setPostFxToast(null)}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Video Share Modal */}
      <VideoShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        videoUrl={resolvedVideoSrc}
        operationName={operationName}
        aspectRatio={aspectRatio}
        promptUsed={promptUsed}
        musicGenre={musicGenre}
      />

      {/* Interactive Cinematic Post-Processing Control Panel */}
      <div className="mb-4 p-4 rounded-2xl bg-[#141414] border border-[#2b2b2b] shadow-inner space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-black text-white uppercase tracking-wider font-['Syne',sans-serif]">
              Post-Traitement & Filtres Cinématographiques
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
              Temps Réel
            </span>
          </div>

          {/* Intensity Slider */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <span className="text-[11px] text-zinc-400 font-semibold">
              Intensité du filtre : <strong className="text-white font-mono">{filterIntensity}%</strong>
            </span>
            <input
              type="range"
              min={20}
              max={100}
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(Number(e.target.value))}
              className="w-24 accent-[#D4AF37] cursor-pointer"
            />
          </div>
        </div>

        {/* Filter Pills Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {CINEMATIC_FILTER_OPTIONS.map((f) => {
            const isSelected = activeFilterId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleSelectFilter(f.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer group ${
                  isSelected
                    ? 'bg-[#1e1b12] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
                    : 'bg-[#181818] border-[#292929] hover:border-zinc-600 hover:bg-[#202020]'
                }`}
                title={f.description}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base group-hover:scale-110 transition-transform">{f.icon}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isSelected
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-black/60 text-zinc-400'
                    }`}
                  >
                    {f.badge}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold truncate ${
                    isSelected ? 'text-[#D4AF37]' : 'text-zinc-200'
                  }`}
                >
                  {f.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filter Explanation Banner */}
        <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-sm">{activeFilterPreset.icon}</span>
            <span>
              <strong className="text-white">{activeFilterPreset.name} :</strong>{' '}
              {activeFilterPreset.description}
            </span>
          </div>
          {activeFilterPreset.id !== 'natural-cinema' && (
            <button
              type="button"
              onClick={() => handleSelectFilter('natural-cinema')}
              className="text-[11px] text-[#D4AF37] hover:underline font-semibold shrink-0 cursor-pointer"
            >
              Réinitialiser en Naturel
            </button>
          )}
        </div>
      </div>

      {/* Main Player / Comparison Area */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800/80 p-3 sm:p-5 flex flex-col items-center justify-center relative group">
        {showCompare && originalPhoto ? (
          /* Side-by-Side Comparison */
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Original Photo */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Photo originale d'Oude Mill
              </span>
              <div
                className={`relative overflow-hidden rounded-xl border border-zinc-800 flex items-center justify-center bg-black ${
                  aspectRatio === '9:16' ? 'w-[200px] h-[355px]' : 'w-full h-[240px]'
                }`}
              >
                <img
                  src={originalPhoto}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/75 px-2 py-0.5 rounded text-white font-mono">
                  Visage Original
                </span>
              </div>
            </div>

            {/* Generated Video with Live Post-Processing Filter */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Vidéo avec Post-Traitement {activeFilterPreset.name}
              </span>
              <div
                className={`relative overflow-hidden rounded-xl border border-rose-500/40 shadow-xl shadow-rose-950/30 flex items-center justify-center bg-black ${
                  aspectRatio === '9:16' ? 'w-[200px] h-[355px]' : 'w-full h-[240px]'
                }`}
              >
                <video
                  ref={videoRef}
                  src={resolvedVideoSrc}
                  autoPlay
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-cover transition-all"
                  style={{
                    filter: getComputedCssFilter(),
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Film overlays based on active filter */}
                {activeFilterPreset.id === 'grain-35mm' && (
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]" />
                )}
                {activeFilterPreset.id === 'vhs-glitch' && (
                  <div className="absolute inset-0 pointer-events-none vhs-scanlines opacity-50">
                    <div className="absolute top-2 left-2 text-[9px] font-mono text-red-500 font-bold bg-black/60 px-1 rounded">
                      REC ● 2026
                    </div>
                  </div>
                )}
                {activeFilterPreset.id === 'or-sahel' && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-amber-500/15 via-transparent to-yellow-500/10 mix-blend-color-dodge" />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Single Video Display with Live Cinematic Post-Processing */
          <div className="relative flex flex-col items-center w-full">
            <div
              className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl flex items-center justify-center transition-all ${
                aspectRatio === '9:16'
                  ? 'w-[280px] sm:w-[320px] h-[500px] sm:h-[570px] max-w-full'
                  : 'w-full max-w-3xl h-[360px] sm:h-[430px]'
              }`}
            >
              <video
                ref={videoRef}
                src={resolvedVideoSrc}
                autoPlay
                loop
                playsInline
                controls
                className="w-full h-full object-cover transition-all"
                style={{
                  filter: getComputedCssFilter(),
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Shaders & Texture Overlays */}
              {activeFilterPreset.id === 'grain-35mm' && (
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_90px_rgba(0,0,0,0.75)]" />
              )}
              {activeFilterPreset.id === 'vhs-glitch' && (
                <div className="absolute inset-0 pointer-events-none vhs-scanlines opacity-55">
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400 font-bold bg-black/70 px-2 py-0.5 rounded border border-emerald-500/30">
                    PLAY ▶ SP
                  </div>
                  <div className="absolute bottom-12 left-3 text-[10px] font-mono text-red-400 font-bold bg-black/70 px-2 py-0.5 rounded border border-red-500/30">
                    REC ● 28 DEC 2026
                  </div>
                </div>
              )}
              {activeFilterPreset.id === 'or-sahel' && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-amber-500/20 via-transparent to-yellow-500/10 mix-blend-color-dodge" />
              )}
              {activeFilterPreset.id === 'cyberpunk-neon' && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-cyan-500/20 via-transparent to-pink-500/20 mix-blend-screen" />
              )}

              {/* Watermark badge with active post-processing tag */}
              <div className="absolute top-3 left-3 pointer-events-none bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 text-[11px] text-white font-medium shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Oude Mill Live</span>
                <span className="text-zinc-400">•</span>
                <span className="text-[#D4AF37] font-bold">{activeFilterPreset.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick controls bar below video */}
        <div className="mt-4 w-full flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-900 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              Post-traitement vidéo actif : <strong className="text-white">{activeFilterPreset.name}</strong> ({filterIntensity}%)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPromptDetails(!showPromptDetails)}
              className="text-zinc-400 hover:text-white underline text-[11px] cursor-pointer"
            >
              {showPromptDetails ? 'Masquer le prompt utilisé' : 'Voir le prompt utilisé'}
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 text-[#D4AF37] hover:text-amber-300 font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Relancer une variation</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible prompt details */}
        {showPromptDetails && (
          <div className="mt-3 w-full p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {promptUsed}
          </div>
        )}
      </div>
    </div>
  );
};
