import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const createFirstAdmin = async (): Promise<void> => {
    // Configuration de la connexion
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '', // Ton mot de passe MySQL
        database: process.env.DB_NAME
    });

    const email: string = "admin@marsai.fr";
    const plainPassword: string = "SuperSecret123";
    const role: 'admin' | 'super_admin' = "super_admin";

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        // Insertion
        await connection.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role]
        );

        console.log(`✅ Super Admin créé ! 
        Email: ${email}
        Password: ${plainPassword}`);
        
    } catch (error: any) {
        console.error("❌ Erreur :", error.message);
    } finally {
        await connection.end();
    }
};

createFirstAdmin();