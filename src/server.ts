import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database'; 
import { TranslationService } from './services/TranslationService';

import routerMovie from './routes/movie.routes'; 
import siteRoutes from './routes/site.routes'; 
import authRoutes from './routes/authRoutes';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ==========================================
// 1. ROUTES DU CMS ET DES TRADUCTIONS
// ==========================================

app.get('/api/translations/:lng', async (req: Request, res: Response) => {
    try {
        const lng = String(req.params.lng);
        const targetLang = lng.startsWith('en') ? 'en' : 'fr';
        const [rows]: any = await db.query('SELECT content_key, ?? as text FROM translations', [targetLang]);

        const translations = rows.reduce((acc: any, row: any) => {
            const keys = row.content_key.split('.');
            let current = acc;
            keys.forEach((key: string, i: number) => {
                if (i === keys.length - 1) {
                    current[key] = row.text;
                } else {
                    current[key] = current[key] || {};
                    current = current[key];
                }
            });
            return acc;
        }, {});
        res.json(translations);
    } catch (error) {
        console.error("Erreur GET translations:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.post('/api/admin/update-content', async (req: Request, res: Response) => {
    const { key, section, textFr, textEnManual } = req.body;
    if (!key || !textFr) return res.status(400).json({ error: "Clé et texte FR requis." });

    try {
        const textEn = (textEnManual && textEnManual.trim() !== "") 
            ? textEnManual 
            : await TranslationService.translate(textFr);

        const sql = `
            INSERT INTO translations (content_key, section, fr, en) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE fr = VALUES(fr), en = VALUES(en)
        `;
        await db.query(sql, [key, section || 'general', textFr, textEn]);
        
        // On synchronise aussi ici pour que le JSON soit à jour immédiatement après un update admin
        await TranslationService.exportToJSON();
        
        res.json({ success: true, data: { fr: textFr, en: textEn } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/admin/section/:sectionName', async (req: Request, res: Response) => {
    try {
        const { sectionName } = req.params;
        const [rows]: any = await db.query(
            'SELECT content_key, fr, en FROM translations WHERE section = ?', 
            [sectionName]
        );
        res.json(rows);
    } catch (error) {
        console.error("Erreur GET section:", error);
        res.status(500).json({ error: "Erreur serveur lors de la lecture" });
    }
});

// ==========================================
// 3. MONTAGE DES ROUTES EXTERNES
// ==========================================
app.use('/api', siteRoutes);
app.use('/api/auth', authRoutes);
app.use('/movie', routerMovie);

// ==========================================
// LANCEMENT DU SERVEUR AVEC AUTO-SYNC
// ==========================================
app.listen(port, async () => { // 👈 Ajout de async ici
    console.log(`🚀 Serveur Back opérationnel : http://localhost:${port}`);

    try {
        console.log('🔄 [Auto-Sync] Vérification des traductions et génération des JSON...');
        
        // Cette fonction va :
        // 1. Chercher les cases 'en' vides -> Appeler DeepL
        // 2. Mettre à jour la DB
        // 3. Générer les fichiers .json dans ton dossier Front
        await TranslationService.syncDatabaseAndJSON();
        
        console.log('✅ [Auto-Sync] Tout est à jour.');
    } catch (error) {
        console.error('❌ [Auto-Sync] Erreur au démarrage:', error);
    }
});