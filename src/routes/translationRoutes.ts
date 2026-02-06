import { Router } from 'express';
import { syncTranslations } from '../controllers/translationController';

const router = Router();

// Cette route fera l'UPDATE en base + la génération des JSON
router.post('/sync', syncTranslations);

export default router;