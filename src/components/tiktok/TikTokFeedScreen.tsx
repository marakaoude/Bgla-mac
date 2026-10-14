import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Scissors,
  Wand2,
  Check,
  Flame,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Smartphone,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { TikTokVideo, TikTokComment, VideoFilterEffect } from '../../types';
import {
  INITIAL_TIKTOK_VIDEOS,
  VIDEO_FILTERS,
  MUSIC_SOUNDTRACKS_CATALOG,
} from '../../data/tikTokData';
import { TikTokCommentsDrawer } from './TikTokCommentsDrawer';
import { TikTokStudioModal } from './TikTokStudioModal';
import { stadiumAudio } from '../../utils/audioSimulator';

interface TikTokFeedScreenProps {
  onSelectTrackForVideo?: (genreId: string, trackTitle: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const TikTokFeedScreen: React.FC<TikTokFeedScreenProps> = ({
  onSelectTrackForVideo,
  onNavigateTab,
}) => {
  // Feed videos state
  const [videos, setVideos] = useState<TikTokVideo[]>(() => {
    try {
      const saved = localStorage.getItem('bgla_tiktok_videos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TIKTOK_VIDEOS;
  });

  const [activeCategory, setActiveCategory] = useState<'pour-toi' | 'abonnements' | 'tendances'>('pour-toi');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('all');
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  // Playback & Sound state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);

  // Heart particle animation on double tap
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTapRef = useRef<number>(0);

  // Modals state
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [soundtrackForStudio, setSoundtrackForStudio] = useState<string | undefined>(undefined);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Save videos to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('bgla_tiktok_videos', JSON.stringify(videos));
    } catch {}
  }, [videos]);

  // Filter videos by category & genre
  const filteredVideos = videos.filter((v) => {
    if (activeCategory === 'abonnements' && !v.isFollowing) return false;
    if (activeCategory === 'tendances' && v.category !== 'tendances' && v.likesCount < 150000) return false;
    if (selectedGenreFilter !== 'all' && v.musicGenreId !== selectedGenreFilter) return false;
    return true;
  });

  const activeVideo: TikTokVideo | undefined =
    filteredVideos[currentVideoIndex] || filteredVideos[0] || videos[0];

  // Sync video audio simulation
  useEffect(() => {
    if (activeVideo && !isMuted && isPlaying) {
      if (activeVideo.musicGenreId) {
        stadiumAudio.playMusicalPreview(activeVideo.musicGenreId);
      }
    }
  }, [currentVideoIndex, activeCategory, isMuted, isPlaying]);

  // Keyboard navigation (ArrowUp, ArrowDown, Space to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen || isStudioOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextVideo();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevVideo();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, filteredVideos.length, isCommentsOpen, isStudioOpen, isPlaying]);

  const handleNextVideo = () => {
    if (currentVideoIndex < filteredVideos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setIsPlaying(true);
    } else {
      setCurrentVideoIndex(0); // loop back
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setIsPlaying(true);
    } else {
      setCurrentVideoIndex(filteredVideos.length - 1);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Double tap to like
  const handleContainerTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (now - lastTapRef.current < 320) {
      // Double tap detected!
      triggerHeart(x, y);
      if (!activeVideo.isLiked) {
        handleToggleLike(activeVideo.id);
      }
    } else {
      // Single tap -> toggle play/pause
      togglePlayPause();
    }
    lastTapRef.current = now;
  };

  const triggerHeart = (x: number, y: number) => {
    const heartId = Date.now();
    setFloatingHearts((prev) => [...prev, { id: heartId, x, y }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1000);
  };

  const handleToggleLike = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const isLiked = !v.isLiked;
          return {
            ...v,
            isLiked,
            likesCount: isLiked ? v.likesCount + 1 : Math.max(0, v.likesCount - 1),
          };
        }
        return v;
      })
    );
  };

  const handleToggleSave = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const isSaved = !v.isSaved;
          return { ...v, isSaved };
        }
        return v;
      })
    );
    setShareToast('Vidéo ajoutée à vos favoris BGla Mac ! ⭐');
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleToggleFollow = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, isFollowing: !v.isFollowing };
        }
        return v;
      })
    );
  };

  const handleAddComment = (commentText: string) => {
    if (!activeVideo) return;
    const newComment: TikTokComment = {
      id: `c-${Date.now()}`,
      userName: 'Fan BGla Mac',
      userHandle: '@fan_bko',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      comment: commentText,
      timeAgo: 'À l’instant',
      likes: 1,
      isLiked: true,
    };

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === activeVideo.id) {
          return {
            ...v,
            commentsCount: v.commentsCount + 1,
            comments: [newComment, ...(v.comments || [])],
          };
        }
        return v;
      })
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setShareToast('Lien de la vidéo copié dans le presse-papiers ! 🔗');
    setTimeout(() => setShareToast(null), 2500);
  };

  const handlePublishNewVideo = (newVideo: TikTokVideo) => {
    setVideos([newVideo, ...videos]);
    setCurrentVideoIndex(0);
    setActiveCategory('pour-toi');
    setShareToast('Votre vidéo avec montage et effets est en ligne sur BGla Tok ! 🚀🔥');
    setTimeout(() => setShareToast(null), 3500);
  };

  // Find filter preset
  const filterPreset =
    VIDEO_FILTERS.find((f) => f.id === activeVideo?.filterEffect) || VIDEO_FILTERS[0];

  const getComputedFilter = () => {
    if (!activeVideo || !activeVideo.filterEffect || activeVideo.filterEffect === 'none') {
      return 'none';
    }
    const factor = (activeVideo.effectIntensity || 85) / 100;
    switch (activeVideo.filterEffect) {
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

  const getFilterAnimationClass = () => {
    if (activeVideo?.filterEffect === 'bass_shake') return 'animate-bass-shake';
    if (activeVideo?.filterEffect === 'strobe_flash') return 'animate-strobe-pulse';
    if (activeVideo?.filterEffect === 'glitch') return 'animate-glitch-shift';
    return '';
  };

  return (
    <div className="space-y-4 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Feed & Studio Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141414] border border-[#242424] p-3 sm:p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-[#D4AF37] to-red-500 flex items-center justify-center text-black shadow-lg shadow-[#D4AF37]/20">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white font-['Syne',sans-serif] tracking-tight">
                BGla Tok • Vidéos Courtes & Montage
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-mono">
                TikTok 9:16
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Regardez les clips des artistes façon TikTok ou créez vos propres montages avec effets visuels et sons synchronisés.
            </p>
          </div>
        </div>

        {/* Action button: Open Studio for Montage & Effets */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setSoundtrackForStudio(undefined);
              setIsStudioOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#D4AF37] to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Scissors className="w-4 h-4 stroke-[2.5]" />
            <span>+ Créer / Monter une Vidéo</span>
          </button>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#121212] p-2.5 rounded-xl border border-[#222]">
        {/* Category Tabs: Pour Toi / Abonnements / Tendances */}
        <div className="flex items-center gap-1">
          {[
            { id: 'pour-toi' as const, label: 'Pour Toi', icon: Sparkles },
            { id: 'abonnements' as const, label: 'Abonnements', icon: Heart },
            { id: 'tendances' as const, label: 'En Tendance 🔥', icon: TrendingUp },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentVideoIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#D4AF37] text-black shadow-md font-['Syne',sans-serif]"
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Genre Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-zinc-500 hidden sm:inline" />
          {[
            { id: 'all', label: 'Tout' },
            { id: 'afro-rap', label: 'Afro-Rap' },
            { id: 'acoustic', label: 'Kora Acoustique' },
            { id: 'instrumental-808', label: '808 Trap' },
            { id: 'afrobeats', label: 'Afrobeats' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setSelectedGenreFilter(g.id);
                setCurrentVideoIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                selectedGenreFilter === g.id
                  ? 'bg-zinc-200 text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main TikTok Fullscreen / Vertical Viewport */}
      <div className="relative flex flex-col items-center justify-center py-2 sm:py-4">
        {/* Floating Share Toast */}
        {shareToast && (
          <div className="fixed top-20 z-50 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black shadow-2xl animate-bounce flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{shareToast}</span>
          </div>
        )}

        {/* TikTok Smartphone Player Card Frame */}
        <div className="relative w-full max-w-[380px] h-[660px] sm:h-[700px] bg-black rounded-[36px] border-[5px] border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.12)] overflow-hidden select-none flex flex-col">
          {/* Top subtle bar: audio mute & index counter */}
          <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between text-xs text-white/90 drop-shadow pointer-events-auto">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-bold">
              <span className="text-[#D4AF37]">BGla Tok</span>
              <span>•</span>
              <span className="font-mono text-zinc-300">
                {currentVideoIndex + 1}/{filteredVideos.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter badge if active */}
              {activeVideo?.filterEffect && activeVideo.filterEffect !== 'none' && (
                <div className="px-2 py-0.5 rounded-full bg-amber-500/30 backdrop-blur-md border border-amber-400/40 text-[#D4AF37] text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{filterPreset.name}</span>
                </div>
              )}

              {/* Mute toggle button */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                )}
              </button>
            </div>
          </div>

          {/* Interactive Video Touch Area */}
          <div
            className="relative flex-1 w-full h-full cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-950"
            onClick={handleContainerTap}
          >
            {/* HTML5 Video Element with Real Filters */}
            <video
              ref={videoRef}
              src={activeVideo.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className={`w-full h-full object-cover transition-all ${getFilterAnimationClass()}`}
              style={{
                filter: getComputedFilter(),
              }}
              onTimeUpdate={(e) => {
                const target = e.currentTarget;
                setCurrentTime(target.currentTime);
                if (target.duration) setDuration(target.duration);
              }}
            />

            {/* Visual Shader overlay */}
            {filterPreset.overlayClass && (
              <div className={`absolute inset-0 pointer-events-none ${filterPreset.overlayClass}`} />
            )}

            {/* VHS Scanlines */}
            {activeVideo?.filterEffect === 'vhs_retro' && (
              <div className="absolute inset-0 pointer-events-none vhs-scanlines opacity-50">
                <div className="absolute top-12 left-4 text-[10px] font-mono text-red-500 font-bold bg-black/60 px-1 rounded">
                  REC ● 2026
                </div>
              </div>
            )}

            {/* Play/Pause Center Indicator on Pause */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-10 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/90 text-black flex items-center justify-center shadow-2xl">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Floating Heart Particles (Double Tap) */}
            {floatingHearts.map((heart) => (
              <div
                key={heart.id}
                className="absolute pointer-events-none z-30 animate-float-heart"
                style={{ left: heart.x, top: heart.y }}
              >
                <Heart className="w-20 h-20 text-red-500 fill-current drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
              </div>
            ))}

            {/* Text Overlays on Video */}
            {activeVideo.textOverlays?.map((t) => (
              <div
                key={t.id}
                className={`absolute inset-x-4 pointer-events-none z-10 flex justify-center ${
                  t.position === 'top'
                    ? 'top-16'
                    : t.position === 'center'
                    ? 'top-1/2 -translate-y-1/2'
                    : 'bottom-28'
                }`}
              >
                <div
                  className={`max-w-[90%] text-center font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xl ${
                    t.style === 'tiktok'
                      ? "bg-[#D4AF37] text-black font-extrabold uppercase font-['Syne',sans-serif]"
                      : t.style === 'neon'
                      ? 'bg-black/85 text-yellow-300 border border-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                      : t.style === 'headline'
                      ? 'bg-red-600 text-white uppercase tracking-wider font-black text-sm'
                      : 'bg-black/90 text-white border border-zinc-700 text-[11px]'
                  }`}
                  style={{
                    color: t.style === 'tiktok' ? '#000' : t.color,
                    backgroundColor: t.style === 'tiktok' ? t.bgColor : undefined,
                  }}
                >
                  {t.text}
                </div>
              </div>
            ))}

            {/* Animated Stickers Badge Overlays */}
            {activeVideo.stickers && activeVideo.stickers.length > 0 && (
              <div className="absolute top-20 right-4 flex flex-col gap-2 pointer-events-none z-10">
                {activeVideo.stickers.map((stk, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg shadow-lg animate-bounce"
                    style={{ animationDuration: `${1.4 + idx * 0.3}s` }}
                  >
                    {stk}
                  </div>
                ))}
              </div>
            )}

            {/* TikTok Right Action Sidebar */}
            <div
              className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Artist Avatar with Follow '+' button */}
              <div className="relative group">
                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#D4AF37] to-amber-600 shadow-xl overflow-hidden">
                  <img
                    src={activeVideo.artistAvatar}
                    alt={activeVideo.artistName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleFollow(activeVideo.id)}
                  className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-all cursor-pointer ${
                    activeVideo.isFollowing
                      ? 'bg-emerald-500 scale-90'
                      : 'bg-red-500 hover:scale-110 animate-pulse'
                  }`}
                  title={activeVideo.isFollowing ? 'Abonné' : 'Suivre l’artiste'}
                >
                  {activeVideo.isFollowing ? '✓' : '+'}
                </button>
              </div>

              {/* Like (Heart) Button */}
              <button
                type="button"
                onClick={() => handleToggleLike(activeVideo.id)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    activeVideo.isLiked
                      ? 'bg-red-500/25 text-red-500 scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                      : 'bg-black/50 text-white hover:bg-black/70 group-hover:scale-105'
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 transition-transform ${
                      activeVideo.isLiked ? 'fill-current scale-110 text-red-500' : ''
                    }`}
                  />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow font-mono">
                  {(activeVideo.likesCount / 1000).toFixed(1)}k
                </span>
              </button>

              {/* Comments Button */}
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-all group-hover:scale-105">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow font-mono">
                  {activeVideo.commentsCount}
                </span>
              </button>

              {/* Bookmark / Favorite Button */}
              <button
                type="button"
                onClick={() => handleToggleSave(activeVideo.id)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    activeVideo.isSaved
                      ? 'bg-amber-500/30 text-[#D4AF37]'
                      : 'bg-black/50 text-white hover:bg-black/70 group-hover:scale-105'
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${activeVideo.isSaved ? 'fill-current text-[#D4AF37]' : ''}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow font-mono">
                  Favori
                </span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-all group-hover:scale-105">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow font-mono">
                  Partager
                </span>
              </button>

              {/* Spinning Vinyl Music Record Disc */}
              <div
                onClick={() => {
                  setSoundtrackForStudio(activeVideo.musicGenreId);
                  setIsStudioOpen(true);
                }}
                className="relative cursor-pointer group pt-1"
                title="Utiliser ce son dans le Studio de Montage"
              >
                <div className="w-11 h-11 rounded-full bg-zinc-950 border-2 border-zinc-700 shadow-xl flex items-center justify-center animate-spin-slow">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-900">
                    <img
                      src={activeVideo.thumbnailUrl}
                      alt="Vinyl Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[9px] font-black flex items-center justify-center animate-pulse">
                  ♪
                </div>
              </div>
            </div>

            {/* Bottom Overlay: Artist Name, Caption, Hashtags & Audio Ticker */}
            <div
              className="absolute bottom-4 inset-x-4 z-10 pointer-events-none pr-16 space-y-1.5 drop-shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Artist handle & Verification badge */}
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <span className="text-sm font-black text-white hover:underline cursor-pointer">
                  @{activeVideo.artistHandle}
                </span>
                {activeVideo.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]/20" />
                )}
                {activeVideo.isFollowing && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Abonné
                  </span>
                )}
              </div>

              {/* Caption description */}
              <p className="text-xs text-white/95 leading-relaxed line-clamp-2 font-medium">
                {activeVideo.description}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1 text-[11px] font-bold text-[#D4AF37] pointer-events-auto">
                {activeVideo.tags.map((t) => (
                  <span key={t} className="hover:underline cursor-pointer">
                    {t}
                  </span>
                ))}
              </div>

              {/* Sound Marquee Ticker */}
              <div
                onClick={() => {
                  setSoundtrackForStudio(activeVideo.musicGenreId);
                  setIsStudioOpen(true);
                }}
                className="flex items-center gap-2 pt-0.5 text-xs text-white/90 font-bold pointer-events-auto cursor-pointer group"
              >
                <Music className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                <div className="overflow-hidden whitespace-nowrap max-w-[200px]">
                  <span className="inline-block group-hover:text-[#D4AF37] transition-colors">
                    {activeVideo.musicTitle} • {activeVideo.musicAuthor}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-[#D4AF37] border border-[#D4AF37]/30 font-mono">
                  Utiliser ce son ⚡
                </span>
              </div>
            </div>

            {/* Bottom Scrubber Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-20">
              <div
                className="h-full bg-[#D4AF37] transition-all"
                style={{ width: `${(currentTime / (duration || 15)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Floating Vertical Navigation Arrows (Next / Prev) */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={handlePrevVideo}
            className="p-3 rounded-2xl bg-[#1a1a1a] hover:bg-[#252525] border border-zinc-700 text-zinc-300 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="px-4 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Lecture'}</span>
          </button>

          <button
            type="button"
            onClick={handleNextVideo}
            className="p-3 rounded-2xl bg-[#1a1a1a] hover:bg-[#252525] border border-zinc-700 text-zinc-300 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <span>Suivant</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured Video Studio Teaser Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1c1810] via-[#161616] to-[#121212] border border-[#D4AF37]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              Outil Créatif Intégré
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              Montez vos Propres Vidéos Courtes avec Effets Spéciaux & Sons du Mali
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl mt-0.5">
              Filtres Neon Gold Sahel, VHS 90s, Séisme Bass 808, Strobe de concert, sous-titres punchlines et synchronisation audio avec les hymnes d’Oude Mill.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSoundtrackForStudio(undefined);
            setIsStudioOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e2bd44] text-black text-xs font-black flex items-center gap-2 shrink-0 self-start md:self-auto shadow-md transition-all cursor-pointer"
        >
          <Scissors className="w-4 h-4 stroke-[2.5]" />
          <span>Ouvrir le Studio de Montage</span>
        </button>
      </div>

      {/* Comments Drawer */}
      <TikTokCommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        comments={activeVideo.comments || []}
        videoTitle={activeVideo.description}
        onAddComment={handleAddComment}
      />

      {/* Video Editing & Effects Studio Modal */}
      <TikTokStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onPublishVideo={handlePublishNewVideo}
        initialSoundtrackId={soundtrackForStudio}
      />
    </div>
  );
};
