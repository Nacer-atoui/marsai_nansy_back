import db from '../config/database';

const addOrUpdateRating = async (movieId: number, userId: number, rateValue: number, comment: string) => {
  const sql = `
    INSERT INTO rating (movie_id, user_id, rate, comment, created_at, updated_at) 
    VALUES (?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE 
    rate = VALUES(rate), 
    comment = VALUES(comment),
    updated_at = NOW()
  `;
  
  const [result] = await db.query(sql, [movieId, userId, rateValue, comment]);
  return result;
};

export default { addOrUpdateRating };