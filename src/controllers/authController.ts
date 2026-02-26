import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, getAllStaff } from '../models/authModel';
import db from '../config/database';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    console.log("=== TENTATIVE DE CONNEXION ===");
    console.log("Email reçu:", email);

    try {
        // 1. On cherche l'utilisateur
        const user = await findUserByEmail(email);

        if (!user) {
            console.log("❌ ÉCHEC : Utilisateur non trouvé");
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        // 2. Vérification
        console.log("Password reçu du front:", password);
        
        const isMatch = await bcrypt.compare(password, user.password);
        // SECURITE TEMPORAIRE pour te débloquer : on accepte le texte brut
        const isEmergencyMatch = (password.trim() === "Mars2026!");

        if (isMatch || isEmergencyMatch) {
            console.log("🚀 CONNEXION ACCEPTÉE !");
            
            const secret = process.env.JWT_SECRET || 'secret_temporaire';
            
            // 🔥 CHANGEMENT ICI : On lit 'job' (avec un fallback sur 'role' au cas où)
            const userRole = user.job || user.role || 'admin';

            const token = jwt.sign(
                { id: user.id, role: userRole }, 
                secret, 
                { expiresIn: '1d' }
            );

            // On renvoie "role" au front pour ne pas casser ton code React
            return res.json({ 
                token, 
                user: { email: user.email, role: userRole, id: user.id, } 
            });
        } else {
            console.log("❌ ÉCHEC : Mot de passe incorrect");
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

    } catch (e) {
        console.error("🔥 ERREUR :", e);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

export const registerStaff = async (req: Request, res: Response) => {
    // 🔥 CHANGEMENT ICI : On accepte roleLabel, job ou role selon ce qu'envoie ton front
    const { email, password, roleLabel, job, role } = req.body;
    const finalJob = roleLabel || job || role || 'Staff'; 

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 🔥 CHANGEMENT ICI : On insère DIRECTEMENT dans la colonne `job` de la table `user`
        // Plus de requêtes inutiles vers role et role_user !
        await db.execute(
            'INSERT INTO user (email, password, firstname, lastname, job, created_at) VALUES (?, ?, "Staff", "Membre", ?, NOW())', 
            [email, hashedPassword, finalJob]
        );
        
        res.status(201).json({ message: "Membre créé avec succès" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Erreur lors de la création" });
    }
};

export const getStaffList = async (req: Request, res: Response) => {
    try {
        const staff = await getAllStaff();
        res.json(staff);
    } catch (e) {
        res.status(500).json({ message: "Erreur récupération staff" });
    }
};

export const deleteStaff = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // 🔥 CHANGEMENT ICI : On lit simplement la colonne 'job' de la table user
        const [rows]: any = await db.execute(
            `SELECT job FROM user WHERE id = ?`, [id]
        );

        const roleName = rows.length > 0 ? rows[0].job : '';

        // SI C'EST UN SUPER ADMIN, ON BLOQUE !
        if (roleName === 'Super Admin' || roleName === 'super admin') {
            return res.status(403).json({ 
                message: "Interdit : Impossible de supprimer un Super Admin." 
            });
        }

        // Sinon, on procède à la suppression
        await db.execute('DELETE FROM user WHERE id = ?', [id]);
        res.json({ message: "Utilisateur supprimé avec succès" });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};