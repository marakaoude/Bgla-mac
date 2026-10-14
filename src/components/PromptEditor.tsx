import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Camera,
  Flame,
  Undo2,
  Check,
  Zap,
  Sliders,
  Radio,
  Loader2,
  Music,
  Users,
} from 'lucide-react';
import { STADIUM_PRESETS, CAMERA_MOVES, STAGE_FX, DEFAULT_CONCERT_PROMPT, MUSIC_GENRES } from '../data/presets';
import { CINEMATIC_FILTER_OPTIONS } from '../data/cinematicFilters';
import { StadiumPreset, CameraMovePreset, StageFXPreset, MusicGenre, CinematicFilterOption } from '../types';

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onEnhanceWithAI: () => Promise<void>;
  isEnhancing: boolean;
  selectedGenre?: MusicGenre;
  crowdVolume?: number;
  onSelectGenre?: (genre: MusicGenre) => void;
  selectedCameraMovement?: string;
  onSelectCameraMovement?: (move: string) => void;
  selectedCinematicFilter?: string;
  onSelectCinematicFilter?: (filter: string) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onPromptChange,
  onEnhanceWithAI,
  isEnhancing,
  selectedGenre,
  crowdVolume = 0.65,
  onSelectGenre,
  selectedCameraMovement,
  onSelectCameraMovement,
  selectedCinematicFilter,
  onSelectCinematicFilter,
}) => {
  const [selectedStadium, setSelectedStadium] = useState<string>('stade-26-mars');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const applyStadium = (stadium: StadiumPreset) => {
    setSelectedStadium(stadium.id);
    const addition = ` [Stade : ${stadium.name} à ${stadium.city} (${stadium.country}), ${stadium.capacity}, ${stadium.vibe}]`;
    if (!prompt.includes(stadium.name)) {
      onPromptChange(prompt + '\n\n' + addition);
    }
  };

  const applyCameraMove = (camera: CameraMovePreset) => {
    onPromptChange(prompt + '\n\n' + camera.promptSnippet);
  };

  const applyCinematicFilter = (filter: CinematicFilterOption) => {
    if (onSelectCinematicFilter) onSelectCinematicFilter(filter.name);
    if (!prompt.includes(filter.name)) {
      onPromptChange(prompt + '\n\n' + filter.constraintPrompt);
    }
  };

  const applyStageFX = (fx: StageFXPreset) => {
    onPromptChange(prompt + '\n\nEffets scéniques additionnels : ' + fx.promptSnippet);
  };

  const applyGenreDirectly = (genre: MusicGenre) => {
    if (onSelectGenre) onSelectGenre(genre);
    if (!prompt.includes(genre.name)) {
      onPromptChange(prompt + '\n\n' + genre.promptSnippet);
    }
  };

  const resetToDefault = () => {
    onPromptChange(DEFAULT_CONCERT_PROMPT);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="bg-[#1D1D1D] rounded-[16px] border border-[#2C2C2C] p-5 shadow-xl relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Syne',sans-serif]">
              2. Prompt Scénique Cinématique Oude Mill
            </h2>
            <p className="text-xs text-zinc-400">
              Chorégraphie du concert géant, des projecteurs, de la foule et des mouvements de caméra
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToDefault}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
            title="Revenir au prompt original du brief"
          >
            <Undo2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={copyPrompt}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[#D4AF37]">Copié</span>
              </>
            ) : (
              <span>Copier</span>
            )}
          </button>

          <button
            type="button"
            onClick={onEnhanceWithAI}
            disabled={isEnhancing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#e6c148] text-black text-xs font-bold shadow-md shadow-[#D4AF37]/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Optimisation IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enrichir avec Gemini IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Synchronized Genre & Crowd Balance Pill Bar */}
      {selectedGenre && (
        <div className="mb-3 p-2.5 rounded-xl bg-zinc-950/70 border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#D4AF37]/15 text-[#D4AF37]">
              <Music className="w-3.5 h-3.5" />
            </span>
            <span className="text-zinc-300 font-medium">
              Ambiance synchronisée : <strong className="text-white">{selectedGenre.name}</strong> ({selectedGenre.tempo})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#D4AF37]" />
              <span>Foule : <strong className="text-[#D4AF37]">{Math.round(crowdVolume * 100)}%</strong></span>
            </span>
            <button
              type="button"
              onClick={() => applyGenreDirectly(selectedGenre)}
              className="text-[11px] px-2 py-0.5 rounded bg-[#252525] hover:bg-[#303030] text-[#D4AF37] border border-[#D4AF37]/30 transition-colors font-semibold"
            >
              + Injecter dans le texte
            </button>
          </div>
        </div>
      )}

      {/* Active Camera Movement Constraint Pill Bar */}
      {selectedCameraMovement && (
        <div className="mb-3 p-2.5 rounded-xl bg-zinc-950/70 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-500/15 text-cyan-400">
              <Camera className="w-3.5 h-3.5" />
            </span>
            <span className="text-zinc-300 font-medium">
              Contrainte Caméra Veo : <strong className="text-cyan-300">{selectedCameraMovement}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 hidden sm:inline">Imposé au moteur IA</span>
            <button
              type="button"
              onClick={() => {
                if (!prompt.includes(selectedCameraMovement)) {
                  onPromptChange(prompt + `\n\n[Contrainte Mouvement de Caméra : ${selectedCameraMovement}]`);
                }
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-[#252525] hover:bg-[#303030] text-cyan-400 border border-cyan-500/30 transition-colors font-semibold cursor-pointer"
            >
              + Injecter dans le texte
            </button>
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative mb-4">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={7}
          className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all leading-relaxed font-mono"
          placeholder="Décrivez la mise en scène du concert d'Oude Mill..."
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-zinc-500 font-mono">
          {prompt.length} caractères
        </div>
      </div>

      {/* Quick Additions Bar */}
      <div className="space-y-3.5 pt-1">
        {/* Stadiums */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Choix du Stade Mondial :</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STADIUM_PRESETS.map((stadium) => {
              const isSelected = selectedStadium === stadium.id;
              return (
                <button
                  key={stadium.id}
                  type="button"
                  onClick={() => applyStadium(stadium)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600/20 border-rose-500/50 text-rose-200 font-semibold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <Radio className={`w-3 h-3 ${isSelected ? 'text-rose-400' : 'text-zinc-600'}`} />
                  <span>{stadium.name}</span>
                  <span className="text-[10px] text-zinc-500 hidden sm:inline">({stadium.city})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Camera choreography */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chorégraphie Caméra :</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CAMERA_MOVES.map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => applyCameraMove(cam)}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                title={cam.description}
              >
                <span>+</span>
                <span>{cam.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pyrotechnics & Visual FX */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Effets Scéniques & Pyrotechnie :</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STAGE_FX.map((fx) => (
              <button
                key={fx.id}
                type="button"
                onClick={() => applyStageFX(fx)}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{fx.icon}</span>
                <span>{fx.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cinematic Filters & Post-processing */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Filtres Cinématographiques & Post-Traitement :</span>
            </span>
            {selectedCinematicFilter && (
              <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
                Actif : {selectedCinematicFilter}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CINEMATIC_FILTER_OPTIONS.map((f) => {
              const isActive = selectedCinematicFilter === f.name;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => applyCinematicFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800/80 hover:border-[#D4AF37]/40 text-zinc-300 hover:text-[#D4AF37]'
                  }`}
                  title={f.description}
                >
                  <span>{f.icon}</span>
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
