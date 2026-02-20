import { Router } from 'express';
import { login } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware'; // <-- Import indispensable

const router = Router();

// Route publique (accessible à tous pour se connecter)
router.post('/login', login);

// Route protégée (seul un utilisateur avec un token valide peut entrer)
router.get('/dashboard-data', authenticateToken, (req, res) => {
    res.json({ 
        message: "Bienvenue sur le Dashboard !",
        stats: "Données ultra secrètes accessibles uniquement avec le token" 
    });
});

export default router;