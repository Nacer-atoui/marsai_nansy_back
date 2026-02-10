import { Request, Response } from 'express';
import { TranslationModel } from '../models/translationModel';
import { TranslationService } from '../services/TranslationService';
import { log } from 'console';

export const syncTranslations = async (req: Request, res: Response) => {
  try {
    const { content_key, fr, en } = req.body;

    if (content_key && fr) {
      await TranslationModel.upsert(content_key, fr, en || "");
    }

    await TranslationService.exportToJSON();

    res.status(200).json({ success: true, message: "JSON générés avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur de synchronisation" });
  }
};

/**
 * Cette fonction permet au Front d'afficher les textes
 */
export const getTranslations = async (req: Request, res: Response) => {
  try {
    let { lang } = req.params; // 'fr' ou 'en'

    if (lang == "fr-FR") {
      lang = "fr"
    } else if (lang == "en-EN") {
      lang = "en"
    }

    // On récupère les données via ton modèl
    // On force le typage en 'any[]' pour que TypeScript autorise le .reduce()
    const rows = await TranslationModel.getAll() as any[]; 

    // Sécurité au cas où la BDD renverrait quelque chose d'inattendu
    if (!Array.isArray(rows)) {
      return res.status(200).json({});
    }

    // On transforme le tableau d'objets SQL en objet JSON { clé: texte }
    const formattedData = rows.reduce((acc: any, row: any) => {
      // On s'assure que lang est traité comme une string pour l'indexation
      const languageKey = lang as string;
      acc[row.content_key] = row[languageKey] || "";
      return acc;
    }, {});

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Erreur getTranslations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des traductions" });
  }
};