import React from 'react';
import { Camera, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { OUDE_MILL_SAMPLE_IMAGE } from '../../data/presets';

interface GalleryPhoto {
  id: string;
  title: string;
  outfit: string;
  context: string;
  dataUrl: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'p1',
    title: 'Tenue de Scène Street-Luxe (Floral & Chaînes)',
    outfit: 'T-shirt imprimé monogrammé multicolore, casquette trucker et double chaîne diamant.',
    context: 'Séance photo studio officielle pour la promo de la tournée mondiale.',
    dataUrl: OUDE_MILL_SAMPLE_IMAGE,
  },
  {
    id: 'p2',
    title: 'Arrivée Backstage sous Escorte',
    outfit: 'Veste bomber noire satinée, lunettes de soleil teintées et sneakers montantes.',
    context: 'Coulisses du Stade du 26-Mars quelques minutes avant l’entrée en scène.',
    dataUrl: OUDE_MILL_SAMPLE_IMAGE,
  },
  {
    id: 'p3',
    title: 'Performance Micro en Or',
    outfit: 'Tenue de concert brodée d’or, micro sans fil doré et montre sertie.',
    context: 'Plan serré capturant l’intensité de l’interprétation devant 80 000 spectateurs.',
    dataUrl: OUDE_MILL_SAMPLE_IMAGE,
  },
];

interface GalleryScreenProps {
  onSelectPhotoForStudio: (dataUrl: string, name: string) => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ onSelectPhotoForStudio }) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative rounded-[16px] overflow-hidden bg-gradient-to-r from-[#181818] via-[#201c13] to-[#181818] border border-[#D4AF37]/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            <span>Galerie Visuelle Officielle • Oude Mill</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
            PHOTOS OFFICIELLES PRÊTES POUR VEO 3.1
          </h2>
          <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Sélectionnez n’importe quelle photo officielle d’Oude Mill pour l’envoyer directement dans le Studio Vidéo. Son visage exact et sa tenue seront rigoureusement préservés lors de l’animation 4K.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {GALLERY_PHOTOS.map((photo) => (
          <div
            key={photo.id}
            className="rounded-[16px] bg-[#1D1D1D] border border-[#2C2C2C] hover:border-[#D4AF37]/60 overflow-hidden transition-all flex flex-col group shadow-lg"
          >
            <div className="relative aspect-[3/4] bg-[#141414] overflow-hidden flex items-center justify-center p-2">
              <img
                src={photo.dataUrl}
                alt={photo.title}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#D4AF37]/40 text-[10px] font-bold text-[#D4AF37]">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                <span>Fidélité 100%</span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white font-['Syne',sans-serif] group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {photo.title}
                </h3>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  {photo.outfit}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1 italic">
                  {photo.context}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectPhotoForStudio(photo.dataUrl, photo.title)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#e6c148] text-black text-xs font-bold transition-all shadow-md shadow-[#D4AF37]/20 hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Utiliser dans le Studio Vidéo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
