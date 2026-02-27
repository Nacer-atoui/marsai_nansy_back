import db from '../config/database';

export interface movieType {
  id?: number;
  original_title: string;
  english_title: string;
  youtube_url: string;
  cover_img: string;
  images: string; 
  duration: number;
  ishybrid: number;
  language: string;
  original_synopsis: string;
  english_synopsis: string;
  creative_process: string;
  english_creative_process: string;
  ia_tools: string;
  hassubs: number;
  srt: string | null;
  status: string;
  director_id: number;
  created_at: Date;
  submitted_at: Date;
  // Champs récupérés via la jointure SQL
  firstname?: string;
  lastname?: string;
}

/**
 * Récupère tous les films avec la note moyenne et le nom du réalisateur
 */
const getAll = async (userId: number = 0, searchQuery: string = '') => {
  let sql = `
      SELECT 
        m.*, 
        d.firstname, 
        d.lastname, 
        AVG(r.rate) as average_note,
        MAX(CASE WHEN r.user_id = ? THEN 1 ELSE 0 END) as has_voted
      FROM movie m
      /* 💡 Correction du nom de la table : director (singulier) */
      LEFT JOIN director d ON m.director_id = d.id
      LEFT JOIN rating r ON m.id = r.movie_id
  `;
  
  let params: any[] = [userId];
  
  if (searchQuery) {
      sql += ` WHERE m.original_title LIKE ?`;
      params.push(`%${searchQuery}%`);
  }
  
  // On groupe par m.id pour éviter l'ambiguïté avec d.id
  sql += ` GROUP BY m.id`;
  
  const [rows] = await db.query(sql, params);
  return rows;
};

/**
 * Récupère un film spécifique par son ID avec les infos du réalisateur
 */
const getById = async (id: number) => {
  const sql = `
    SELECT 
      m.*, 
      d.firstname, 
      d.lastname 
    FROM movie m 
    /* 💡 Correction du nom de la table : director (singulier) */
    LEFT JOIN director d ON m.director_id = d.id 
    WHERE m.id = ?
  `;
  
  const [rows]: any = await db.query(sql, [id]);
  return rows[0];
};

/**
 * Ajoute un nouveau film dans la base de données
 */
const addMovie = async (movie: movieType) => {
  const sql = `
    INSERT INTO movie (
      original_title, english_title, submitted_at, youtube_url, cover_img, 
      duration, ishybrid, language, original_synopsis, english_synopsis, 
      creative_process, english_creative_process, ia_tools, hassubs, srt, 
      status, director_id, created_at, images
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    movie.original_title,
    movie.english_title,
    movie.submitted_at,
    movie.youtube_url,
    movie.cover_img,
    movie.duration,
    movie.ishybrid,
    movie.language,
    movie.original_synopsis,
    movie.english_synopsis,
    movie.creative_process,
    movie.english_creative_process,
    movie.ia_tools,
    movie.hassubs,
    movie.srt,
    'Pending', // 🔒 On force le statut "En attente" pour la modération
    movie.director_id,
    movie.created_at,
    movie.images
  ];

  const [result]: any = await db.query(sql, values);
  return result.insertId;
};

export default { getAll, getById, addMovie };