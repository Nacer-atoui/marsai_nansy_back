import { Request, Response } from 'express';
import ratingModel from '../models/rating.model';

const createRating = async (req: Request, res: Response) => {
  const { movie_id, jury_id, note, comment } = req.body; 

  try {
    await ratingModel.addOrUpdateRating(movie_id, jury_id, note, comment);
    res.json({ success: true, message: "Note enregistrée avec succès !" });
  } catch (error: any) {
    console.error('Erreur notation:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la notation' });
  }
};

export default { createRating };