import db from '../config/database';

export const SiteModel = {
  // Récupère la config (ID 1 par défaut)
  getConfig: async () => {
    const [rows]: any = await db.query('SELECT * FROM site_config WHERE id = 1');
    return rows[0];
  },
  
  // Met à jour la couleur ET la date pour le compteur
  updateConfig: async (color: string, eventDate: string) => {
    // On met à jour les deux colonnes d'un coup sur l'ID 1
    const sql = `
      UPDATE site_config 
      SET primary_color = ?, event_date = ? 
      WHERE id = 1
    `;
    return await db.query(sql, [color, eventDate]);
  }
};