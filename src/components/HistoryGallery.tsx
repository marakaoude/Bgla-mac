import React, { useState } from 'react';
import { Film, Download, Trash2, Calendar, Play, Share2, Sparkles, FolderDown } from 'lucide-react';
import { GenerationJob } from '../types';
import { VideoShareModal } from './VideoShareModal';
import { downloadVideoToLocalStorage, isFileSystemAccessSupported } from '../utils/videoExport';

interface HistoryGalleryProps {
  jobs: GenerationJob[];
  onSelectJob: (job: GenerationJob) => void;
  onClearHistory: () => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({
  jobs,
  onSelectJob,
  onClearHistory,
}) => {
  const [shareModalJob, setShareModalJob] = useState<GenerationJob | null>(null);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);

  if (jobs.length === 0) return null;

  const handleDownloadJob = async (e: React.MouseEvent, job: GenerationJob, usePicker: boolean = false) => {
    e.stopPropagation();
    try {
      setDownloadingJobId(job.id);
      const streamUrl = job.videoUrl || `/api/video-stream?operationName=${encodeURIComponent(job.operationName)}`;
      const cleanRatio = job.aspectRatio.replace(':', 'x');
      const fileName = `Oude_Mill_Concert_${cleanRatio}_${job.id}.mp4`;
      await downloadVideoToLocalStorage(streamUrl, fileName, usePicker);
    } catch (err) {
      console.error('Download job error:', err);
    } finally {
      setDownloadingJobId(null);
    }
  };

  const handleOpenShare = (e: React.MouseEvent, job: GenerationJob) => {
    e.stopPropagation();
    setShareModalJob(job);
  };

  return (
    <div className="bg-[#10121d]/90 rounded-2xl border border-zinc-800/80 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Syne',sans-serif]">
              Historique des Vidéos Générées ({jobs.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Téléchargez directement vers votre stockage local ou partagez sur vos applications
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Effacer l'historique</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {jobs.map((job) => {
          const streamUrl = job.videoUrl || `/api/video-stream?operationName=${encodeURIComponent(job.operationName)}`;

          return (
            <div
              key={job.id}
              className="bg-zinc-950/80 rounded-xl border border-zinc-800/80 overflow-hidden hover:border-[#D4AF37]/60 transition-all flex flex-col group shadow-lg"
            >
              <div
                onClick={() => onSelectJob(job)}
                className="relative cursor-pointer aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden"
              >
                {job.photoUrl ? (
                  <img
                    src={job.photoUrl}
                    alt="Source"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Film className="w-8 h-8 text-zinc-600" />
                )}

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>
                </div>

                <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-[#D4AF37] font-mono border border-[#D4AF37]/30">
                  {job.aspectRatio}
                </span>

                {job.musicGenre && (
                  <span className="absolute bottom-2 left-2 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/80 text-zinc-300 font-mono">
                    🎵 {job.musicGenre}
                  </span>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-snug">
                    {job.prompt}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectJob(job)}
                    className="text-xs text-[#D4AF37] hover:underline font-bold"
                  >
                    Visionner
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Choose folder if supported */}
                    {isFileSystemAccessSupported() && (
                      <button
                        type="button"
                        onClick={(e) => handleDownloadJob(e, job, true)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-[#D4AF37] transition-colors"
                        title="Enregistrer dans un dossier local au choix"
                      >
                        <FolderDown className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Direct Local Download */}
                    <button
                      type="button"
                      onClick={(e) => handleDownloadJob(e, job, false)}
                      disabled={downloadingJobId === job.id}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Télécharger sur le stockage local"
                    >
                      <Download className={`w-3.5 h-3.5 ${downloadingJobId === job.id ? 'animate-bounce' : ''}`} />
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenShare(e, job)}
                      className="p-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] hover:text-[#e6c148] transition-colors"
                      title="Partager directement"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Modal for history item */}
      {shareModalJob && (
        <VideoShareModal
          isOpen={Boolean(shareModalJob)}
          onClose={() => setShareModalJob(null)}
          videoUrl={shareModalJob.videoUrl || `/api/video-stream?operationName=${encodeURIComponent(shareModalJob.operationName)}`}
          operationName={shareModalJob.operationName}
          aspectRatio={shareModalJob.aspectRatio}
          promptUsed={shareModalJob.prompt}
          musicGenre={shareModalJob.musicGenre}
          title={`Oude Mill - Concert Live (${shareModalJob.musicGenre || '4K'})`}
        />
      )}
    </div>
  );
};
