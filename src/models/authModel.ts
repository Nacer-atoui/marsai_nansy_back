import db from '../config/database';

export interface User {
    id: number;
    email: string;
    password: string;
    role: string;
}

// Trouver un utilisateur (on utilise LEFT JOIN pour ne pas bloquer si le rôle est mal configuré)
export const findUserByEmail = async (email: string): Promise<User | null> => {
    const sql = `
        SELECT u.id, u.email, u.password, r.name AS role 
        FROM user u
        LEFT JOIN role_user ru ON u.id = ru.user_id
        LEFT JOIN role r ON ru.role_id = r.id
        WHERE u.email = ?
    `;
    const [rows]: any = await db.execute(sql, [email]);
    return rows[0] || null;
};

// Exporter précisément cette fonction pour le contrôleur
export const getAllStaff = async () => {
    const sql = `
        SELECT u.id, u.email, r.name AS role 
        FROM user u
        LEFT JOIN role_user ru ON u.id = ru.user_id
        LEFT JOIN role r ON ru.role_id = r.id
    `;
    const [rows]: any = await db.execute(sql);
    return rows;
};