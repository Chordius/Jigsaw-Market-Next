import { pool } from '@/lib/db';
import { loginGlobalUser, registerGlobalUser } from '@/lib/jigsawcoin';
import bcrypt from 'bcryptjs';


export async function registerUserService(username: string, email: string, passwordRaw: string) {
    const client = await pool.connect();
    
    try {
        const localCheck = await client.query(
            'SELECT id FROM local_users WHERE email = $1 AND username = $2',
            [email, username]
        );
        
        if (localCheck.rows.length > 0) throw new Error('Email or Username already registered in JigsawMarket');

        let globalUserId: string;
        try {
            const newGlobalUser = await registerGlobalUser(email, passwordRaw);
            globalUserId = newGlobalUser.global_user_id;
        } catch (error: any) {
            if (error.message.includes('already registered')) {
                throw new Error('Email is already used. Please log in instead.');
            }
            throw error;
        }

        const result = await client.query(`
            INSERT INTO local_users (central_user_id, username, email)
            VALUES ($1, $2, $3)
            RETURNING id, central_user_id, username, email
            `, 
            [globalUserId, username, email]
        );

        return result.rows[0];
    } finally {
        client.release();
    }
}

export async function loginUserService(email: string, passwordRaw: string) {
    const client = await pool.connect();

    try {
        const centralAuth = await loginGlobalUser(email, passwordRaw);
        const globalUserId = centralAuth.global_user_id;

        let localCheck = await client.query(
            'SELECT id, username FROM local_users WHERE central_user_id = $1',
            [globalUserId]
        );

        if (localCheck.rows.length === 0) {
            const baseUsername = email.split('@')[0];
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const generatedUsername = `${baseUsername}_${randomSuffix}`;

            const insertResult = await client.query(`
                INSERT INTO local_users (central_user_id, username, email)
                VALUES ($1, $2, $3)
                RETURNING id, username
            `, [globalUserId, generatedUsername, email]);

            localCheck = insertResult;
        }

        const user = localCheck.rows[0];

        return {
            localId: user.id,
            centralId: globalUserId,
            username: user.username
        };
    } catch (error: any) {
        throw new Error(error.message || 'Invalid email or password');
    } finally {
        client.release();
    }
}