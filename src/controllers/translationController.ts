import { Request, Response } from 'express';
import { TranslationModel } from '../models/translationModel';
import { TranslationService } from '../services/TranslationService';

/**
 * Enregistre, Traduit via AI et Génère les fichiers JSON
 */
export const syncTranslations = async (req: Request, res: Response) => {
  try {
    let { content_key, fr, en } = req.body;

    if (!content_key) {
      return res.status(400).json({ success: false, error: "La clé est obligatoire." });
    }

    // --- LOGIQUE DE TRADUCTION ---
    // Si l'anglais est vide, on traduit du FR vers EN
    if (fr && (!en || en.trim() === "")) {
      console.log(`🤖 DeepL : Traduction FR -> EN pour : ${content_key}`);
      // 💡 FIX : On passe les 3 arguments requis
      en = await TranslationService.translate(fr, 'FR', 'EN');
    } 
    // Si le français est vide, on traduit du EN vers FR
    else if (en && (!fr || fr.trim() === "")) {
      console.log(`🤖 DeepL : Traduction EN -> FR pour : ${content_key}`);
      fr = await TranslationService.translate(en, 'EN', 'FR');
    }

    // --- ENREGISTREMENT BDD ---
    await TranslationModel.upsert(content_key, fr, en);

    // --- GÉNÉRATION DES FICHIERS PHYSIQUES ---
    await TranslationService.exportToJSON();

    res.status(200).json({ 
      success: true, 
      message: "Traduction réussie et fichiers JSON générés",
      data: { content_key, fr, en } 
    });

  } catch (error: any) {
    console.error("❌ Erreur syncTranslations:", error.message);
    res.status(500).json({ success: false, error: "Erreur de synchronisation" });
  }
};

/**
 * Récupération des traductions pour le Front-end
 */
export const getTranslations = async (req: Request, res: Response) => {
  try {
    // 💡 FIX : On force le type string pour éviter l'erreur startsWith sur string[]
    const lang = req.params.lang as string;

    const targetLang = (lang && lang.startsWith('fr')) ? "fr" : "en";

    const rows = await TranslationModel.getAll() as any[]; 

    if (!Array.isArray(rows)) {
      return res.status(200).json({});
    }

    const formattedData = rows.reduce((acc: any, row: any) => {
      acc[row.content_key] = row[targetLang] || row.fr || row.en || "";
      return acc;
    }, {});

    res.status(200).json(formattedData);
  } catch (error: any) {
    console.error("❌ Erreur getTranslations:", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
};