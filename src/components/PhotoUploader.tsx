import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, ShieldCheck, RefreshCw, Sparkles, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { AspectRatio } from '../types';
import { OUDE_MILL_SAMPLE_IMAGE } from '../data/presets';

interface PhotoUploaderProps {
  currentPhoto: string | null;
  onPhotoSelected: (base64: string, sourceName: string) => void;
  aspectRatio: AspectRatio;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  currentPhoto,
  onPhotoSelected,
  aspectRatio,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [photoSource, setPhotoSource] = useState<string>(
    currentPhoto ? 'Photo Oude Mill (Préréglage)' : 'Aucune photo'
  );
  const [showFullPreview, setShowFullPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onPhotoSelected(result, file.name);
        setPhotoSource(`Fichier : ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const loadPresetPhoto = () => {
    onPhotoSelected(OUDE_MILL_SAMPLE_IMAGE, 'Oude Mill (Concert Outfit Preset)');
    setPhotoSource('Oude Mill (Tenue de scène Street-Luxe)');
  };

  return (
    <div className="bg-[#1D1D1D] rounded-[16px] border border-[#2C2C2C] p-5 shadow-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Syne',sans-serif]">
              1. Photo Source d'Oude Mill
            </h2>
            <p className="text-xs text-zinc-400">
              Transformée en vidéo cinématique par le moteur Veo 3.1
            </p>
          </div>
        </div>

        {/* Likeness guarantee badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fidélité Visage 100%</span>
        </div>
      </div>

      {currentPhoto ? (
        <div className="space-y-3.5">
          {/* Photo preview container */}
          <div className="relative group rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 flex items-center justify-center p-1">
            <div
              className={`relative overflow-hidden rounded-lg transition-all flex items-center justify-center ${
                aspectRatio === '9:16'
                  ? 'w-[180px] h-[320px] max-w-full'
                  : 'w-full h-[220px]'
              }`}
            >
              <img
                src={currentPhoto}
                alt="Oude Mill"
                className="w-full h-full object-cover rounded-lg shadow-inner"
              />

              {/* Overlay with details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowFullPreview(true)}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/90 transition-colors"
                    title="Agrandir la photo"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-600/90 text-white uppercase tracking-wider">
                    Ratio {aspectRatio}
                  </span>
                  <p className="text-xs text-white font-medium truncate mt-1">{photoSource}</p>
                </div>
              </div>

              {/* Aspect ratio frame guide */}
              <div className="absolute inset-1 border border-dashed border-amber-400/40 rounded pointer-events-none"></div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-rose-400" />
              <span>Changer de Photo</span>
            </button>

            <button
              type="button"
              onClick={loadPresetPhoto}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
              title="Recharger le profil scène Oude Mill"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Préréglage Scène</span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-start gap-2 text-[11px] text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Image prête pour l'animation Veo. Les proportions physiques et l'identité faciale seront préservées avec une démarche d'artiste internationale assurée.
            </span>
          </div>
        </div>
      ) : (
        /* Empty dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-rose-500 bg-rose-500/10 scale-[0.99]'
              : 'border-zinc-700/80 bg-zinc-900/40 hover:border-rose-500/50 hover:bg-zinc-900/70'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              Déposez votre photo d'Oude Mill ici
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Glissez-déposez ou cliquez pour sélectionner (JPG, PNG)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-[11px] text-zinc-500">ou</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadPresetPhoto();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Utiliser la photo référence Oude Mill</span>
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Full Preview Modal */}
      {showFullPreview && currentPhoto && (
        <div
          onClick={() => setShowFullPreview(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-zinc-950 rounded-2xl border border-zinc-800 p-4 relative"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-white">Aperçu Photo Haute Définition</h3>
              <button
                type="button"
                onClick={() => setShowFullPreview(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold px-2 py-1"
              >
                ✕ Fermer
              </button>
            </div>
            <img
              src={currentPhoto}
              alt="Oude Mill Preview"
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
