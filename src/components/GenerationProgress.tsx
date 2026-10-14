import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Flame, Camera, ShieldCheck, Film } from 'lucide-react';
import { AspectRatio } from '../types';

interface GenerationProgressProps {
  operationName: string;
  aspectRatio: AspectRatio;
  onCancel?: () => void;
}

const STAGES = [
  {
    title: 'Analyse biométrique faciale',
    detail: "Verrouillage des traits d'Oude Mill et de sa tenue street-luxe sans altération.",
    icon: ShieldCheck,
  },
  {
    title: 'Génération du stade & 100 000 spectateurs',
    detail: 'Création des tribunes pleines, de la marée humaine, des drapeaux et des bras levés.',
    icon: Flame,
  },
  {
    title: 'Chorégraphie des éclairages & pyrotechnie',
    detail: 'Synchronisation des feux d’artifice, faisceaux lasers cyan et écrans géants LED.',
    icon: Sparkles,
  },
  {
    title: 'Rendu cinématique Veo 3.1 Fast',
    detail: 'Calcul des mouvements de caméra fluides du drone vers la scène et la foule.',
    icon: Camera,
  },
  {
    title: 'Finalisation & encodage du flux MP4',
    detail: 'Optimisation de la netteté et assemblage audio-visuel haute définition.',
    icon: Film,
  },
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  operationName,
  aspectRatio,
  onCancel,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        // Dynamically advance stage index based on typical Veo timeline (approx 60-90s)
        if (next > 45) setCurrentStageIndex(3);
        else if (next > 30) setCurrentStageIndex(2);
        else if (next > 15) setCurrentStageIndex(1);
        else setCurrentStageIndex(0);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#10121d]/95 rounded-2xl border border-rose-500/40 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Dynamic stadium concert light glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 blur-sm animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Top status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-['Syne',sans-serif]">
                  Génération Veo 3.1 Fast en cours...
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {aspectRatio}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                La vidéo cinématique du concert d’Oude Mill est en train d'être générée par l'IA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-right">
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Temps écoulé</span>
              <span className="text-sm font-mono font-bold text-amber-400">{formatTime(secondsElapsed)}</span>
            </div>
          </div>
        </div>

        {/* Animated concert equalizer bar */}
        <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/80 flex items-center justify-between gap-1 overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-rose-600 via-amber-500 to-cyan-400 transition-all duration-300"
              style={{
                height: `${Math.max(8, Math.sin((secondsElapsed * 2 + i * 0.4)) * 26 + 18)}px`,
                opacity: 0.6 + (i % 3) * 0.15,
              }}
            ></div>
          ))}
        </div>

        {/* Milestones list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stage.title}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-rose-500/10 border-rose-500/50 shadow-md shadow-rose-950/20'
                    : isDone
                    ? 'bg-zinc-900/60 border-zinc-800/80 opacity-80'
                    : 'bg-zinc-950/40 border-zinc-900 opacity-40'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-rose-500 text-white animate-pulse'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-rose-200' : isDone ? 'text-zinc-200' : 'text-zinc-500'
                      }`}
                    >
                      {stage.title}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{stage.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassuring message footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-zinc-400 border-t border-zinc-800/80">
          <p>
            ℹ️ <span className="text-zinc-300 font-medium">Veo Video Engine</span> : Le rendu physique des lumières de stade et des foules volumétriques prend environ 1 à 2 minutes. Restez sur cette page.
          </p>
          <div className="font-mono text-[10px] text-zinc-500 truncate max-w-[200px]" title={operationName}>
            Op: {operationName}
          </div>
        </div>
      </div>
    </div>
  );
};
