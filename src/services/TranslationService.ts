import fs from 'fs';
import path from 'path';
import axios from 'axios';
import db from '../config/database';

export const TranslationService = {
  // Traduction via DeepL
  async translate(text: string): Promise<string> {
    const response = await axios.post('https://api-free.deepl.com/v2/translate', 
      { text: [text], target_lang: 'EN', source_lang: 'FR' },
      { headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}` } }
    );
    return response.data.translations[0].text;
  },

  // Génération des JSON dans le dossier PUBLIC du projet FRONT
  async exportToJSON() {
    try {
      const [rows]: any = await db.query("SELECT content_key, fr, en FROM translations");
      
      const fr: any = {};
      const en: any = {};

      rows.forEach((row: any) => {
        fr[row.content_key] = row.fr;
        en[row.content_key] = row.en || row.fr;
      });

      // On remonte de 3 niveaux pour arriver au dossier parent qui contient tes deux projets
const localesPath = path.resolve(__dirname, '../../../marsai_nansy_front/public/locales');

      console.log("📂 Destination :", localesPath);
      
      // Création des dossiers fr et en s'ils n'existent pas
      if (!fs.existsSync(path.join(localesPath, 'fr'))) fs.mkdirSync(path.join(localesPath, 'fr'), { recursive: true });
      if (!fs.existsSync(path.join(localesPath, 'en'))) fs.mkdirSync(path.join(localesPath, 'en'), { recursive: true });

      // Écriture des fichiers JSON
      fs.writeFileSync(path.join(localesPath, 'fr/translation.json'), JSON.stringify(fr, null, 2));
      fs.writeFileSync(path.join(localesPath, 'en/translation.json'), JSON.stringify(en, null, 2));
      
      console.log(`✅ Front-end synchronisé : ${rows.length} clés générées.`);
    } catch (error) {
      console.error("❌ Erreur d'exportation :", error);
    }
  }
};