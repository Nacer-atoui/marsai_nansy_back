import fs from 'fs';
import path from 'path';
import axios from 'axios';
import db from '../config/database';

export const TranslationService = {
  // 1. Appel à DeepL
  async translate(text: string): Promise<string> {
    const response = await axios.post('https://api-free.deepl.com/v2/translate', 
      { text: [text], target_lang: 'EN', source_lang: 'FR' },
      { headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}` } }
    );
    return response.data.translations[0].text;
  },

  // 2. Traduit seulement si nécessaire et met à jour le JSON
  async syncDatabaseAndJSON() {
    try {
      // On récupère uniquement ce qui n'a PAS de traduction anglaise
      const [toTranslate]: any = await db.query(
        "SELECT id, fr FROM translations WHERE en IS NULL OR en = ''"
      );

      if (toTranslate.length > 0) {
        console.log(`🤖 DeepL : Traduction de ${toTranslate.length} nouvelles clés...`);
        for (const row of toTranslate) {
          const translatedText = await this.translate(row.fr);
          // On enregistre dans la base pour ne plus JAMAIS avoir à traduire cette ligne
          await db.query("UPDATE translations SET en = ? WHERE id = ?", [translatedText, row.id]);
        }
      } else {
        console.log("✅ DeepL : Rien à faire, tout est déjà traduit (par toi ou par moi).");
      }

      // Une fois que la base est à jour, on crée les fichiers JSON
      await this.exportToJSON();

    } catch (error) {
      console.error("❌ Erreur lors de la synchro :", error);
    }
  },

  // 3. Crée les fichiers JSON par section (ex: submit_form.json)
  async exportToJSON() {
    try {
      const [rows]: any = await db.query("SELECT content_key, section, fr, en FROM translations");
      
      const translations: any = { fr: {}, en: {} };

      // On organise les données par langue et par section
      rows.forEach((row: any) => {
        const section = row.section || 'translation';
        
        if (!translations.fr[section]) translations.fr[section] = {};
        if (!translations.en[section]) translations.en[section] = {};

        translations.fr[section][row.content_key] = row.fr;
        translations.en[section][row.content_key] = row.en || row.fr;
      });

      // Chemin vers ton dossier public/locales du front
      const localesPath = path.resolve(__dirname, '../../../marsai_nansy_front/public/locales');

      for (const lang of ['fr', 'en']) {
        const langPath = path.join(localesPath, lang);
        
        // Créer les dossiers s'ils n'existent pas
        if (!fs.existsSync(langPath)) fs.mkdirSync(langPath, { recursive: true });

        // Créer un fichier .json pour chaque section (ex: submit_form.json)
        for (const section in translations[lang]) {
          const filePath = path.join(langPath, `${section}.json`);
          fs.writeFileSync(filePath, JSON.stringify(translations[lang][section], null, 2));
        }
      }
      
      console.log(`✅ Front-end synchronisé : Fichiers JSON créés dans ${localesPath}`);
    } catch (error) {
      console.error("❌ Erreur d'exportation :", error);
    }
  }
};