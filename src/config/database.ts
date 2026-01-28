import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Utilisation de createPool (plus performant que createConnection pour une API)
const connection: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Pas besoin de .connect() manuel avec le Pool, 
// mais tu peux tester la connexion au démarrage si tu veux :
connection.getConnection()
  .then((conn) => {
    console.log("✅ Connecté à la base de données MySQL");
    conn.release(); // Important : libérer la connexion
  })
  .catch((error) => {
    console.error("❌ Erreur de connexion à MySQL :", error.message);
  });

export default connection;