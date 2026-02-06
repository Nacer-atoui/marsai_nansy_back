import { Request, Response } from 'express';
import { TranslationModel } from '../models/translationModel';
import { TranslationService } from '../services/TranslationService';

export const syncTranslations = async (req: Request, res: Response) => {
  try {
    const { content_key, fr, en } = req.body;

    // 1. Si on reçoit de nouvelles données, on les enregistre
    if (content_key && fr) {
      await TranslationModel.upsert(content_key, fr, en || "");
    }

    // 2. On lance l'exportation forcée vers les fichiers JSON du Front
    await TranslationService.exportToJSON();

    res.status(200).json({ success: true, message: "JSON générés avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur de synchronisation" });
  }
};