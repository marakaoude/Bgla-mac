import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Scissors,
  Wand2,
  Type,
  Music,
  Smile,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Check,
  Download,
  Share2,
  Video,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  ChevronRight,
  Flame,
  ArrowRight,
  Smartphone,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  TikTokVideo,
  VideoFilterEffect,
  TikTokTextOverlay,
} from '../../types';
import {
  VIDEO_FILTERS,
  STOCK_CLIPS_FOR_STUDIO,
  MUSIC_SOUNDTRACKS_CATALOG,
} from '../../data/tikTokData';
import { stadiumAudio } from '../../utils/audioSimulator';

interface TikTokStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishVideo: (video: TikTokVideo) => void;
  initialSoundtrackId?: string;
}

export const TikTokStudioModal: React.FC<TikTokStudioModalProps> = ({
  isOpen,
  onClose,
  onPublishVideo,
  initialSoundtrackId,
}) => {
  // Video Source state
  const [selectedStockId, setSelectedStockId] = useState(STOCK_CLIPS_FOR_STUDIO[0].id);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState('');

  // Editing state
  const [speed, setSpeed] = useState<number>(1.0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(15);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');

  // Filter effect state
  const [activeFilterId, setActiveFilterId] = useState<VideoFilterEffect>('gold_sahel');
  const [effectIntensity, setEffectIntensity] = useState<number>(85);

  // Text overlay state
  const [overlayText, setOverlayText] = useState('🔥 28 DÉCEMBRE AU STADE DU 26-MARS !');
  const [textStyle, setTextStyle] = useState<'tiktok' | 'neon' | 'headline' | 'subtitles'>('tiktok');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('top');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textBgColor, setTextBgColor] = useState('#D4AF37');
  const [showText, setShowText] = useState(true);

  // Stickers state
  const [activeStickers, setActiveStickers] = useState<string[]>(['🔥', '🇲🇱', '👑']);

  // Music state
  const [selectedMusicId, setSelectedMusicId] = useState(
    initialSoundtrackId || MUSIC_SOUNDTRACKS_CATALOG[0].id
  );
  const [videoAudioVolume, setVideoAudioVolume] = useState<number>(40);
  const [musicTrackVolume, setMusicTrackVolume] = useState<number>(90);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  // Post description
  const [caption, setCaption] = useState('Nouveau son & répétitions avant le méga concert au Stade du 26-Mars ! 🇲🇱🔥 #BGlaMac #BamakoByNight');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Preview video playback
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Current selected stock video
  const activeStock = STOCK_CLIPS_FOR_STUDIO.find((s) => s.id === selectedStockId) || STOCK_CLIPS_FOR_STUDIO[0];
  const activeVideoSrc = customVideoUrl || activeStock.videoUrl;

  // Selected music
  const activeMusic = MUSIC_SOUNDTRACKS_CATALOG.find((m) => m.id === selectedMusicId) || MUSIC_SOUNDTRACKS_CATALOG[0];

  // Active filter
  const activeFilterPreset = VIDEO_FILTERS.find((f) => f.id === activeFilterId) || VIDEO_FILTERS[0];

  useEffect(() => {
    if (initialSoundtrackId) {
      setSelectedMusicId(initialSoundtrackId);
    }
  }, [initialSoundtrackId]);

  // Adjust video playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setCustomVideoName(file.name);
    }
  };

  const handleToggleSticker = (sticker: string) => {
    if (activeStickers.includes(sticker)) {
      setActiveStickers(activeStickers.filter((s) => s !== sticker));
    } else {
      setActiveStickers([...activeStickers, sticker]);
    }
  };

  const handlePlayMusicTest = () => {
    setIsPlayingAudioPreview(true);
    stadiumAudio.playMusicalPreview(activeMusic.genreId);
    setTimeout(() => {
      setIsPlayingAudioPreview(false);
    }, 2500);
  };

  const handlePublish = () => {
    setIsPublishing(true);

    const newVideo: TikTokVideo = {
      id: `tt-user-${Date.now()}`,
      videoUrl: activeVideoSrc,
      thumbnailUrl: activeStock.thumbnail,
      artistName: 'Oude Mill & Vous',
      artistHandle: 'createur_bgla',
      artistAvatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      description: caption,
      tags: ['#BGlaTok', '#MontageMali', '#StudioBGla', '#OudeMill'],
      musicTitle: activeMusic.title,
      musicAuthor: activeMusic.artist,
      musicGenreId: activeMusic.genreId,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      isSaved: false,
      isFollowing: true,
      filterEffect: activeFilterId,
      effectIntensity: effectIntensity,
      textOverlays: showText
        ? [
            {
              id: `txt-${Date.now()}`,
              text: overlayText,
              style: textStyle,
              position: textPosition,
              color: textColor,
              bgColor: textBgColor,
            },
          ]
        : [],
      stickers: activeStickers,
      category: 'pour-toi',
      viewsCount: '1',
      speed: speed,
      createdAt: 'À l’instant',
      comments: [
        {
          id: `c-init-${Date.now()}`,
          userName: 'BGla Mac Studio',
          userHandle: '@bglamac_system',
          userAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80',
          comment: 'Félicitations pour votre montage avec effets et son synchronisé ! 🔥🇲🇱',
          timeAgo: 'À l’instant',
          likes: 1,
          isLiked: true,
        },
      ],
    };

    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      onPublishVideo(newVideo);
      setTimeout(() => {
        setPublishSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  if (!isOpen) return null;

  // Compute CSS filter string with intensity scaling
  const getComputedCssFilter = () => {
    if (activeFilterPreset.id === 'none') return 'none';
    const factor = effectIntensity / 100;
    switch (activeFilterPreset.id) {
      case 'gold_sahel':
        return `sepia(${0.35 * factor}) saturate(${1 + 0.4 * factor}) contrast(${1 + 0.15 * factor}) brightness(${1 + 0.05 * factor})`;
      case 'vhs_retro':
        return `contrast(${1 + 0.25 * factor}) saturate(${1 - 0.15 * factor}) hue-rotate(${-10 * factor}deg)`;
      case 'cyberpunk':
        return `contrast(${1 + 0.3 * factor}) saturate(${1 + 0.8 * factor}) hue-rotate(${190 * factor}deg)`;
      case 'bass_shake':
        return `contrast(${1 + 0.35 * factor}) saturate(${1 + 0.5 * factor})`;
      case 'strobe_flash':
        return `contrast(${1 + 0.2 * factor}) brightness(${1 + 0.15 * factor})`;
      case 'cinema_35mm':
        return `sepia(${0.25 * factor}) contrast(${1 + 0.15 * factor}) brightness(0.96)`;
      case 'noir_blanc':
        return `grayscale(${1 * factor}) contrast(${1 + 0.4 * factor})`;
      case 'hologram':
        return `hue-rotate(${90 * factor}deg) saturate(${1 + 0.6 * factor})`;
      case 'glitch':
        return `contrast(${1 + 0.35 * factor}) saturate(${1 + 0.3 * factor})`;
      default:
        return 'none';
    }
  };

  // Compute animated classes
  const getFilterAnimationClass = () => {
    if (activeFilterPreset.id === 'bass_shake') return 'animate-bass-shake';
    if (activeFilterPreset.id === 'strobe_flash') return 'animate-strobe-pulse';
    if (activeFilterPreset.id === 'glitch') return 'animate-glitch-shift';
    return '';
  };

  const QUICK_PUNCHLINES = [
    '🔥 BKO EN FEU !',
    '⚡ LE HIT DE L’ANNÉE',
    '👑 BGLA MAC N°1 AU MALI',
    '🇲🇱 FIERTÉ NATIONALE',
    '🎫 RDV LE 28 DÉCEMBRE AU 26-MARS',
    '🎧 ÉCOUTEZ AVEC UN CASQUE',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div
        className="w-full max-w-5xl bg-[#141414] border border-[#2e2e2e] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Studio Bar */}
        <div className="p-4 sm:px-6 border-b border-[#242424] bg-[#111111] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-[#D4AF37] flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#D4AF37]/20">
              <Wand2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-['Syne',sans-serif]">
                  Studio BGla Tok • Montage & Effets Vidéo
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-mono">
                  Éditeur 9:16
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Créez, découpez, ajoutez des effets néon/bass-shake, des punchlines et synchronisez la musique.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

        {/* Studio Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-[#242424]">
          {/* Left Column: Live 9:16 TikTok Vertical Preview Player */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-[#0e0e0e] flex flex-col items-center justify-center">
            <div className="text-center mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                Aperçu Vidéo en Direct (Format {aspectRatio})
              </span>
            </div>

            {/* Vertical TikTok Phone Container */}
            <div
              className={`relative bg-black rounded-[28px] border-4 border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.9),0_0_15px_rgba(212,175,55,0.15)] overflow-hidden flex items-center justify-center ${
                aspectRatio === '9:16'
                  ? 'w-[280px] h-[500px]'
                  : aspectRatio === '1:1'
                  ? 'w-[320px] h-[320px]'
                  : 'w-[360px] h-[202px]'
              }`}
            >
              {/* HTML5 Video preview */}
              <video
                ref={videoRef}
                src={activeVideoSrc}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover transition-all ${getFilterAnimationClass()}`}
                style={{
                  filter: getComputedCssFilter(),
                }}
              />

              {/* Dynamic Overlay Shader class */}
              {activeFilterPreset.overlayClass && (
                <div className={`absolute inset-0 pointer-events-none ${activeFilterPreset.overlayClass}`} />
              )}

              {/* VHS Scanlines if VHS filter active */}
              {activeFilterPreset.id === 'vhs_retro' && (
                <div className="absolute inset-0 pointer-events-none vhs-scanlines opacity-50">
                  <div className="absolute top-3 left-3 text-[10px] font-mono text-red-500 font-bold bg-black/60 px-1 rounded">
                    REC ● 2026
                  </div>
                </div>
              )}

              {/* Speed indicator badge */}
              {speed !== 1 && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/75 border border-amber-400/50 text-[#D4AF37] text-[10px] font-bold font-mono">
                  {speed}x
                </div>
              )}

              {/* Text Overlay Render */}
              {showText && overlayText && (
                <div
                  className={`absolute inset-x-3 pointer-events-none flex justify-center ${
                    textPosition === 'top'
                      ? 'top-10'
                      : textPosition === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-20'
                  }`}
                >
                  <div
                    className={`max-w-[90%] text-center font-bold px-3 py-1.5 rounded-xl text-xs shadow-xl transition-all ${
                      textStyle === 'tiktok'
                        ? 'bg-[#D4AF37] text-black font-extrabold uppercase font-[\'Syne\',sans-serif]'
                        : textStyle === 'neon'
                        ? 'bg-black/80 text-yellow-300 border border-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                        : textStyle === 'headline'
                        ? 'bg-red-600 text-white uppercase tracking-wider font-black text-sm'
                        : 'bg-black/90 text-white border border-zinc-700 text-[11px]'
                    }`}
                    style={{
                      color: textStyle === 'tiktok' ? '#000' : textColor,
                      backgroundColor: textStyle === 'tiktok' ? textBgColor : undefined,
                    }}
                  >
                    {overlayText}
                  </div>
                </div>
              )}

              {/* Stickers Overlays Render */}
              {activeStickers.length > 0 && (
                <div className="absolute top-12 right-3 flex flex-col gap-1.5 pointer-events-none z-10">
                  {activeStickers.map((sticker, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-base shadow-md animate-bounce"
                      style={{ animationDuration: `${1.2 + idx * 0.3}s` }}
                    >
                      {sticker}
                    </div>
                  ))}
                </div>
              )}

              {/* Audio Track Badge Overlay */}
              <div className="absolute bottom-3 inset-x-3 bg-black/70 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Music className="w-3 h-3" />
                  </div>
                  <span className="text-zinc-200 font-bold truncate">{activeMusic.title}</span>
                </div>
                <span className="text-[9px] text-[#D4AF37] font-mono shrink-0">{activeMusic.bpm}</span>
              </div>
            </div>

            {/* Quick playback control buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    } else {
                      videoRef.current.play();
                      setIsPlaying(true);
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Lecture'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                    setIsPlaying(true);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recommencer</span>
              </button>

              <button
                type="button"
                onClick={handlePlayMusicTest}
                className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Tester le son audio synchronisé"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudioPreview ? 'animate-ping' : ''}`} />
                <span>Tester Son ({activeMusic.genreName})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Creative Editing Toolbars & Controls */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Step 1: Video Source */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#D4AF37]" />
                  1. Source Vidéo & Clips
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[#D4AF37] text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer ma vidéo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {customVideoName && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
                  <span>Vidéo importée : <strong>{customVideoName}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomVideoUrl(null);
                      setCustomVideoName('');
                    }}
                    className="underline text-[11px] hover:text-white"
                  >
                    Réinitialiser
                  </button>
                </div>
              )}

              {/* Stock clips carousel */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STOCK_CLIPS_FOR_STUDIO.map((clip) => {
                  const isSelected = selectedStockId === clip.id && !customVideoUrl;
                  return (
                    <div
                      key={clip.id}
                      onClick={() => {
                        setSelectedStockId(clip.id);
                        setCustomVideoUrl(null);
                        setCustomVideoName('');
                        if (clip.recommendedFilter) {
                          setActiveFilterId(clip.recommendedFilter as VideoFilterEffect);
                        }
                      }}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1 relative overflow-hidden group ${
                        isSelected
                          ? 'bg-[#1e1c14] border-[#D4AF37] shadow-md shadow-[#D4AF37]/15'
                          : 'bg-[#181818] border-[#292929] hover:border-zinc-700'
                      }`}
                    >
                      <div className="h-16 rounded-lg overflow-hidden bg-zinc-900 relative">
                        <img
                          src={clip.thumbnail}
                          alt={clip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-white">
                          {clip.duration}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-white truncate">{clip.title}</h4>
                        <p className="text-[10px] text-zinc-400 truncate">{clip.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Montage & Trimming */}
            <div className="space-y-3 pt-3 border-t border-[#242424]">
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-4 h-4 text-purple-400" />
                2. Découpage & Vitesse de Montage
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#181818] p-3.5 rounded-2xl border border-[#262626]">
                {/* Speed buttons */}
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1.5 font-semibold">
                    Vitesse de lecture :
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[0.5, 1.0, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSpeed(s)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          speed === s
                            ? 'bg-[#D4AF37] text-black shadow-md'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {s === 0.5 ? '0.5x (Slow)' : `${s}x`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio selector */}
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1.5 font-semibold">
                    Format Vidéo :
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: '9:16' as const, label: '9:16 (TikTok)' },
                      { id: '1:1' as const, label: '1:1 (Carré)' },
                      { id: '16:9' as const, label: '16:9 (Cinéma)' },
                    ].map((ratio) => (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          aspectRatio === ratio.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trimmer sliders */}
              <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Plage de découpage :</span>
                  <span className="font-mono text-[#D4AF37] font-bold">
                    {trimStart}s - {trimEnd}s (Durée : {trimEnd - trimStart}s)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Début (s)</label>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={trimStart}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < trimEnd) setTrimStart(val);
                      }}
                      className="w-full accent-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Fin (s)</label>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      value={trimEnd}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > trimStart) setTrimEnd(val);
                      }}
                      className="w-full accent-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Visual Effects & Filters */}
            <div className="space-y-3 pt-3 border-t border-[#242424]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  3. Effets Spéciaux & Filtres Visuels (10 Shaders)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-mono">Intensité : {effectIntensity}%</span>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={effectIntensity}
                    onChange={(e) => setEffectIntensity(Number(e.target.value))}
                    className="w-20 accent-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {VIDEO_FILTERS.map((f) => {
                  const isSelected = activeFilterId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilterId(f.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1b261e] border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-[#181818] border-[#292929] hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{f.icon}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/60 text-zinc-300">
                          {f.badge}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white truncate">{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Textes, Titres & Punchlines */}
            <div className="space-y-3 pt-3 border-t border-[#242424]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4 text-amber-400" />
                  4. Textes & Punchlines sur la Vidéo
                </label>
                <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showText}
                    onChange={(e) => setShowText(e.target.checked)}
                    className="accent-[#D4AF37]"
                  />
                  <span>Activer le texte</span>
                </label>
              </div>

              {showText && (
                <div className="space-y-2.5 bg-[#181818] p-3.5 rounded-2xl border border-[#262626]">
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Écrivez votre punchline ou titre..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />

                  {/* Punchline suggestion chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_PUNCHLINES.map((pl) => (
                      <button
                        key={pl}
                        type="button"
                        onClick={() => setOverlayText(pl)}
                        className="px-2 py-1 rounded-lg bg-[#242424] hover:bg-[#303030] text-[10px] text-zinc-300 hover:text-white transition-colors"
                      >
                        {pl}
                      </button>
                    ))}
                  </div>

                  {/* Style and position row */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Style de texte :</span>
                      <select
                        value={textStyle}
                        onChange={(e) => setTextStyle(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-black border border-zinc-700 text-white text-xs"
                      >
                        <option value="tiktok">Bouton TikTok Doré (Gros impact)</option>
                        <option value="neon">Néon Sahel Fluo</option>
                        <option value="headline">Gros Titre Flash Rouge</option>
                        <option value="subtitles">Sous-titres Karaoké</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Position :</span>
                      <div className="flex gap-1">
                        {(['top', 'center', 'bottom'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setTextPosition(pos)}
                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-colors ${
                              textPosition === pos
                                ? 'bg-[#D4AF37] text-black font-extrabold'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {pos === 'top' ? 'Haut' : pos === 'center' ? 'Milieu' : 'Bas'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Stickers & Badges */}
            <div className="space-y-3 pt-3 border-t border-[#242424]">
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Smile className="w-4 h-4 text-pink-400" />
                5. Autocollants & Stickers TikTok
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {['🔥', '🇲🇱', '👑', '⚡', '🎵', '💎', '🚀', '🎤', '❤️', '👏'].map((sticker) => {
                  const isActive = activeStickers.includes(sticker);
                  return (
                    <button
                      key={sticker}
                      type="button"
                      onClick={() => handleToggleSticker(sticker)}
                      className={`px-3 py-1.5 rounded-xl text-base transition-all border ${
                        isActive
                          ? 'bg-pink-600/30 border-pink-400 scale-105 shadow-md shadow-pink-500/20'
                          : 'bg-[#181818] border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      {sticker}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 6: Audio & Music Sync */}
            <div className="space-y-3 pt-3 border-t border-[#242424]">
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Music className="w-4 h-4 text-[#D4AF37]" />
                6. Choix du Son & Mixage Musical
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MUSIC_SOUNDTRACKS_CATALOG.map((m) => {
                  const isSelected = selectedMusicId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMusicId(m.id);
                        stadiumAudio.playMusicalPreview(m.genreId);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#1e1b12] border-[#D4AF37] shadow-md shadow-[#D4AF37]/15'
                          : 'bg-[#181818] border-[#292929] hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <img
                          src={m.coverUrl}
                          alt={m.title}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white truncate">{m.title}</h4>
                          <span className="text-[10px] text-zinc-400">{m.genreName} • {m.bpm}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] shrink-0">
                        {m.badge}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Volume balance sliders */}
              <div className="grid grid-cols-2 gap-4 bg-[#181818] p-3 rounded-xl border border-[#262626]">
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Son original de la vidéo :</span>
                    <span className="font-mono">{videoAudioVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={videoAudioVolume}
                    onChange={(e) => setVideoAudioVolume(Number(e.target.value))}
                    className="w-full accent-zinc-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#D4AF37] mb-1 font-semibold">
                    <span>Musique BGla Mac :</span>
                    <span className="font-mono">{musicTrackVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={musicTrackVolume}
                    onChange={(e) => setMusicTrackVolume(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* Step 7: Publication Description & Action */}
            <div className="space-y-3 pt-3 border-t border-[#242424]">
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                7. Légende & Publication sur le Feed
              </label>

              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Écrivez une description percutante avec vos hashtags..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37]"
              />

              {publishSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4" />
                  <span>Vidéo publiée avec succès sur BGla Tok ! Redirection vers le flux...</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handlePublish}
                  className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#D4AF37] to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm shadow-xl shadow-[#D4AF37]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Montage & Encodage en cours...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 fill-current" />
                      <span>Publier sur BGla Tok (Feed Vidéos)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    alert('Exportation MP4 préparée ! La vidéo avec vos effets et filtres a été enregistrée dans vos projets.');
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter MP4</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
