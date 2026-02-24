import { Request, Response } from 'express';
import { TranslationModel } from '../models/translationModel';
import { TranslationService } from '../services/TranslationService';

/**
 * Enregistre, Traduit via AI et Génère les fichiers JSON
 */
export const syncTranslations = async (req: Request, res: Response) => {
  try {
    let { content_key, fr, en } = req.body;

    // Validation de base
    if (!content_key || !fr) {
      return res.status(400).json({ 
        success: false, 
        error: "La clé (content_key) et le texte français (fr) sont obligatoires." 
      });
    }

    // --- LOGIQUE DE TRADUCTION AUTOMATIQUE ---
    // Si l'anglais est vide, on appelle le service DeepL
    if (!en || en.trim() === "") {
      console.log(`🤖 Traduction automatique via DeepL pour : ${content_key}`);
      en = await TranslationService.translate(fr);
    }

    // --- ENREGISTREMENT BDD ---
    // On utilise le modèle pour sauvegarder ou mettre à jour
    await TranslationModel.upsert(content_key, fr, en);

    // --- GÉNÉRATION DES FICHIERS PHYSIQUES ---
    // On écrit les fichiers .json dans le dossier public du front
    await TranslationService.exportToJSON();

    res.status(200).json({ 
      success: true, 
      message: "Traduction réussie et fichiers JSON générés",
      data: { content_key, fr, en } 
    });

  } catch (error) {
    console.error("Erreur syncTranslations:", error);
    res.status(500).json({ success: false, error: "Erreur de synchronisation" });
  }
};

/**
 * Optionnel : Permet au Front de récupérer les textes via API 
 * (Même si lire le JSON directement est plus rapide)
 */
export const getTranslations = async (req: Request, res: Response) => {
  try {
    let { lang } = req.params;

    // Normalisation de la langue
    const targetLang = (lang === "fr-FR" || lang === "fr") ? "fr" : "en";

    // Récupération depuis la BDD
    const rows = await TranslationModel.getAll() as any[]; 

    if (!Array.isArray(rows)) {
      return res.status(200).json({});
    }

    // Transformation en format { "clé": "texte" }
    const formattedData = rows.reduce((acc: any, row: any) => {
      acc[row.content_key] = row[targetLang] || row.fr || "";
      return acc;
    }, {});

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Erreur getTranslations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des traductions" });
  }
};