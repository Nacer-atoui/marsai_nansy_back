import { Router } from 'express';
import { syncTranslations, getTranslations } from '../controllers/translationController';

const router = Router();

// 1. La route pour l'ADMIN (POST)
// C'est celle qui traduit avec DeepL et crée les fichiers JSON
router.post('/sync', syncTranslations);

// 2. La route pour le FRONT ou le DEBUG (GET)
// Permet de voir les traductions d'une langue : /api/translations/fr
router.get('/:lang', getTranslations);

export default router;