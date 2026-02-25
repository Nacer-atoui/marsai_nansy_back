import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// On définit ce qu'il y a dans notre Token (id et rôle)
interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Accès refusé, token manquant" });
    }

    const secret = process.env.JWT_SECRET || 'secret_temporaire_si_env_vide';

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide ou expiré" });
        }
        
        // Maintenant TypeScript sait que req.user contient id et role
        req.user = user as { id: number; role: string }; 
        next();
    });
};