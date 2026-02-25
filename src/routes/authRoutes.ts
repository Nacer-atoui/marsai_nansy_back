import { Router } from 'express';
import { login, registerStaff, getStaffList, deleteStaff } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

/**
 * MIDDLEWARE isAdmin corrigé : 
 * Il transforme le rôle en minuscules avant de vérifier.
 */
const isAdmin = (req: any, res: any, next: any) => {
    // On récupère le rôle et on le met en minuscules pour comparer facilement
    const role = req.user?.role?.toLowerCase();

    // On autorise si c'est 'admin' OU 'super admin'
    if (role === 'super admin' || role === 'admin') {
        return next();
    }
    
    return res.status(403).json({ message: "Accès refusé" });
};

// --- ROUTES ---
router.post('/login', login);
router.get('/staff', authenticateToken, getStaffList);
router.post('/register-staff', authenticateToken, isAdmin, registerStaff);
router.delete('/staff/:id', authenticateToken, isAdmin, deleteStaff);

export default router;