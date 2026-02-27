import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database'; 
import { TranslationService } from './services/TranslationService';

import routerMovie from './routes/movie.routes'; 
import siteRoutes from './routes/site.routes'; 
import authRoutes from './routes/authRoutes';
import routerRating from './routes/rating.routes';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// 1. ROUTES DU CMS ET DES TRADUCTIONS
app.get('/api/translations/:lng', async (req: Request, res: Response) => {
    try {
        const lng = String(req.params.lng);
        const targetLang = lng.startsWith('en') ? 'en' : 'fr';
        const [rows]: any = await db.query('SELECT content_key, ?? as text FROM translations', [targetLang]);

        const translations = rows.reduce((acc: any, row: any) => {
            const keys = row.content_key.split('.');
            let current = acc;
            keys.forEach((key: string, i: number) => {
                if (i === keys.length - 1) { current[key] = row.text; } 
                else { current[key] = current[key] || {}; current = current[key]; }
            });
            return acc;
        }, {});
        res.json(translations);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.post('/api/admin/update-content', async (req: Request, res: Response) => {
    const { key, section, textFr, textEnManual } = req.body;
    if (!key || !textFr) return res.status(400).json({ error: "Clé et texte FR requis." });

    try {
        // 💡 FIX : On passe les 3 arguments ('FR' et 'EN')
        const textEn = (textEnManual && textEnManual.trim() !== "") 
            ? textEnManual 
            : await TranslationService.translate(textFr, 'FR', 'EN');

        const sql = `INSERT INTO translations (content_key, section, fr, en) VALUES (?, ?, ?, ?) 
                     ON DUPLICATE KEY UPDATE fr = VALUES(fr), en = VALUES(en)`;
        await db.query(sql, [key, section || 'general', textFr, textEn]);
        await TranslationService.exportToJSON();
        res.json({ success: true, data: { fr: textFr, en: textEn } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
// 💡 Route manquante pour récupérer les textes par section dans le CMS
app.get('/api/admin/section/:sectionName', async (req: Request, res: Response) => {
    try {
        const { sectionName } = req.params;
        const [rows]: any = await db.query(
            'SELECT id, content_key, fr, en, section FROM translations WHERE section = ?', 
            [sectionName]
        );
        
        // On renvoie un tableau (vide ou rempli) pour que le JSON.parse du front réussisse
        res.json(rows || []); 
    } catch (error: any) {
        console.error("❌ Erreur GET section:", error.message);
        res.status(500).json({ error: "Erreur serveur lors de la lecture des données" });
    }
});
// --- ROUTES CONFIGURATION DU SITE (Couleurs, etc.) ---

// 1. Récupérer la config (pour que le Front applique la couleur au chargement)
app.get('/api/admin/site-config', async (req: Request, res: Response) => {
    try {
        const [rows]: any = await db.query('SELECT * FROM site_config WHERE id = 1');
        res.json(rows[0] || { primary_color: '#FF6600' });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération de la config" });
    }
});

// 2. Mettre à jour la couleur depuis le CMS
app.post('/api/admin/update-config', async (req: Request, res: Response) => {
    const { primary_color } = req.body;
    if (!primary_color) return res.status(400).json({ error: "Couleur requise" });

    try {
        await db.query('UPDATE site_config SET primary_color = ? WHERE id = 1', [primary_color]);
        res.json({ success: true, primary_color });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de la couleur" });
    }
});

// 3. MONTAGE DES ROUTES
app.use('/api', siteRoutes);
app.use('/api/auth', authRoutes);
app.use('/movie', routerMovie);
app.use('/api/votes', routerRating);

app.listen(port, async () => {
    console.log(`🚀 Serveur Back opérationnel : http://localhost:${port}`);
    try {
        await TranslationService.syncDatabaseAndJSON();
        console.log('✅ [Auto-Sync] Tout est à jour.');
    } catch (error) {
        console.error('❌ [Auto-Sync] Erreur:', error);
    }
});