import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routerMovie from './routes/movie.routes'; // Importation des routes pour les films

// Chargement des variables d'environnement (depuis le fichier .env)
dotenv.config();

// Création de l'application Express
const app = express();

// Définition du port (3000 par défaut si non spécifié dans le .env)
const port = process.env.PORT || 3000;

// --- Middlewares ---

// Autorise les requêtes provenant d'autres domaines (Cross-Origin Resource Sharing)
app.use(cors());

// Permet à Express de lire et analyser le corps des requêtes en format JSON
app.use(express.json());

// --- Routes ---

// Association de la route '/movie' avec notre routeur dédié
// Toutes les requêtes vers http://localhost:3000/movie passeront par routerMovie
app.use('/movie', routerMovie);

app.get('/', (req, res) => {
  res.send('toto');
});

// --- Démarrage du serveur ---
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
