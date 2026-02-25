import { Request, Response } from 'express';
import movieList from '../models/movie.model';
import movieModel from '../models/movie.model';
import { Director } from '../models/director.model';
import { uploadToScaleway } from '../services/uploadService'

const getAllMovies = async (req: Request, res: Response) => {
  try {
    // 1. Appel au Modèle pour récupérer les données
    const movies = await movieList.getAll();

    // 2. Réponse succès  avec les données JSON
    res.json(movies);
  } catch (error: any) {
    // 3. Gestion des erreurs serveur

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
  

    let videoUrl = "";
    if (file) {
      // On passe le fichier et une catégorie (ex: 'trailers' ou 'movies')
      videoUrl = await uploadToScaleway(file, "movies");
    }

    if (director) {
      const result = await Director.createDirector(JSON.parse(director));
      // console.log(result);
    }

    if (media || metadata || ia) {
      const metadataParse = JSON.parse(metadata);
      const mediaParse = JSON.parse(media);
      const iaParse = JSON.parse(ia);
      const movie = {
        original_title: metadataParse.original_title,
        english_title: metadataParse.original_title,
        youtube_url: videoUrl,
        cover_img: mediaParse.cover_img,
        duration: metadataParse.duration,
        ishybrid: iaParse.method,
        language: "FR",
        original_synopsis: metadataParse.original_synopsis,
        english_synopsis: metadataParse.original_synopsis,
        creative_process: "",
        english_creative_process: "",
        ia_tools: iaParse.stack,
        hassubs: mediaParse.hassubs,
        srt: mediaParse.srt,
        status: mediaParse.status,
        director_id: 1,
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
