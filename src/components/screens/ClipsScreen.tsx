import React, { useState } from 'react';
import {
  Play,
  Pause,
  Video,
  Eye,
  Calendar,
  Sparkles,
  Share2,
  Heart,
  ExternalLink,
  Volume2,
  VolumeX,
  Maximize2,
  Tv,
  Flame,
  Film,
  Download,
  FolderDown,
  Check,
} from 'lucide-react';
import { stadiumAudio } from '../../utils/audioSimulator';
import { VideoShareModal } from '../VideoShareModal';
import {
  downloadVideoToLocalStorage,
  shareVideoDirectly,
  isFileSystemAccessSupported,
} from '../../utils/videoExport';

interface Clip {
  id: string;
  title: string;
  genre: string;
  genreId: string;
  views: string;
  releaseDate: string;
  duration: string;
  director: string;
  location: string;
  description: string;
  badge: string;
  thumbnailColor: string;
  promptSuggestion: string;
}

const OFFICIAL_CLIPS: Clip[] = [
  {
    id: 'c1',
    title: 'Bamako By Night (Clip Officiel 4K)',
    genre: 'Afro-Rap Malien',
    genreId: 'afro-rap',
    views: '14.2M de vues',
    releaseDate: '15 Février 2026',
    duration: '3:38',
    director: 'Kader Diabaté & Sahel Motion',
    location: 'Stade du 26-Mars, Bamako',
    description: 'Le clip événement tourné avec 65 000 spectateurs en fusion. Faisceaux lasers cyan et magenta, déferlante d’énergie et chorégraphies d’Oude Mill sous une pluie d’étincelles.',
    badge: 'Clip Officiel 4K',
    thumbnailColor: 'from-amber-600/40 via-purple-900/40 to-black',
    promptSuggestion: 'Génère une vidéo de concert ultra-énergique d’Oude Mill au Stade du 26-Mars à Bamako sur son hit Afro-Rap "Bamako By Night". Lasers bleus et magenta, 100 000 spectateurs qui sautent à l’unisson.',
  },
  {
    id: 'c2',
    title: 'Kora & Diamants (Clip Acoustique & Poétique)',
    genre: 'Acoustique Mandingue & Kora',
    genreId: 'acoustic',
    views: '9.8M de vues',
    releaseDate: '20 Décembre 2025',
    duration: '4:02',
    director: 'Aïssata Touré Studio',
    location: 'Falaises de Bandiagara & Bords du Niger',
    description: 'Une œuvre poétique sublime mettant en scène la rencontre entre les mélodies ancestrales de la kora et la poésie contemporaine d’Oude Mill à la lueur dorée du crépuscule.',
    badge: 'Masterclass Mandingue',
    thumbnailColor: 'from-amber-500/30 via-orange-950/40 to-black',
    promptSuggestion: 'Génère un concert intimiste et grandiose d’Oude Mill avec kora et guitare acoustique. Une marée de 100 000 smartphones allumés comme un ciel étoilé sous des projecteurs dorés.',
  },
  {
    id: 'c3',
    title: 'Sub-Bass Gladiator (Visualizer 808 Trap Stadium)',
    genre: 'Instrumental Épique & 808 Trap',
    genreId: 'instrumental-808',
    views: '18.5M de vues',
    releaseDate: '10 Mars 2026',
    duration: '2:58',
    director: 'Visual FX London & Oude Mill Team',
    location: 'Wembley Stadium, Londres',
    description: 'Visualizer titanesque où chaque coup de sub-bass 808 déclenche des colonnes de flammes réelles de 15 mètres de haut. Ambiance de gladiateur moderne des stades.',
    badge: '18M+ Vues',
    thumbnailColor: 'from-red-600/40 via-amber-900/40 to-black',
    promptSuggestion: 'Génère un show pyrotechnique géant d’Oude Mill au centre de la scène d’un stade bondé. Colonnes de flammes, lasers vert émeraude et infra-basses qui font trembler les tribunes.',
  },
  {
    id: 'c4',
    title: 'Fête Panafricaine (Live Tournée des Capitales)',
    genre: 'Afrobeats Solaire & Festif',
    genreId: 'afrobeats',
    views: '11.1M de vues',
    releaseDate: '01 Mai 2026',
    duration: '3:20',
    director: 'AfroCinema Collective',
    location: 'Bamako • Abidjan • Dakar',
    description: 'Compilation des moments les plus joyeux de la tournée ouest-africaine. Sourires, danses synchronisées dans les tribunes et célébration de la fraternité panafricaine.',
    badge: 'Ambiance Solaire',
    thumbnailColor: 'from-yellow-600/30 via-emerald-950/40 to-black',
    promptSuggestion: 'Génère une scène de concert afrobeats festive et solaire avec Oude Mill. Confettis dorés, foule en liesse dansant avec allégresse dans un stade ensoleillé de fin d’après-midi.',
  },
  {
    id: 'c5',
    title: 'Drill du 26-Mars (Clip Performance)',
    genre: 'Drill Bamako',
    genreId: 'drill-bamako',
    views: '16.7M de vues',
    releaseDate: '18 Janvier 2026',
    duration: '2:48',
    director: 'Kader Diabaté',
    location: 'Avenue de la Nation & Arène',
    description: 'Esthétique streetwear haut de gamme, bolides customisés, plans drones ultra-dynamiques et flow chirurgical d’Oude Mill.',
    badge: 'Tendance Hip-Hop',
    thumbnailColor: 'from-blue-600/30 via-slate-900/50 to-black',
    promptSuggestion: 'Génère une performance drill percutante d’Oude Mill avec démarche streetwear assurée, éclairage contrasté noir et blanc et flashs stroboscopiques bleus intenses.',
  },
  {
    id: 'c6',
    title: 'Symphonie du Conquérant (Live à Wembley)',
    genre: 'Symphonie de Stade Triomphale',
    genreId: 'symphonic-stadium',
    views: '8.4M de vues',
    releaseDate: '12 Juin 2026',
    duration: '4:15',
    director: 'BBC Music Live Production',
    location: 'Wembley Stadium, Londres',
    description: 'L’orchestre symphonique de 60 musiciens rejoint Oude Mill sur scène pour une ouverture royale devant 90 000 spectateurs médusés.',
    badge: 'Live Symphonique',
    thumbnailColor: 'from-amber-600/40 via-zinc-900/50 to-black',
    promptSuggestion: 'Génère l’entrée triomphale d’Oude Mill au stade de Wembley avec orchestre à cordes, feux d’artifice tirés depuis le toit de l’arche et 90 000 spectateurs en ovation.',
  },
];

