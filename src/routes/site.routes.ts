import express from 'express';
import mysql from 'mysql2';
const router = express.Router();

// Connexion BDD
const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mars_ia',
  port: Number(process.env.DB_PORT) || 8889
});

// Route pour récupérer les textes de la Home Page
router.get('/home-config', (req, res) => {
    db.query('SELECT * FROM site_config WHERE id = 1', (err, results: any) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]); // On renvoie l'objet config
    });
});

export default router;