import db from '../config/database';

export const TranslationModel = {
  // Récupérer toutes les données pour l'export
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM translations");
    return rows;
  },

  // Ajouter ou mettre à jour une traduction
  upsert: async (key: string, fr: string, en: string) => {
    const sql = `
      INSERT INTO translations (content_key, fr, en) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE fr = ?, en = ?
    `;
    return db.query(sql, [key, fr, en, fr, en]);
  }
};