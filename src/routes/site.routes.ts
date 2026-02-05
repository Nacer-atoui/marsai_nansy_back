import express from 'express';
import mysql from 'mysql2';
const router = express.Router();

// Connexion BDD
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

// Route pour récupérer les textes de la Home Page
router.get('/home-config', (req, res) => {
    db.query('SELECT * FROM site_config WHERE id = 1', (err, results: any) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]); // On renvoie l'objet config
    });
});

export default router;