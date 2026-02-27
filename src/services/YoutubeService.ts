import axios from 'axios';

export const YoutubeService = {
  /**
   * Extrait l'ID unique d'une vidéo YouTube depuis n'importe quel format d'URL
   */
  extractId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  },

  /**
   * Convertit le format de durée ISO 8601 de YouTube en secondes
   * Exemple: "PT1M30S" -> 90
   */
  parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  },

  /**
   * Récupère toutes les infos critiques de la vidéo (Droits, Durée, Statut)
   */
  async getFullVideoData(url: string) {
    const videoId = this.extractId(url);
    if (!videoId) throw new Error("Format d'URL YouTube invalide.");

    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) throw new Error("Clé API YouTube manquante sur le serveur.");

    const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${videoId}&key=${API_KEY}`;

    try {
      const { data } = await axios.get(endpoint);
      
      if (!data.items || data.items.length === 0) {
        throw new Error("Vidéo introuvable sur YouTube (elle est peut-être privée).");
      }

      const video = data.items[0];

      return {
        videoId,
        title: video.snippet.title,
        durationSeconds: this.parseDuration(video.contentDetails.duration),
        isEmbeddable: video.status.embeddable,
        privacyStatus: video.status.privacyStatus,
        rejectionReason: video.status.rejectionReason, // 'copyright' si bloqué
        license: video.status.license,
      };
    } catch (error: any) {
      throw new Error(`Erreur API YouTube: ${error.message}`);
    }
  }
};