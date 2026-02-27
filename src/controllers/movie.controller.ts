import { Request, Response } from 'express';
import movieModel from '../models/movie.model';
import { Director } from '../models/director.model';
import { uploadToScaleway } from '../services/uploadService';
import { TranslationService } from '../services/TranslationService';

// 1. RÉCUPÉRER TOUS LES FILMS
const getAllMovies = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 0;
    const search = req.query.search ? String(req.query.search) : '';
    const movies = await movieModel.getAll(userId, search);
    res.json(movies);
  } catch (error: any) {
    console.error('Erreur getAllMovies:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// 2. RÉCUPÉRER UN FILM PAR ID
const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await movieModel.getById(+id);
    if (!movie) return res.status(404).json({ error: "Film non trouvé" });
    res.json(movie);
  } catch (error: any) {
    console.error('Erreur getMovieById:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// 3. CRÉER UN FILM (AVEC TRADUCTION INTÉGRALE)
const createMovie = async (req: Request, res: Response) => {
  try {
    const { director, media, metadata, ia } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.video) return res.status(400).json({ error: "Vidéo manquante" });

    // --- UPLOADS SCALEWAY ---
    const videoUrl = await uploadToScaleway(files.video[0], "movies");
    const coverImgUrl = files.cover_img ? await uploadToScaleway(files.cover_img[0], "movies") : "";
    let imageUrls: string[] = [];
    if (files.images) {
      for (const img of files.images) {
        imageUrls.push(await uploadToScaleway(img, "movies"));
      }
    }

    // --- PARSING DES DONNÉES ---
    const directorData = JSON.parse(director);
    const meta = JSON.parse(metadata);
    const iaData = JSON.parse(ia);
    const mediaData = JSON.parse(media);

    // --- CRÉATION RÉALISATEUR ---
    const directorId = await Director.createDirector(directorData);
    if (!directorId) throw new Error("Erreur création réalisateur");

    // --- LOGIQUE DE TRADUCTION DEEPL ---
    console.log("🤖 Traduction DeepL en cours...");
    const isFR = meta.language === "FR";
    
    let titleFR, titleEN, synopsisFR, synopsisEN, creativeFR, creativeEN;

    if (isFR) {
      // Si le réalisateur écrit en FR
      titleFR = meta.original_title;
      synopsisFR = meta.original_synopsis;
      creativeFR = iaData.creative_process || "";

      titleEN = await TranslationService.translate(titleFR, 'FR', 'EN');
      synopsisEN = await TranslationService.translate(synopsisFR, 'FR', 'EN');
      creativeEN = await TranslationService.translate(creativeFR, 'FR', 'EN');
    } else {
      // Si le réalisateur écrit en EN
      titleEN = meta.original_title;
      synopsisEN = meta.original_synopsis;
      creativeEN = iaData.creative_process || "";

      titleFR = await TranslationService.translate(titleEN, 'EN', 'FR');
      synopsisFR = await TranslationService.translate(synopsisEN, 'EN', 'FR');
      creativeFR = await TranslationService.translate(creativeEN, 'EN', 'FR');
    }

    // --- PRÉPARATION DONNÉES BDD ---
    // L'ordre ici doit matcher ton movie.model.ts
    const movieData: any = {
      original_title: titleFR,
      english_title: titleEN,
      submitted_at: new Date(),
      youtube_url: videoUrl,
      cover_img: coverImgUrl,
      duration: Number(meta.duration) || 0,
      ishybrid: iaData.method === "hybrid" ? 1 : 0,
      language: meta.language,
      original_synopsis: synopsisFR,
      english_synopsis: synopsisEN,
      creative_process: creativeFR,
      english_creative_process: creativeEN,
      ia_tools: iaData.stack || "",
      hassubs: mediaData.hassubs ? 1 : 0,
      srt: mediaData.srt || null,
      status: 'Pending', // On utilise Pending pour ton ENUM
      director_id: directorId,
      created_at: new Date(),
      images: JSON.stringify(imageUrls)
    };

    const movieId = await movieModel.addMovie(movieData);
    res.status(201).json({ success: true, movieId });

  } catch (error: any) {
    console.error("💥 Erreur creation:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export default { getAllMovies, getMovieById, createMovie };