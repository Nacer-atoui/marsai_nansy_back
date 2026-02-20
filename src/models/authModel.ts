import db from '../config/database'; // Importation de la connexion à la base

// Définition de l'interface pour que TypeScript reconnaisse "User"
export interface User {
    id?: number;
    email: string;
    password: string;
    role: string; // Le nom du rôle récupéré via la jointure
    firstname?: string;
    lastname?: string;
}

export const findUserByEmail = async (email: string) => {
    const sql = `
        SELECT u.*, r.name AS role 
        FROM user u
        JOIN role_user ru ON u.id = ru.user_id
        JOIN role r ON ru.role_id = r.id
        WHERE u.email = ?
    `;
    const [rows]: any = await db.execute(sql, [email]);
    return rows[0];
};