import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database'; 
import { TranslationService } from './services/TranslationService';
import authRoutes from './routes/authRoutes';

// Import de tes routes
import routerMovie from './routes/movie.routes';
import siteRoutes from './routes/site.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // Ton Front Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

/**
 * 🛠️ ROUTE ADMIN MAGIQUE
 * 1. Traduit le texte via DeepL
 * 2. Sauvegarde en Base de Données
 * 3. Écrase les fichiers JSON du Front immédiatement
 */
app.post('/api/admin/update-content', async (req: Request, res: Response) => {
    const { key, section, textFr } = req.body;

    if (!key || !textFr) {
        return res.status(400).json({ error: "Clé et texte FR requis." });
    }

    try {
        // 1. On demande à DeepL de traduire
        const textEn = await TranslationService.translate(textFr);

        // 2. On insère ou met à jour dans MySQL
        const sql = `
            INSERT INTO translations (content_key, section, fr, en) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE fr = VALUES(fr), en = VALUES(en)
        `;
        await db.query(sql, [key, section || 'general', textFr, textEn]);

        // 3. ✨ LA CLEF DU SUCCÈS : On met à jour les fichiers JSON du Front
        await TranslationService.exportToJSON();

        res.json({ 
            success: true, 
            message: "Traduction sauvegardée et JSON mis à jour !",
            data: { fr: textFr, en: textEn }
        });

    } catch (error: any) {
        console.error("Erreur Admin Update:", error);
        res.status(500).json({ error: error.message || "Erreur serveur" });
    }
});

// Montage des autres routes
app.use('/movie', routerMovie);
app.use('/api', siteRoutes);
app.use('/movie', routerMovie);
app.use('/api', siteRoutes);
app.use('/api/auth', authRoutes);

// Lancement du Serveur
app.listen(port, async () => {
    console.log(`🚀 Serveur Back lancé sur http://localhost:${port}`);

    // 👇 C'EST ICI QUE TOUT SE JOUE AU DÉMARRAGE 👇
    try {
        console.log("🔄 Démarrage : Synchronisation des fichiers JSON en cours...");
        await TranslationService.exportToJSON();
        console.log("✅ Synchronisation terminée : Ton Front est à jour !");
    } catch (err) {
        console.error("⚠️ Erreur lors de la synchro au démarrage :", err);
    }
});