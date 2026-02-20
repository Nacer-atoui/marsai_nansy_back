import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    // On récupère le token dans le header "Authorization"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Accès refusé, token manquant" });
    }

    const secret = process.env.JWT_SECRET || 'secret_temporaire_si_env_vide';

    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide ou expiré" });
        }
        req.user = user; // On ajoute les infos de l'utilisateur à la requête
        next(); // On laisse passer à la suite
    });
};