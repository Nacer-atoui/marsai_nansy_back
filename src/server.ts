import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database'; 
import { TranslationService } from './services/TranslationService';

// Tes autres routes
import routerMovie from './routes/movie.routes';
import siteRoutes from './routes/site.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173", // Ton projet Front (Vite)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

/**
 * ROUTE ADMIN : Traduit le texte et met à jour les fichiers JSON du Front
 */
app.post('/api/admin/update-content', async (req: Request, res: Response) => {
    const { key, section, textFr } = req.body;

    if (!key || !textFr) {
        return res.status(400).json({ error: "Clé et texte FR requis." });
    }

    try {
        // 1. On traduit
        const textEn = await TranslationService.translate(textFr);

        // 2. On sauve en DB
        const sql = `
            INSERT INTO translations (content_key, section, fr, en) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE fr = VALUES(fr), en = VALUES(en)
        `;
        await db.query(sql, [key, section || 'general', textFr, textEn]);

        // 3. On génère les fichiers dans le dossier du FRONT
        await TranslationService.exportToJSON();

        res.json({ success: true, translation: textEn });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/movie', routerMovie);
app.use('/api', siteRoutes);

app.listen(port, () => {
    console.log(`🚀 Serveur Back lancé sur http://localhost:${port}`);
});