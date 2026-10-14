import React, { useState } from 'react';
import { Play, Pause, Disc3, Sparkles, Volume2, ArrowRight, Music, Flame, Award } from 'lucide-react';
import { stadiumAudio } from '../../utils/audioSimulator';
import { MusicGenre } from '../../types';

interface Track {
  id: string;
  title: string;
  genre: string;
  genreId: string;
  year: string;
  duration: string;
  streams: string;
  bpm: string;
  description: string;
  lyrics: string;
}

const OFFICIAL_TRACKS: Track[] = [
  {
    id: 't1',
    title: 'Bamako By Night (Stade Anthem)',
    genre: 'Afro-Rap Malien',
    genreId: 'afro-rap',
    year: '2026',
    duration: '3:24',
    streams: '14.2M streams',
    bpm: '130 BPM',
    description: 'Le tube planétaire d’Oude Mill qui fait sauter 100 000 spectateurs au Stade du 26-Mars.',
    lyrics: '« Du fleuve Niger jusqu’aux toits du monde / Oude Mill fait trembler les ondes ! »',
  },
  {
    id: 't2',
    title: 'Kora & Diamants',
    genre: 'Acoustique Mandingue & Kora',
    genreId: 'acoustic',
    year: '2025',
    duration: '3:48',
    streams: '9.8M streams',
    bpm: '82 BPM',
    description: 'Ballade émouvante mêlant la kora traditionnelle et des harmonies vocales dorées.',
    lyrics: '« Dans la nuit du stade une mer d’étoiles brille / Rien n’arrête la marche d’Oude Mill. »',
  },
  {
    id: 't3',
    title: 'Sub-Bass Gladiator (808)',
    genre: 'Instrumental Épique & 808 Trap',
    genreId: 'instrumental-808',
    year: '2026',
    duration: '2:55',
    streams: '18.5M streams',
    bpm: '140 BPM',
    description: 'Production monumentale sans paroles, taillée pour faire vibrer les structures des stades.',
    lyrics: '« [Instrumental lourd - Cuivres & Infra-basses sismiques] »',
  },
  {
    id: 't4',
    title: 'Fête Panafricaine',
    genre: 'Afrobeats Solaire & Festif',
    genreId: 'afrobeats',
    year: '2026',
    duration: '3:12',
    streams: '11.1M streams',
    bpm: '108 BPM',
    description: 'Groove dansant et joyeux qui fait danser toutes les tribunes à l’unisson.',
    lyrics: '« Lève les mains, célèbre le son / Bamako, Paris, Londres à l’unisson ! »',
  },
  {
    id: 't5',
    title: 'Drill du 26-Mars',
    genre: 'Drill Bamako',
    genreId: 'drill-bamako',
    year: '2026',
    duration: '2:45',
    streams: '16.7M streams',
    bpm: '142 BPM',
    description: 'Rythme percutant et énergie brute streetwear avec attitude conquérante.',
    lyrics: '« Pas de faux pas, démarche assurée / Le roi de la drill est arrivé. »',
  },
  {
    id: 't6',
    title: 'Symphonie du Conquérant',
    genre: 'Symphonie de Stade Triomphale',
    genreId: 'symphonic-stadium',
    year: '2025',
    duration: '4:10',
    streams: '8.4M streams',
    bpm: '95 BPM',
    description: 'Intro royale de concert avec orchestre à cordes et pyrotechnie au zénith.',
    lyrics: '« Les portes s’ouvrent, la foule acclame / Oude Mill allume la flamme ! »',
  },
];

interface MusicScreenProps {
  onSelectTrackForVideo: (genreId: string, trackTitle: string) => void;
}

export const MusicScreen: React.FC<MusicScreenProps> = ({ onSelectTrackForVideo }) => {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const toggleTrackPlay = (track: Track) => {
    if (playingTrackId === track.id) {
      setPlayingTrackId(null);
      stadiumAudio.stop();
    } else {
      setPlayingTrackId(track.id);
      stadiumAudio.play();
      stadiumAudio.setGenre(track.genreId);
      stadiumAudio.triggerBassDrop();
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative rounded-[16px] overflow-hidden bg-gradient-to-r from-[#181818] via-[#201c13] to-[#181818] border border-[#D4AF37]/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Discographie Officielle • Oude Mill</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
              LES MORCEAUX QUI FONT VIBRER LES STADES
            </h2>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Explorez les hymnes de concert d’Oude Mill. Écoutez les ambiances sonores et envoyez n’importe quel morceau dans le Studio Vidéo Veo pour générer un concert synchronisé sur son rythme.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="p-4 rounded-[16px] bg-[#1D1D1D] border border-[#D4AF37]/20 text-center">
              <span className="text-2xl font-black text-[#D4AF37] block font-mono">78M+</span>
              <span className="text-[11px] text-zinc-400 font-medium">Écoutes Globales</span>
            </div>
            <div className="p-4 rounded-[16px] bg-[#1D1D1D] border border-[#D4AF37]/20 text-center">
              <span className="text-2xl font-black text-white block font-mono">6 Hits</span>
              <span className="text-[11px] text-zinc-400 font-medium">Numéro 1 Mali</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFICIAL_TRACKS.map((track) => {
          const isPlaying = playingTrackId === track.id;

          return (
            <div
              key={track.id}
              className={`rounded-[16px] bg-[#1D1D1D] border p-5 transition-all flex flex-col justify-between group ${
                isPlaying
                  ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                  : 'border-[#2C2C2C] hover:border-[#D4AF37]/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTrackPlay(track)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md ${
                        isPlaying
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-[#292929] text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37] hover:text-black'
                      }`}
                      title={isPlaying ? 'Mettre en pause' : 'Écouter l’ambiance stade'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      )}
                    </button>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors font-['Syne',sans-serif]">
                        {track.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="text-[#D4AF37] font-medium">{track.genre}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{track.bpm}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-medium text-zinc-400 bg-[#252525] px-2 py-0.5 rounded-full border border-zinc-800">
                    {track.duration}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-2.5">
                  {track.description}
                </p>

                <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#D4AF37] italic font-serif">
                  {track.lyrics}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{track.streams}</span>
                </span>

                <button
                  type="button"
                  onClick={() => onSelectTrackForVideo(track.genreId, track.title)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#e6c148] text-black text-xs font-bold transition-all shadow-md shadow-[#D4AF37]/20 hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Animer dans le Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
