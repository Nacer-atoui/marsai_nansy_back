import { Request, Response } from 'express';
import movieList from '../models/movie.model';
import movieModel from '../models/movie.model';
import { Director } from '../models/director.model';
import { uploadToScaleway } from '../services/uploadService'

const getAllMovies = async (req: Request, res: Response) => {
  try {
    // 1. On récupère les requêtes dans l'URL (ex: ?userId=1&search=film)
    const userId = Number(req.query.userId) || 0;
    const search = req.query.search ? String(req.query.search) : '';

    // 2. Appel au Modèle avec les bons paramètres
    const movies = await movieList.getAll(userId, search);

    // 3. Réponse succès
    res.json(movies);
  } catch (error: any) {
    console.error('Erreur:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const movie = await movieModel.getById(+id);
    res.send(movie);
  } catch (error: any) {
    console.error('Erreur:', error.message);

    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const createMovie = async (req: Request, res: Response) => {
  //ajout de dans la table director
  const { director,media,metadata, ia } = req.body;

  if (req.files && !Array.isArray(req.files) && req.files.video) {
    const file = req.files.video[0] as Express.Multer.File;
    const coverImg = req.files.cover_img ? (req.files.cover_img[0] as Express.Multer.File) : null;
    const images = req.files.images ? (req.files.images as Express.Multer.File[]) : [];
  

    let videoUrl = "";
    if (file) {
      // On passe le fichier et une catégorie (ex: 'trailers' ou 'movies')
      videoUrl = await uploadToScaleway(file, "movies");
    }

    let coverImgUrl = "";
    if (coverImg) {
      coverImgUrl = await uploadToScaleway(coverImg, "movies");
    }

    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const imageUrl = await uploadToScaleway(image, "movies");
        imageUrls.push(imageUrl);
      }
    }



    // let id: number | false = false;
    let id: number | false = false;

    if (director) {
      id = await Director.createDirector(JSON.parse(director));
    }

    if (id == false) {
      return res.status(400).json({ error: "Erreur lors de la création du réalisateur" });
    }


    if (media || metadata || ia) {
      const metadataParse = JSON.parse(metadata);
      const mediaParse = JSON.parse(media);
      const iaParse = JSON.parse(ia);
      const movie = {
        original_title: metadataParse.original_title,
        english_title: metadataParse.original_title,
        youtube_url: videoUrl,
        cover_img: coverImgUrl,
        images: imageUrls,
        duration: metadataParse.duration,
        ishybrid: iaParse.method,
        language: metadataParse.language,
        original_synopsis: metadataParse.original_synopsis,
        english_synopsis: metadataParse.original_synopsis,
        creative_process: metadataParse.language === "FR-FR" ? iaParse.creative_process : "",
        english_creative_process: metadataParse.language === "EN-EN" ? iaParse.creative_process : "",
        ia_tools: iaParse.stack,
        hassubs: mediaParse.hassubs,
        srt: mediaParse.srt,
        status: mediaParse.status,
        director_id: id,
      }

      const result = await movieModel.addMovie(movie);
      // console.log(result);
    }
  }
    //ajout de dans la table movie
    //ajout de dans la table user
    //ajout de dans la table collaborator
    //ajout de dans la table movie_tag
  else {
    return res.status(400).json({ error: "La vidéo est manquante" });
  }
};

export default { getAllMovies, getMovieById, createMovie };
