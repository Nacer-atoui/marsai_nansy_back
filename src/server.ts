import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import axios from 'axios';

// Import de tes fichiers de routes
import routerMovie from './routes/movie.routes';
import siteRoutes from './routes/site.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Connexion à la Base de Données
const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mars_ia',
    port: Number(process.env.DB_PORT) || 8889
});

db.connect((err) => {
    if (err) console.error('❌ Erreur connexion MySQL :', err.message);
    else console.log(`✅ MySQL Connecté (Port ${process.env.DB_PORT})`);
});

// --- ROUTE D'INITIALISATION GÉNÉRALE ---
app.get('/api/init-database', async (req: Request, res: Response) => {
    // Liste complète de tes textes FR - Bien distincts ici !
    const content = {
        h_sub: "Imaginer des futurs souhaitables",
        h_intro: "Le 1er festival international du Court-Métrage IA - Marseille",
        m_sub: "L'événement hybride où l'intelligence artificielle rencontre la créativité cinématographique.",
        s50: "Repoussez les limites de la narration. Un format ultra-court pour créer une œuvre IA percutante en 60 secondes chrono.",
        sprix: "Des ateliers pratiques et gratuits. Apprenez à maîtriser le Prompt Engineering et les outils de génération vidéo.",
        sjury: "Un point de rencontre unique entre réalisateurs, experts tech et passionnés pour réinventer ensemble le 7ème art.",
        obj_h: "Mettre l'humain au cœur de la création d'œuvres générées par IA pour ne pas perdre l'émotion.",
        obj_c: "Challenger la créativité des participants grâce à un format très court de 60 secondes.",
        obj_f: "Mettre à profit la puissance de l'IA pour illustrer un thème : Imaginez des futurs souhaitables."
    };

    try {
        console.log("🤖 Traduction en cours...");
        
        const translate = async (text: string) => {
            const response = await axios.post('https://api-free.deepl.com/v2/translate', 
                { text: [text], target_lang: 'EN', source_lang: 'FR' },
                { headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' } }
            );
            return response.data.translations[0].text;
        };

        const keys = Object.keys(content);
        const translations = await Promise.all(Object.values(content).map(t => translate(t)));
        
        const en: any = {};
        keys.forEach((key, i) => en[key] = translations[i]);

        // Mise à jour de la table site_config (ID = 1)
        const sql = `UPDATE site_config SET 
            hero_subtitle_fr = ?, hero_subtitle_en = ?,
            intro_text_fr = ?, intro_text_en = ?,
            section_mars_subtitle_fr = ?, section_mars_subtitle_en = ?,
            section_50_text_fr = ?, section_50_text_en = ?,
            section_prix_text_fr = ?, section_prix_text_en = ?,
            section_jury_text_fr = ?, section_jury_text_en = ?,
            obj_humain_fr = ?, obj_humain_en = ?,
            obj_challenge_fr = ?, obj_challenge_en = ?,
            obj_futur_fr = ?, obj_futur_en = ?
            WHERE id = 1`;

        db.query(sql, [
            content.h_sub, en.h_sub, 
            content.h_intro, en.h_intro,
            content.m_sub, en.m_sub,
            content.s50, en.s50,
            content.sprix, en.sprix,
            content.sjury, en.sjury,
            content.obj_h, en.obj_h,
            content.obj_c, en.obj_c,
            content.obj_f, en.obj_f
        ], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "🚀 Toutes les sections ont été traduites et enregistrées !" });
        });

    } catch (error: any) {
        res.status(500).json({ error: "Erreur DeepL", details: error.response?.data });
    }
});

app.get('/', (req, res) => { res.send('API MarsAI est en ligne 🚀'); });
app.use('/movie', routerMovie);
app.use('/api', siteRoutes);

app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});