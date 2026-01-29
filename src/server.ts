import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database'; // On importe la connexion du fichier précédent

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route pour récupérer les films
app.get('/movie', async (req: Request, res: Response) => {
  try {
    // On lance la requête (on attend la réponse avec await)
    const sql = 'SELECT * FROM movie';
    // Avec mysql2/promise, query renvoie un tableau [rows, fields]
    const [rows] = await pool.query(sql);

    // On log pour voir ce qu'on a récupéré dans le terminal VS Code
    console.log("Données récupérées :", rows);

    // On renvoie le résultat au format JSON
    res.json(rows);

  } catch (error: any) {
    // Gestion des erreurs
    console.error('❌ Erreur SQL:', error.message);
    res.status(500).send('Erreur serveur');
  }
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});