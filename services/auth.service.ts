import { pool } from '@/lib/db';
import { lookupGlobalUser, createGlobalUser } from '@/lib/jigsawcoin';
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
        const existingGlobalUser = await lookupGlobalUser(email);

        if (existingGlobalUser && existingGlobalUser.global_user_id) {
            globalUserId = existingGlobalUser.global_user_id;
        } else {
            const newGlobalUser = await createGlobalUser(email);
            globalUserId = newGlobalUser.global_user_id;
        }

        console.log(globalUserId);
        const salt  = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(passwordRaw, salt);

        const result = await client.query(`
            INSERT INTO local_users (central_user_id, username, email, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, central_user_id, username, email
            `, 
            [globalUserId, username, email, password]
        );

        return result.rows[0];
    } finally {
        client.release();
    }
}

export async function loginUserService(email: string, passwordRaw: string) {
    const client = await pool.connect();

    try {
        const result = await client.query(
            'SELECT id, central_user_id, username, password_hash FROM local_users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) throw new Error('Invalid email or password');

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(passwordRaw, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        return {
            localId: user.id,
            centralId: user.central_user_id,
            username: user.username
        };
    } finally {
        client.release();
    }
}