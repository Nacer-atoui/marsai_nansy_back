import { Router } from 'express';
import { syncTranslations, getTranslations } from '../controllers/translationController';

const router = Router();

// Route pour l'admin (POST)
router.post('/sync', syncTranslations);

// Route pour i18next (GET) - C'est celle-ci que le Front va appeler
router.get('/translations/:lang', getTranslations);

export default router;