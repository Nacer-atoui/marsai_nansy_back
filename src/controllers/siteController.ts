import { Request, Response } from 'express';
import { SiteModel } from '../models/site.model';

export const getSiteConfig = async (req: Request, res: Response) => {
  try {
    const config = await SiteModel.getConfig();
    res.json(config); 
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSiteConfig = async (req: Request, res: Response) => {
  try {
    // 1. On récupère les deux champs depuis le corps de la requête
    const { primary_color, event_date } = req.body;

    // 2. On passe les deux arguments au modèle (assure-toi que ton modèle a été mis à jour aussi)
    await SiteModel.updateConfig(primary_color, event_date);

    // 3. On renvoie la réponse complète
    res.json({ success: true, primary_color, event_date });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};