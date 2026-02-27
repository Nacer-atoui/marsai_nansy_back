import fs from 'fs';
import path from 'path';
import axios from 'axios';
import db from '../config/database';

export const TranslationService = {
  
  // 1. Appel DeepL flexible (Source et Cible dynamiques)
  async translate(text: string, source: 'FR' | 'EN', target: 'EN' | 'FR'): Promise<string> {
    try {
      // 💡 Correction pour DeepL : target doit être EN-GB ou EN-US
      const targetLang = target === 'EN' ? 'EN-GB' : 'FR';
      
      const response = await axios.post('https://api-free.deepl.com/v2/translate', 
        { 
          text: [text], 
          target_lang: targetLang, // Utilise la variable corrigée
          source_lang: source 
        },
        { 
          headers: { 
            'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            'Content-Type': 'application/json' // Toujours mieux de le préciser
          } 
        }
      );
      return response.data.translations[0].text;
    } catch (error: any) {
      // Affiche l'erreur détaillée pour débugger plus vite
      console.error(`❌ Erreur DeepL (${source}->${target}):`, error.response?.data || error.message);
      return text; 
    }
  },

  // 2. Traduction intelligente dans les deux sens
  async syncDatabaseAndJSON() {
    try {
      // ÉTAPE A : Traduire du Français vers l'Anglais
      const [toEn]: any = await db.query(
        "SELECT id, fr FROM translations WHERE (en IS NULL OR en = '') AND (fr IS NOT NULL AND fr != '')"
      );

      if (toEn.length > 0) {
        console.log(`🤖 DeepL : Traduction de ${toEn.length} clés vers l'Anglais...`);
        for (const row of toEn) {
          const translated = await this.translate(row.fr, 'FR', 'EN');
          await db.query("UPDATE translations SET en = ? WHERE id = ?", [translated, row.id]);
        }
      }

      // ÉTAPE B : Traduire de l'Anglais vers le Français
      const [toFr]: any = await db.query(
        "SELECT id, en FROM translations WHERE (fr IS NULL OR fr = '') AND (en IS NOT NULL AND en != '')"
      );

      if (toFr.length > 0) {
        console.log(`🤖 DeepL : Traduction de ${toFr.length} clés vers le Français...`);
        for (const row of toFr) {
          const translated = await this.translate(row.en, 'EN', 'FR');
          await db.query("UPDATE translations SET fr = ? WHERE id = ?", [translated, row.id]);
        }
      }

      // Une fois la base synchronisée, on exporte les fichiers
      await this.exportToJSON();

    } catch (error) {
      console.error("❌ Erreur lors de la synchro :", error);
    }
  },

  // 3. Exportation JSON inchangée (mais elle profitera des nouvelles traductions)
  async exportToJSON() {
    try {
      const [rows]: any = await db.query("SELECT content_key, section, fr, en FROM translations");
      const translations: any = { fr: {}, en: {} };

      rows.forEach((row: any) => {
        const section = row.section || 'translation';
        if (!translations.fr[section]) translations.fr[section] = {};
        if (!translations.en[section]) translations.en[section] = {};

        // Fallback : si la traduction a échoué, on met le texte original pour éviter les vides
        translations.fr[section][row.content_key] = row.fr || row.en;
        translations.en[section][row.content_key] = row.en || row.fr;
      });

      const localesPath = path.resolve(__dirname, '../../../marsai_nansy_front/public/locales');

      for (const lang of ['fr', 'en']) {
        const langPath = path.join(localesPath, lang);
        if (!fs.existsSync(langPath)) fs.mkdirSync(langPath, { recursive: true });

        for (const section in translations[lang]) {
          const filePath = path.join(langPath, `${section}.json`);
          fs.writeFileSync(filePath, JSON.stringify(translations[lang][section], null, 2));
        }
      }
      console.log("✅ JSON Front-end mis à jour avec succès.");
    } catch (error) {
      console.error("❌ Erreur d'exportation :", error);
    }
  }
};