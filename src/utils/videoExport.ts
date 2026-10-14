/**
 * Utility functions for downloading and sharing generated videos
 * to the user's local storage and native share targets.
 */

export interface DownloadProgressCallback {
  (progressPercent: number, statusText: string): void;
}

export interface ExportResult {
  success: boolean;
  method: 'filesystem_api' | 'blob_download' | 'native_share' | 'clipboard' | 'fallback_link';
  message: string;
  fileName?: string;
}

/**
 * Check if the browser supports File System Access API (showSaveFilePicker)
 * Allows the user to select the exact local directory/folder on their machine.
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

/**
 * Check if the browser supports Native Web Share API
 */
export function isNativeShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Check if Native Web Share can share file blobs directly
 */
export function canShareFiles(): boolean {
  if (!isNativeShareSupported() || typeof navigator.canShare !== 'function') {
    return false;
  }
  try {
    const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Sanitize filename to ensure safe local file naming
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Fetch video as a Blob with progress reporting
 */
export async function fetchVideoBlob(
  videoUrl: string,
  onProgress?: DownloadProgressCallback
): Promise<Blob> {
  onProgress?.(10, 'Connexion au flux vidéo MP4...');

  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`Impossible de récupérer le fichier vidéo (Code ${response.status})`);
  }

  const contentLength = response.headers.get('content-length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body || !totalBytes) {
    onProgress?.(50, 'Téléchargement de la vidéo...');
    const blob = await response.blob();
    onProgress?.(100, 'Téléchargement terminé !');
    return blob;
  }

  const reader = response.body.getReader();
  let receivedBytes = 0;
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (value) {
      chunks.push(value);
      receivedBytes += value.length;
      const percent = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
      const mbReceived = (receivedBytes / (1024 * 1024)).toFixed(1);
      const mbTotal = (totalBytes / (1024 * 1024)).toFixed(1);
      onProgress?.(percent, `Téléchargement : ${mbReceived} Mo / ${mbTotal} Mo (${percent}%)`);
    }
  }

  onProgress?.(100, 'Assemblage du fichier vidéo...');
  return new Blob(chunks as unknown as BlobPart[], { type: 'video/mp4' });
}

/**
 * 1. Download video directly to user's local storage using File System Access API
 * (allows selecting specific local folder e.g. Downloads, Desktop, USB drive)
 * or fallback to browser native blob download.
 */
export async function downloadVideoToLocalStorage(
  videoUrl: string,
  suggestedFileName: string = 'Oude_Mill_Concert_Veo.mp4',
  forceFolderPicker: boolean = false,
  onProgress?: DownloadProgressCallback
): Promise<ExportResult> {
  const cleanName = sanitizeFileName(suggestedFileName.endsWith('.mp4') ? suggestedFileName : `${suggestedFileName}.mp4`);

  try {
    // 1. Try File System Access API if requested & supported
    if (forceFolderPicker && isFileSystemAccessSupported()) {
      onProgress?.(15, 'Sélection de l\'emplacement local...');
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: cleanName,
          types: [
            {
              description: 'Vidéo MP4 de Concert Oude Mill',
              accept: { 'video/mp4': ['.mp4'] },
            },
          ],
        });

        onProgress?.(30, 'Récupération du flux vidéo...');
        const blob = await fetchVideoBlob(videoUrl, onProgress);

        onProgress?.(90, 'Écriture du fichier sur votre stockage local...');
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();

        onProgress?.(100, 'Fichier enregistré avec succès !');
        return {
          success: true,
          method: 'filesystem_api',
          fileName: cleanName,
          message: `Vidéo enregistrée avec succès dans le dossier sélectionné (${cleanName}).`,
        };
      } catch (pickerErr: any) {
        // User aborted the file picker dialog
        if (pickerErr.name === 'AbortError') {
          return {
            success: false,
            method: 'filesystem_api',
            message: 'Enregistrement annulé par l\'utilisateur.',
          };
        }
        console.warn('File System Picker failed, falling back to standard download:', pickerErr);
      }
    }

    // 2. Standard Blob download to user's local default download directory
    onProgress?.(20, 'Téléchargement de la vidéo vers votre stockage...');
    const blob = await fetchVideoBlob(videoUrl, onProgress);
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = cleanName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    }, 2000);

    onProgress?.(100, 'Vidéo enregistrée dans vos téléchargements locaux !');
    return {
      success: true,
      method: 'blob_download',
      fileName: cleanName,
      message: `La vidéo a été téléchargée dans vos fichiers locaux (${cleanName}).`,
    };
  } catch (error: any) {
    console.error('Download to local storage failed:', error);
    // Ultimate fallback: direct link click
    const fallbackLink = document.createElement('a');
    fallbackLink.href = videoUrl;
    fallbackLink.download = cleanName;
    fallbackLink.target = '_blank';
    fallbackLink.click();

    return {
      success: true,
      method: 'fallback_link',
      fileName: cleanName,
      message: 'Téléchargement direct lancé via le navigateur.',
    };
  }
}

