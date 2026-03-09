import db from '../config/database';

interface collaboratorType {
  firstname: string;
  lastname: string;
  email: string;
  job: string;
  contribution: string;
}
const addCollab = async (collaborator:collaboratorType, movie_id: number) => {
    const sql = `INSERT INTO collaborator (firstname,lastname,email,job,contribution,movie_id) VALUES (?,?,?,?,?,?)`;
    const [result]: any = await db.query(sql, [collaborator.firstname, collaborator.lastname, collaborator.email, collaborator.job, collaborator.contribution, movie_id]);
  return result.insertId;
};

export { addCollab }