interface ClipsScreenProps {
  onSelectClipForVideoStudio: (promptSnippet: string, genreId: string) => void;
  onNavigateTikTok?: () => void;
}

export const ClipsScreen: React.FC<ClipsScreenProps> = ({
  onSelectClipForVideoStudio,
  onNavigateTikTok,
}) => {
  const [selectedClip, setSelectedClip] = useState<Clip>(OFFICIAL_CLIPS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [shareModalClip, setShareModalClip] = useState<Clip | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState<Record<string, number>>({
    c1: 420800,
    c2: 295400,
    c3: 560100,
    c4: 310500,
    c5: 485000,
    c6: 270300,
  });
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const handleDownloadClip = async (clip: Clip, usePicker: boolean = false) => {
    try {
      const fileName = `${clip.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_4K.mp4`;
      const streamUrl = `/api/video-stream?operationName=official_${clip.id}&download=true`;
      const res = await downloadVideoToLocalStorage(streamUrl, fileName, usePicker);
      if (res.success) {
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err: any) {
      console.warn('Clip download error:', err);
    }
  };

  const handlePlayClip = (clip: Clip) => {
    setSelectedClip(clip);
    setIsPlaying(true);
    stadiumAudio.play();
    stadiumAudio.setGenre(clip.genreId);
    stadiumAudio.triggerBassDrop();
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stadiumAudio.stop();
    } else {
      setIsPlaying(true);
      stadiumAudio.play();
      stadiumAudio.setGenre(selectedClip.genreId);
      stadiumAudio.triggerBassDrop();
    }
  };

  const handleToggleLike = (clipId: string) => {
    const isLiked = likedMap[clipId];
    setLikedMap((prev) => ({ ...prev, [clipId]: !isLiked }));
    setLikesCount((prev) => ({
      ...prev,
      [clipId]: (prev[clipId] || 0) + (isLiked ? -1 : 1),
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative rounded-[16px] overflow-hidden bg-gradient-to-r from-[#171717] via-[#221c13] to-[#151515] border border-[#D4AF37]/35 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <Film className="w-3.5 h-3.5" />
              <span>Vidéothèque Officielle • Oude Mill</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
              LES CLIPS OFFICIELS & SHOWS DE CONCERTS 4K
            </h2>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Plonge dans les réalisations visuelles d’Oude Mill : productions cinématographiques, concerts de stades et feux d’artifice. Tu peux transformer n'importe quel clip en vidéo personnalisée avec le Studio Veo !
            </p>
          </div>

          <div className="flex gap-3">
            <div className="p-3.5 rounded-[16px] bg-[#1D1D1D] border border-[#D4AF37]/25 text-center">
              <span className="text-xl font-black text-[#D4AF37] font-mono block">6 Clips</span>
              <span className="text-[11px] text-zinc-400 font-medium">Ultra Haute Définition</span>
            </div>
            <div className="p-3.5 rounded-[16px] bg-[#1D1D1D] border border-[#D4AF37]/25 text-center">
              <span className="text-xl font-black text-white font-mono block">80M+</span>
              <span className="text-[11px] text-zinc-400 font-medium">Vues Totales</span>
            </div>
          </div>
        </div>
      </div>

      {/* BGla Tok Short Videos Quick Switcher Banner */}
      {onNavigateTikTok && (
        <div
          onClick={onNavigateTikTok}
          className="p-4 rounded-2xl bg-gradient-to-r from-[#1c1218] via-[#161616] to-[#121212] border border-pink-500/40 hover:border-pink-400 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-lg group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 font-mono">
                Nouveau • Format Vertical 9:16
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-pink-200 transition-colors">
                Regarder en mode TikTok (BGla Tok) ou créer un montage avec effets
              </h4>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Découvrez les freestyles courts, double-cliquez pour liker, commentez et appliquez les filtres vidéo en temps réel.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-xs shrink-0 flex items-center gap-1.5 transition-transform group-hover:translate-x-1"
          >
            <span>Ouvrir BGla Tok</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Featured Video Player Canvas/Screen */}
      <div className="rounded-[16px] bg-[#1D1D1D] border border-[#2D2D2D] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Syne',sans-serif]">
              Lecteur Vidéo Officiel • {selectedClip.title}
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-black uppercase tracking-wider">
            {selectedClip.badge}
          </span>
        </div>

        {/* Video Screen Container with Dynamic Audio Visualizer & Stage Simulation */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center group shadow-inner">
          {/* Animated Background Atmosphere */}
          <div
            className={`absolute inset-0 bg-gradient-to-tr ${selectedClip.thumbnailColor} opacity-70 group-hover:opacity-85 transition-opacity`}
          />

          {/* Stage Lighting simulation elements */}
          <div className="absolute top-0 left-1/4 w-32 h-64 bg-[#D4AF37]/20 rotate-12 blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-32 h-64 bg-purple-500/20 -rotate-12 blur-2xl pointer-events-none" />

          {/* Central Play/Pause or Active Video Stage Graphics */}
          <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-3">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                isPlaying
                  ? 'bg-black/60 text-[#D4AF37] border-2 border-[#D4AF37] scale-105'
                  : 'bg-[#D4AF37] text-black hover:bg-[#e4bf46] hover:scale-110'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              )}
            </button>

            <div className="space-y-1">
              <span className="text-sm sm:text-base font-extrabold text-white font-['Syne',sans-serif] drop-shadow-md">
                {selectedClip.title}
              </span>
              <p className="text-xs text-zinc-300 max-w-md">
                {isPlaying
                  ? 'Lecture en cours avec simulation de stade et acoustique 808 active'
                  : 'Clique pour lancer le clip vidéo avec ambiance de foule en direct'}
              </p>
            </div>

            {isPlaying && (
              <div className="flex items-center gap-1.5 pt-2">
                <span className="w-1.5 h-6 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="w-1.5 h-10 rounded-full bg-amber-400 animate-pulse delay-75" />
                <span className="w-1.5 h-14 rounded-full bg-yellow-300 animate-pulse delay-150" />
                <span className="w-1.5 h-8 rounded-full bg-[#D4AF37] animate-pulse delay-100" />
                <span className="w-1.5 h-12 rounded-full bg-amber-500 animate-pulse delay-200" />
                <span className="w-1.5 h-5 rounded-full bg-[#D4AF37] animate-pulse" />
              </div>
            )}
          </div>

          {/* Bottom video player controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-3 text-xs text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="hover:text-[#D4AF37] transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isMuted) {
                    stadiumAudio.setVolume(0.65);
                    setIsMuted(false);
                  } else {
                    stadiumAudio.setVolume(0);
                    setIsMuted(true);
                  }
                }}
                className="hover:text-[#D4AF37] transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="text-[11px] font-mono text-zinc-300">
                {isPlaying ? '0:45 / ' : '0:00 / '}{selectedClip.duration}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-[#D4AF37] border border-[#D4AF37]/30">
                4K UHD
              </span>
              <span className="text-[11px] text-zinc-300 hidden sm:inline">
                {selectedClip.location}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Clip Details & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-white font-['Syne',sans-serif]">
              {selectedClip.title}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
              {selectedClip.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400">
              <span>Réalisateur : <strong className="text-zinc-200">{selectedClip.director}</strong></span>
              <span>•</span>
              <span>Lieu : <strong className="text-zinc-200">{selectedClip.location}</strong></span>
              <span>•</span>
              <span>Sortie : <strong className="text-zinc-200">{selectedClip.releaseDate}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleToggleLike(selectedClip.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                likedMap[selectedClip.id]
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-[#141414] text-zinc-300 border-zinc-700 hover:text-white'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  likedMap[selectedClip.id] ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span>{(likesCount[selectedClip.id] || 0).toLocaleString()}</span>
            </button>

            {/* Direct Local Download */}
            <button
              type="button"
              onClick={() => handleDownloadClip(selectedClip, false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all hover:scale-105"
              title="Télécharger le clip sur votre appareil"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger MP4</span>
            </button>

            {/* Direct Share */}
            <button
              type="button"
              onClick={() => setShareModalClip(selectedClip)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141414] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all hover:scale-105"
              title="Partager ce clip"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Partager</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectClipForVideoStudio(
                  selectedClip.promptSuggestion,
                  selectedClip.genreId
                )
              }
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e2bd44] text-black text-xs font-black shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Créer avec Veo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of All Video Clips */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-['Syne',sans-serif] flex items-center gap-2">
          <Film className="w-5 h-5 text-[#D4AF37]" />
          <span>Tous les Clips & Vidéos Officielles</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {OFFICIAL_CLIPS.map((clip) => {
            const isCurrent = selectedClip.id === clip.id;
            const isPlayingThis = isCurrent && isPlaying;

            return (
              <div
                key={clip.id}
                className={`rounded-[16px] bg-[#1D1D1D] border transition-all flex flex-col justify-between overflow-hidden shadow-lg group hover:-translate-y-1 ${
                  isCurrent
                    ? 'border-[#D4AF37] shadow-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                    : 'border-[#2A2A2A] hover:border-[#D4AF37]/60'
                }`}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => handlePlayClip(clip)}
                  className="relative aspect-video bg-black cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr ${clip.thumbnailColor} opacity-60 group-hover:opacity-85 transition-opacity`}
                  />

                  {/* Play Button Overlay */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-black/60 group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-black flex items-center justify-center transition-all shadow-xl group-hover:scale-110">
                    {isPlayingThis ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    )}
                  </div>

                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-black text-[#D4AF37] border border-[#D4AF37]/30">
                    {clip.badge}
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-zinc-300">
                    {clip.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#D4AF37] font-semibold">
                      <span>{clip.genre}</span>
                      <span className="text-zinc-400 font-mono">{clip.views}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-['Syne',sans-serif] group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                      {clip.title}
                    </h4>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {clip.description}
                    </p>
                  </div>

                  {/* Card bottom actions */}
                  <div className="pt-3 border-t border-[#262626] flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePlayClip(clip)}
                      className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      <span>{isPlayingThis ? 'En lecture' : 'Visionner'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Direct Local Download */}
                      <button
                        type="button"
                        onClick={() => handleDownloadClip(clip, false)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="Télécharger ce clip"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct Share */}
                      <button
                        type="button"
                        onClick={() => setShareModalClip(clip)}
                        className="p-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-colors"
                        title="Partager ce clip"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onSelectClipForVideoStudio(
                            clip.promptSuggestion,
                            clip.genreId
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#252525] hover:bg-[#D4AF37] hover:text-black text-zinc-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Créer une vidéo personnalisée dans le Studio Veo"
                      >
                        <Sparkles className="w-3 h-3 text-[#D4AF37] group-hover:text-black" />
                        <span>Studio Veo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-white text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Video Share Modal */}
      {shareModalClip && (
        <VideoShareModal
          isOpen={Boolean(shareModalClip)}
          onClose={() => setShareModalClip(null)}
          videoUrl={`/api/video-stream?operationName=official_${shareModalClip.id}&download=true`}
          operationName={`official_${shareModalClip.id}`}
          aspectRatio="16:9"
          promptUsed={shareModalClip.promptSuggestion}
          musicGenre={shareModalClip.genre}
          title={shareModalClip.title}
        />
      )}
    </div>
  );
};
