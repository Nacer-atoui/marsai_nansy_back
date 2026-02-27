import { Request, Response } from 'express';
import ratingModel from '../models/rating.model';

const createRating = async (req: Request, res: Response) => {
  // On récupère exactement ce que le Front envoie
  const { movie_id, user_id, rate, comment } = req.body; 

  // On vérifie les variables avec les bons noms
  if (!movie_id || !user_id || rate === undefined) {
    return res.status(400).json({ 
      error: 'Données manquantes', 
      received: { movie_id, user_id, rate } 
    });
  }

  try {
    await ratingModel.addOrUpdateRating(
      Number(movie_id), 
      Number(user_id), 
      Number(rate), 
      comment || ""
    );
    res.json({ success: true, message: "Note enregistrée !" });
  } catch (error: any) {
    console.error('Erreur SQL détaillée:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export default { createRating };