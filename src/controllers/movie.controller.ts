import { Request, Response } from 'express';
import movieList from '../models/movie.model';
import movieModel from '../models/movie.model';
import { Director } from '../models/director.model';

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
  // console.log(req.body);
  //ajout de dans la table director
  const { director,media,metadata, ia } = req.body;

  if (director) {
    const result = await Director.createDirector(director);
    // console.log(result);
  }
  console.log(media,metadata, ia)
  if (media || metadata || ia) {
    const movie = {
      original_title: metadata.original_title,
      english_title: metadata.original_title,
      youtube_url: "",
      cover_img: media.cover_img,
      duration: metadata.duration,
      ishybrid: ia.method,
      language: "FR",
      original_synopsis: metadata.original_synopsis,
      english_synopsis: metadata.original_synopsis,
      creative_process: "",
      english_creative_process: "",
      ia_tools: ia.stack,
      hassubs: media.hassubs,
      srt: media.srt,
      status: media.status,
      director_id: 5,
    }

    const result = await movieModel.addMovie(movie);
    // console.log(result);
  }
  //ajout de dans la table movie
  //ajout de dans la table user
  //ajout de dans la table collaborator
  //ajout de dans la table movie_tag
};

export default { getAllMovies, getMovieById, createMovie };
