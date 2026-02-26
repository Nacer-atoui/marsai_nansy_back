import { Router } from 'express';
import { login, registerStaff, getStaffList, deleteStaff } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

/**
 * MIDDLEWARE isAdmin : 
 * Il transforme le rôle en minuscules avant de vérifier pour éviter les erreurs de frappe.
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

// 1. Connexion (Publique)
router.post('/login', login);

// 2. Voir la liste du staff (Sécurisé : Token + Admin)
router.get('/staff', authenticateToken, isAdmin, getStaffList);

// 3. Ajouter un membre (Sécurisé : Token + Admin)
router.post('/register-staff', authenticateToken, isAdmin, registerStaff);

// 4. Supprimer un membre (Sécurisé : Token + Admin)
router.delete('/staff/:id', authenticateToken, isAdmin, deleteStaff);

export default router;