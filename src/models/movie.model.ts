import { log } from 'node:console';
import pool from '../config/database';
import db from '../config/database';

// import { RowDataPacket } from 'mysql2'; // Puedes borrar esto si quieres el código más limpio

// 1. Cambiamos el nombre de la variable a "getAll" (porque es la acción de obtener todo)
// 1. On ajoute les paramètres attendus avec des valeurs par défaut
const getAll = async (userId: number = 0, searchQuery: string = '') => {
  let sql = `
      SELECT 
          m.*, 
          AVG(r.rate) as average_note,
          MAX(CASE WHEN r.user_id = ? THEN 1 ELSE 0 END) as has_voted
      FROM movie m
      LEFT JOIN rating r ON m.id = r.movie_id
  `;
  let params: any[] = [userId];

  // S'il y a une recherche, on l'ajoute à la requête
  if (searchQuery) {
      sql += ` WHERE m.original_title LIKE ?`;
      params.push(`%${searchQuery}%`);
  }

  sql += ` GROUP BY m.id`;

  const [rows] = await pool.query(sql, params);
  return rows;
};

const getById = async (id: number) => {
  const sql = 'SELECT * FROM movie where id = ?';
  const [rows] = await pool.query(sql, [id]);

  console.log(rows);
  return rows;
};
interface movieType {
  original_title:string
  english_title:string
  youtube_url:string
  cover_img:string
  duration:string
  ishybrid:boolean
  language:string
  original_synopsis:string
  english_synopsis:string
  creative_process:string
  english_creative_process:string
  ia_tools:string
  hassubs:boolean
  srt:string
  status:string
  director_id:number
}
const addMovie = async (movie :movieType) => {
  console.log(movie.original_title)
  const sql =
    'INSERT INTO movie (original_title,english_title,youtube_url,cover_img,duration,ishybrid,language,original_synopsis,english_synopsis,creative_process,english_creative_process,ia_tools,hassubs,srt,status,director_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  return db.query(sql, [
    movie.original_title,
    movie.english_title,
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
    movie.status,
    movie.director_id,
  ]);
};

export default { getAll, getById, addMovie };
