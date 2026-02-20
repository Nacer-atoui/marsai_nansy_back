import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../models/authModel';


export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        
        
        const user = await findUserByEmail(email);
        console.log("Utilisateur trouvé en base :", user ? "OUI" : "NON");

        if (!user) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Le mot de passe match ? :", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const secret = process.env.JWT_SECRET || 'secret_temporaire_si_env_vide';
        
        const token = jwt.sign(
            { id: user.id, role: user.role },
            secret,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            token,
            user: { 
                email: user.email, 
                role: user.role 
            }
        });

    } catch (error) {
        console.error("Erreur login complète:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};