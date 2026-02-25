import db from '../config/database';

interface directorType {
  civility?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: number;
  country: string;
  birthday: Date;
  address: string;
}

export const Director = {
  createDirector: async (director: directorType) => {
    console.log(director.address);
    const sql = `
        INSERT INTO director (civility,firstname,lastname,email,phone,country,birthday,address)
        VALUES(?,?,?,?,?,?,?,?)
        `;

    return db.query(sql, [
      director.civility,
      director.firstname,
      director.lastname,
      director.email,
      director.phone,
      director.country,
      director.birthday,
      JSON.stringify(director.address),
    ]);
  },
};