/**
 * 2. Directly share video using Native Web Share API (with MP4 file attachment or URL)
 */
export async function shareVideoDirectly(
  videoUrl: string,
  title: string = 'Oude Mill - Concert Live Veo 3.1',
  text: string = 'Regarde cette vidéo exclusive de concert d\'Oude Mill générée en 4K ! 🎤🔥 #OudeMill #Veo31 #MaliRap',
  suggestedFileName: string = 'oude-mill-concert.mp4',
  onProgress?: DownloadProgressCallback
): Promise<ExportResult> {
  const cleanName = sanitizeFileName(suggestedFileName.endsWith('.mp4') ? suggestedFileName : `${suggestedFileName}.mp4`);
  const absoluteUrl = videoUrl.startsWith('http') ? videoUrl : `${window.location.origin}${videoUrl}`;

  if (!isNativeShareSupported()) {
    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\n${absoluteUrl}`);
      return {
        success: true,
        method: 'clipboard',
        message: 'Lien et texte copiés dans le presse-papiers ! Vous pouvez les coller dans n\'importe quelle application.',
      };
    } catch {
      return {
        success: false,
        method: 'clipboard',
        message: 'Partage natif non disponible sur ce navigateur.',
      };
    }
  }

  // Check if file sharing is supported
  const supportsFiles = canShareFiles();

  if (supportsFiles) {
    try {
      onProgress?.(30, 'Préparation de la vidéo pour le partage...');
      const blob = await fetchVideoBlob(videoUrl, onProgress);
      const file = new File([blob], cleanName, { type: 'video/mp4' });

      onProgress?.(80, 'Ouverture du volet de partage...');
      await navigator.share({
        files: [file],
        title,
        text,
      });

      onProgress?.(100, 'Partagé avec succès !');
      return {
        success: true,
        method: 'native_share',
        fileName: cleanName,
        message: 'Vidéo partagée avec succès !',
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          method: 'native_share',
          message: 'Partage annulé.',
        };
      }
      console.warn('File share failed, attempting text/url share fallback:', err);
    }
  }

  // Fallback to text & URL share
  try {
    await navigator.share({
      title,
      text,
      url: absoluteUrl,
    });
    return {
      success: true,
      method: 'native_share',
      message: 'Lien de la vidéo partagé !',
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        method: 'native_share',
        message: 'Partage annulé.',
      };
    }
    // Clipboard fallback
    await navigator.clipboard.writeText(`${text}\n${absoluteUrl}`);
    return {
      success: true,
      method: 'clipboard',
      message: 'Lien copié dans le presse-papiers !',
    };
  }
}

/**
 * Generate 1-click social media sharing URLs
 */
export function getSocialShareUrls(
  videoUrl: string,
  title: string = 'Oude Mill - Concert Live Veo 3.1',
  description: string = 'Découvrez la vidéo de concert d\'Oude Mill en 4K ! 🎤🔥'
) {
  const absoluteUrl = videoUrl.startsWith('http') ? videoUrl : `${typeof window !== 'undefined' ? window.location.origin : ''}${videoUrl}`;
  const fullText = `${title}\n${description}\n${absoluteUrl}`;

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(absoluteUrl)}&text=${encodeURIComponent(`${title} - ${description}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} 🎤🔥 #OudeMill #MaliRap #Veo31`)}&url=${encodeURIComponent(absoluteUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`,
    sms: `sms:?body=${encodeURIComponent(`${title} : ${absoluteUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nVisionner ici : ${absoluteUrl}`)}`,
  };
}
