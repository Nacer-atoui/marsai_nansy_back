import db from '../config/database';

// 1. MISE À JOUR DU VIGILE TYPESCRIPT
export interface User {
    id: number;
    email: string;
    password: string;
    job?: string;  // On ajoute job (le ? signifie que c'est optionnel / peut être NULL)
    role?: string; // On garde role en optionnel pour ne pas brusquer ton code React
}

// 2. REQUÊTE NETTOYÉE POUR LE LOGIN
export const findUserByEmail = async (email: string): Promise<User | null> => {
    // Fini les jointures (JOIN) compliquées vers des tables qui n'existent plus !
    // ASTUCE : On fait "job AS role" pour que ton front-end reçoive bien une variable "role" sans bugger.
    const sql = `
        SELECT id, email, password, job, job AS role 
        FROM user 
        WHERE email = ?
    `;
    const [rows]: any = await db.execute(sql, [email]);
    return rows[0] || null;
};

// 3. REQUÊTE NETTOYÉE POUR LA LISTE DU STAFF
export const getAllStaff = async () => {
    const sql = `
        SELECT id, email, job, job AS role 
        FROM user
    `;
    const [rows]: any = await db.execute(sql);
    return rows;
};