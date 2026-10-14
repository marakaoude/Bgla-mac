import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Activity,
  Users,
  Sparkles,
  ChevronDown,
  Check,
  Disc3,
  Volume2,
  VolumeX,
  Play,
  Flame,
  Radio,
} from 'lucide-react';
import { MUSIC_GENRES } from '../data/presets';
import { MusicGenre } from '../types';
import { stadiumAudio } from '../utils/audioSimulator';

interface MusicGenreSelectorProps {
  selectedGenreId: string;
  onSelectGenre: (genre: MusicGenre) => void;
  onApplyToPrompt?: (snippet: string) => void;
  crowdVolume: number;
  onCrowdVolumeChange: (vol: number) => void;
  isAudioActive?: boolean;
  onToggleAudio?: () => void;
}

export const MusicGenreSelector: React.FC<MusicGenreSelectorProps> = ({
  selectedGenreId,
  onSelectGenre,
  onApplyToPrompt,
  crowdVolume,
  onCrowdVolumeChange,
  isAudioActive = false,
  onToggleAudio,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedGenre = MUSIC_GENRES.find((g) => g.id === selectedGenreId) || MUSIC_GENRES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (genre: MusicGenre) => {
    onSelectGenre(genre);
    setIsOpen(false);
  };

  const handlePreviewMusicAndCrowd = () => {
    setIsPlayingPreview(true);
    // Play genre musical motif and stadium ambiance
    stadiumAudio.play();
    stadiumAudio.setGenre(selectedGenre.id);
    stadiumAudio.playMusicalPreview(selectedGenre.id);
    setTimeout(() => {
      setIsPlayingPreview(false);
    }, 2500);
  };

  const volumePercent = Math.round(crowdVolume * 100);

  const getBalanceDescription = (pct: number) => {
    if (pct === 0) return 'Foule silencieuse (0%) : La musique et la voix d’Oude Mill sont complètement isolées.';
    if (pct <= 30) return `Ambiance intimiste (${pct}%) : La musique domine avec clarté, murmure discret et frémissement du stade.`;
    if (pct <= 65) return `Mix équilibré (${pct}%) : Les 100 000 voix accompagnent le beat sans saturer la production musicale.`;
    if (pct <= 85) return `Concert survolté (${pct}%) : Clameur impressionnante, hurlements de joie et écho puissant dans les tribunes.`;
    return `Stade en fusion maximale (${pct}%) : Rugissement sismique des 100 000 spectateurs en transe totale !`;
  };

  return (
    <div className="bg-[#1D1D1D] rounded-[16px] border border-[#2C2C2C] p-5 shadow-xl relative" ref={dropdownRef}>
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Syne',sans-serif]">
              Genre Musical & Ambiance de la Foule
            </h2>
            <p className="text-xs text-zinc-400">
              Sélectionnez le style sonore pour synchroniser la gestuelle d'Oude Mill et la ferveur du stade
            </p>
          </div>
        </div>

        {/* BPM / Tempo badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-[11px] font-semibold font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
          <span>{selectedGenre.tempo}</span>
        </div>
      </div>

      {/* Main Dropdown Trigger */}
      <div className="relative mb-3">
        <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Disc3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Sélecteur de Genre Musical :</span>
          </span>
          <span className="text-zinc-500 text-[10px]">Cliquez pour changer de style</span>
        </label>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-zinc-950/90 border border-zinc-700/80 hover:border-[#D4AF37]/80 rounded-xl p-3 text-left transition-all flex items-center justify-between gap-3 shadow-inner group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-700 flex items-center justify-center text-black shrink-0 shadow-md">
              <Disc3 className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate font-['Syne',sans-serif]">
                  {selectedGenre.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-[#D4AF37] border border-[#D4AF37]/30">
                  {selectedGenre.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">{selectedGenre.description}</p>
            </div>
          </div>

          <ChevronDown
            className={`w-5 h-5 text-zinc-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-[#D4AF37]' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu Overlay */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-40 mt-2 bg-zinc-950/98 border border-[#D4AF37]/40 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-zinc-900 animate-in fade-in slide-in-from-top-2 duration-150 max-h-96 overflow-y-auto">
            {MUSIC_GENRES.map((genre) => {
              const isCurrent = genre.id === selectedGenre.id;
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleSelect(genre)}
                  className={`w-full p-3.5 text-left transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#D4AF37]/15 text-white border-l-4 border-[#D4AF37]'
                      : 'hover:bg-zinc-900/90 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-['Syne',sans-serif]">
                        {genre.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#D4AF37] font-semibold">
                        {genre.tempo}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {genre.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {genre.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-300/90">
                      <Users className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{genre.crowdMood}</span>
                    </div>
                  </div>

                  <div className="shrink-0 mt-0.5">
                    {isCurrent ? (
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-zinc-700 inline-block"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Select Buttons (Afro-Rap, Acoustic, Instrumental, etc.) */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {MUSIC_GENRES.map((g) => {
          const isSelected = g.id === selectedGenre.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => handleSelect(g)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                isSelected
                  ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37] shadow-sm'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Radio className={`w-2.5 h-2.5 ${isSelected ? 'text-black' : 'text-zinc-600'}`} />
              <span>{g.name}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Live Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
        {/* Crowd behavior */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-[#D4AF37] shrink-0 mt-0.5">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] block">
              Comportement de la Foule (100k)
            </span>
            <p className="text-xs text-zinc-300 mt-0.5 leading-snug">{selectedGenre.crowdMood}</p>
          </div>
        </div>

        {/* Lighting & Stage FX */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400/90 block">
              Scénographie & Éclairage
            </span>
            <p className="text-xs text-zinc-300 mt-0.5 leading-snug">{selectedGenre.lightingStyle}</p>
          </div>
        </div>
      </div>

      {/* Slider Control: Balance Crowd Intensity with Selected Background Music */}
      <div className="p-4 rounded-xl bg-zinc-950/85 border border-[#2C2C2C] space-y-3 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block font-['Syne',sans-serif]">
                Volume & Intensité Sonore de la Foule du Stade
              </span>
              <span className="text-[10px] text-zinc-400">
                Équilibre l'intensité de la clameur avec la musique {selectedGenre.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Preview button */}
            <button
              type="button"
              onClick={handlePreviewMusicAndCrowd}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all shadow-sm ${
                isPlayingPreview
                  ? 'bg-[#D4AF37] text-black animate-pulse'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700'
              }`}
              title="Écouter un extrait audio synthétisé (musique + clameur du stade)"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isPlayingPreview ? 'Écoute...' : 'Tester le Mix'}</span>
            </button>

            {onToggleAudio && (
              <button
                type="button"
                onClick={onToggleAudio}
                className={`text-[11px] px-2 py-1 rounded-lg font-semibold transition-all border ${
                  isAudioActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                }`}
                title={isAudioActive ? 'Désactiver le son continu' : 'Activer l’ambiance continue'}
              >
                {isAudioActive ? (
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ON</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>OFF</span>
                  </span>
                )}
              </button>
            )}

            <span className="text-xs font-mono font-bold text-[#D4AF37] bg-black/60 px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 min-w-[45px] text-center">
              {volumePercent}%
            </span>
          </div>
        </div>

        {/* Dual Balance Visualizer & Slider Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-zinc-400 flex items-center gap-1">
              <Music className="w-3 h-3 text-[#D4AF37]" />
              <span>Musique pure ({100 - volumePercent}%)</span>
            </span>
            <span className="text-zinc-500 font-normal">Balance dynamique</span>
            <span className="text-[#D4AF37] flex items-center gap-1 font-bold">
              <Flame className="w-3 h-3 text-[#D4AF37]" />
              <span>Foule du Stade ({volumePercent}%)</span>
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={volumePercent}
              onChange={(e) => onCrowdVolumeChange(parseFloat(e.target.value) / 100)}
              className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50"
              title={`Volume foule : ${volumePercent}%`}
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onCrowdVolumeChange(0.2)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  volumePercent <= 25 && volumePercent > 0
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                Intimiste (20%)
              </button>
              <button
                type="button"
                onClick={() => onCrowdVolumeChange(0.55)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  volumePercent >= 50 && volumePercent <= 65
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                Équilibré (55%)
              </button>
              <button
                type="button"
                onClick={() => onCrowdVolumeChange(0.85)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  volumePercent >= 75 && volumePercent <= 90
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                Concert Fervent (85%)
              </button>
              <button
                type="button"
                onClick={() => onCrowdVolumeChange(1.0)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  volumePercent > 90
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                Stade en Folie (100%)
              </button>
            </div>

            <button
              type="button"
              onClick={() => onCrowdVolumeChange(0)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Muter foule
            </button>
          </div>
        </div>

        {/* Dynamic balance description text */}
        <p className="text-[11px] text-zinc-300 leading-snug pt-1 border-t border-zinc-900 font-medium">
          🎧 {getBalanceDescription(volumePercent)}
        </p>
      </div>

      {/* Quick Action Button to re-inject into prompt if needed */}
      {onApplyToPrompt && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px]">
            La balance sonore ({volumePercent}%) et le genre ({selectedGenre.name}) sont synchronisés avec Veo.
          </span>
          <button
            type="button"
            onClick={() => onApplyToPrompt(selectedGenre.promptSnippet)}
            className="text-[#D4AF37] hover:text-amber-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <span>+ Ajouter au prompt</span>
          </button>
        </div>
      )}
    </div>
  );
};
