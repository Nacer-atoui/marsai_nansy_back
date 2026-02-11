import pool from '../config/database';
// import { RowDataPacket } from 'mysql2'; // Puedes borrar esto si quieres el código más limpio

// 1. Cambiamos el nombre de la variable a "getAll" (porque es la acción de obtener todo)
const getAll = async () => {
  const sql = 'SELECT * FROM movie';
  const [rows] = await pool.query(sql);
  return rows;
};

const getById = async (id: number) => {
  const sql = 'SELECT * FROM movie where id = ?';
  const [rows] = await pool.query(sql, [id]);

  console.log(rows);
  return rows;
};

export default { getAll, getById };
