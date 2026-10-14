import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  FolderDown,
  HardDrive,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Send,
  MessageCircle,
  Film,
  Code,
  ShieldCheck,
  ExternalLink,
  Layers,
  AlertCircle,
  FileVideo,
} from 'lucide-react';
import { AspectRatio } from '../types';
import {
  downloadVideoToLocalStorage,
  shareVideoDirectly,
  getSocialShareUrls,
  isFileSystemAccessSupported,
  isNativeShareSupported,
  canShareFiles,
  ExportResult,
} from '../utils/videoExport';

interface VideoShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  operationName: string;
  aspectRatio: AspectRatio;
  promptUsed?: string;
  musicGenre?: string;
  title?: string;
}

export const VideoShareModal: React.FC<VideoShareModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  operationName,
  aspectRatio,
  promptUsed = "Performance live d'Oude Mill",
  musicGenre = 'Afro-Rap Malien',
  title = "Oude Mill - Concert Live Veo 3.1",
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'share' | 'copy'>('download');
  const [customFileName, setCustomFileName] = useState(() => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const ratioClean = aspectRatio.replace(':', 'x');
    return `Oude_Mill_Concert_${ratioClean}_${dateStr}.mp4`;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [resultToast, setResultToast] = useState<ExportResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const absoluteVideoUrl = videoUrl.startsWith('http')
    ? videoUrl
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${videoUrl}`;

  const socialUrls = getSocialShareUrls(
    absoluteVideoUrl,
    title,
    `Vidéo de concert d'Oude Mill en qualité 4K (${musicGenre}). Générée avec Google Veo 3.1 !`
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // 1. Download to local storage (Default folder or Custom Directory Picker)
  const handleDownload = async (useFolderPicker: boolean = false) => {
    try {
      setIsProcessing(true);
      setProgressPercent(5);
      setProgressStatus('Démarrage...');
      setResultToast(null);

      const res = await downloadVideoToLocalStorage(
        videoUrl,
        customFileName,
        useFolderPicker,
        (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        }
      );

      setResultToast(res);
    } catch (err: any) {
      setResultToast({
        success: false,
        method: 'blob_download',
        message: err?.message || 'Erreur lors du téléchargement local.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Direct Native Share with File attachment
  const handleNativeShare = async () => {
    try {
      setIsProcessing(true);
      setProgressPercent(10);
      setProgressStatus('Préparation du partage natif...');
      setResultToast(null);

      const shareText = `Découvre cette vidéo exclusive de concert d'Oude Mill (${musicGenre}) ! 🎤🔥 #OudeMill #Veo31 #MaliRap`;
      const res = await shareVideoDirectly(
        videoUrl,
        title,
        shareText,
        customFileName,
        (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        }
      );

      setResultToast(res);
    } catch (err: any) {
      setResultToast({
        success: false,
        method: 'native_share',
        message: err?.message || 'Échec du partage.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const socialPlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: socialUrls.whatsapp,
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      badge: 'Message direct',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      url: socialUrls.telegram,
      icon: Send,
      color: 'bg-sky-600 hover:bg-sky-500 text-white',
      badge: 'Canal & Groupe',
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      url: socialUrls.twitter,
      icon: ExternalLink,
      color: 'bg-neutral-800 hover:bg-neutral-700 text-white',
      badge: 'Publication',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: socialUrls.facebook,
      icon: Share2,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      badge: 'Feed & Stories',
    },
    {
      id: 'sms',
      name: 'SMS / iMessage',
      url: socialUrls.sms,
      icon: Smartphone,
      color: 'bg-amber-600 hover:bg-amber-500 text-white',
      badge: 'Mobile',
    },
    {
      id: 'email',
      name: 'Email',
      url: socialUrls.email,
      icon: Send,
      color: 'bg-purple-600 hover:bg-purple-500 text-white',
      badge: 'Lien direct',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/40 rounded-[20px] shadow-2xl overflow-hidden my-6">
        {/* Decorative concert glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between p-5 border-b border-[#2C2C2C] bg-[#1A1A1A]/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D4AF37] text-black font-black shadow-md shadow-[#D4AF37]/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-['Syne',sans-serif] uppercase tracking-wide">
                  Partager & Télécharger la Vidéo
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MP4 Haute Définition
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Enregistrement local direct ou diffusion immédiate vers vos applications
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Summary Card */}
        <div className="relative z-10 p-5 bg-[#181818]/60 border-b border-[#2C2C2C] flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-black border border-[#2C2C2C] relative shrink-0 flex items-center justify-center">
            <video
              src={videoUrl}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/80 text-white font-bold">
              {aspectRatio}
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h4 className="text-sm font-bold text-white font-['Syne',sans-serif]">
              {title}
            </h4>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                🎵 {musicGenre}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                📐 Format {aspectRatio}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Veo 3.1 Fast HD
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="relative z-10 px-5 pt-4 bg-[#141414] border-b border-[#2C2C2C] flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'download'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Stockage Local (Téléchargement)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'share'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Partage Direct (Réseaux & Apps)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('copy')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'copy'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Liens & Embed</span>
          </button>
        </div>

        {/* Progress Bar (Visible while processing) */}
        {isProcessing && (
          <div className="relative z-10 p-4 bg-zinc-900/90 border-b border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold mb-2">
              <span className="flex items-center gap-2 text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                {progressStatus || 'Traitement en cours...'}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Toast / Result Message */}
        {resultToast && (
          <div
            className={`relative z-10 m-5 p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              resultToast.success
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {resultToast.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{resultToast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setResultToast(null)}
              className="text-zinc-400 hover:text-white font-bold p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: Local Storage Download */}
        {activeTab === 'download' && (
          <div className="p-5 space-y-5">
            {/* Custom File Name Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Nom du fichier vidéo local (.mp4) :</span>
                <span className="text-[11px] text-zinc-500">Personnalisable</span>
              </label>
              <div className="flex items-center bg-[#1A1A1A] border border-[#2C2C2C] focus-within:border-[#D4AF37] rounded-xl px-3 py-2 transition-all">
                <FileVideo className="w-4 h-4 text-[#D4AF37] mr-2 shrink-0" />
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none w-full font-mono"
                  placeholder="nom_du_fichier.mp4"
                />
              </div>
            </div>

            {/* Action buttons for local storage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Option 1: File System Access (Choose Folder) */}
              <button
                type="button"
                onClick={() => handleDownload(true)}
                disabled={isProcessing}
                className="flex flex-col items-start p-4 rounded-xl bg-gradient-to-br from-[#1E1E1E] to-[#252525] border border-[#D4AF37]/50 hover:border-[#D4AF37] hover:scale-[1.01] transition-all text-left group shadow-lg"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-2 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                    <FolderDown className="w-5 h-5" />
                  </div>
                  {isFileSystemAccessSupported() && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Sélecteur de dossier
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  Choisir l'emplacement local
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Sélectionnez précisément le dossier de destination (Vidéos, Bureau, Disque externe, USB).
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
                  <span>Parcourir & Enregistrer</span> →
                </span>
              </button>

              {/* Option 2: Standard Direct Download */}
              <button
                type="button"
                onClick={() => handleDownload(false)}
                disabled={isProcessing}
                className="flex flex-col items-start p-4 rounded-xl bg-gradient-to-br from-[#1E1E1E] to-[#252525] border border-[#333] hover:border-emerald-500 hover:scale-[1.01] transition-all text-left group shadow-lg"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    Téléchargements par défaut
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Téléchargement Direct 1-Clic
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Enregistre instantanément le fichier MP4 dans le dossier "Téléchargements" de votre appareil.
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span>Lancer le téléchargement</span> →
                </span>
              </button>
            </div>

            {/* Local Storage info badge */}
            <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C] flex items-start gap-3 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Stockage Local 100% Hors-Ligne :</span> Une fois téléchargée, la vidéo MP4 reste accessible de manière permanente sur votre téléphone, tablette ou ordinateur sans connexion Internet, prête à être montée dans CapCut, Premiere ou lue dans VLC.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Direct Share to Apps & Social Networks */}
        {activeTab === 'share' && (
          <div className="p-5 space-y-5">
            {/* Native OS Share Button (WhatsApp, TikTok, AirDrop, etc.) */}
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isProcessing}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-[#e6c148] hover:to-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#D4AF37]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Share2 className="w-5 h-5" />
              <span>
                {canShareFiles()
                  ? "Partager le fichier MP4 directement (WhatsApp, TikTok, Réseaux...)"
                  : "Ouvrir le menu de partage de l'appareil"}
              </span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2C2C2C]" />
              </div>
              <span className="relative px-3 bg-[#141414] text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Ou partager sur une plateforme en 1 clic
              </span>
            </div>

            {/* Social network shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {socialPlatforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <a
                    key={platform.id}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2.5 p-3 rounded-xl transition-all font-semibold text-xs shadow-md ${platform.color} hover:scale-[1.02]`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <div className="text-left truncate">
                      <div className="font-bold leading-tight truncate">{platform.name}</div>
                      <div className="text-[10px] opacity-80 font-normal truncate">{platform.badge}</div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Prompt snippet for TikTok / Reels */}
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">
                  Légende recommandée pour TikTok & Instagram Reels :
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `Oude Mill en concert géant ! 🎤🔥 Hit : ${musicGenre}\nVidéo générée avec Veo 3.1 #OudeMill #MaliRap #Bamako #Concert`,
                      'caption'
                    )
                  }
                  className="text-[11px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'caption' ? 'Copié !' : 'Copier texte'}</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono bg-black/50 p-2 rounded-lg border border-zinc-800">
                Oude Mill en concert géant ! 🎤🔥 Hit : {musicGenre} #OudeMill #MaliRap #Bamako #Concert
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Copy Links & Embed */}
        {activeTab === 'copy' && (
          <div className="p-5 space-y-4">
            {/* Direct MP4 URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Lien direct du fichier vidéo MP4 (Haute qualité) :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={absoluteVideoUrl}
                  className="bg-[#1A1A1A] border border-[#2C2C2C] text-xs text-zinc-300 rounded-xl px-3 py-2 w-full font-mono select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(absoluteVideoUrl, 'mp4Url')}
                  className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6c148] text-black font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md"
                >
                  {copiedKey === 'mp4Url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'mp4Url' ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>

            {/* Web embed code */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Code d'intégration HTML5 (&lt;video&gt;) :
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={3}
                  value={`<video controls autoplay loop playsinline src="${absoluteVideoUrl}" width="100%"></video>`}
                  className="bg-[#1A1A1A] border border-[#2C2C2C] text-xs text-zinc-300 rounded-xl p-3 w-full font-mono select-all outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `<video controls autoplay loop playsinline src="${absoluteVideoUrl}" width="100%"></video>`,
                      'embed'
                    )
                  }
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedKey === 'embed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3" />}
                  <span>{copiedKey === 'embed' ? 'Copié !' : 'Copier code'}</span>
                </button>
              </div>
            </div>

            {/* Prompt used */}
            {promptUsed && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Prompt cinématique Veo utilisé :
                </label>
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-[11px] text-zinc-400 font-mono max-h-28 overflow-y-auto leading-relaxed">
                  {promptUsed}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="relative z-10 flex items-center justify-between p-4 bg-[#181818] border-t border-[#2C2C2C] text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Fichier MP4 H.264 compatible tous lecteurs</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
