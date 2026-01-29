import { Request, Response } from 'express';
import movieList from '../models/movie.model';


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

export default { getAllMovies };