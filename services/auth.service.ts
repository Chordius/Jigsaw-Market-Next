import { pool } from '@/lib/db';
import { loginGlobalUser, registerGlobalUser, creditCentralPoints } from '@/lib/jigsawcoin';
import bcrypt from 'bcryptjs';


export async function registerUserService(username: string, email: string, passwordRaw: string) {
    const client = await pool.connect();
    
    try {
        const usernameCheck = await client.query(
            'SELECT id FROM local_users WHERE username = $1',
            [username]
        );

        if (usernameCheck.rows.length > 0) {
            throw new Error('Username is already taken in JigsawMarket');
        }

        const emailCheck = await client.query(
            'SELECT id FROM local_users WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            throw new Error('Email is already registered in JigsawMarket');
        }

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

        const result = await client.query(
            `
            INSERT INTO local_users (central_user_id, username, email)
            VALUES ($1, $2, $3)
            RETURNING id, central_user_id, username, email
            `,
            [globalUserId, username, email]
        );

        const user = result.rows[0];

        const todayUTC = new Date().toISOString().split('T')[0];
        try {
            await creditCentralPoints(globalUserId, 100, `Daily Login Reward - ${todayUTC} - ${globalUserId}`);
            await client.query(
                'UPDATE local_users SET last_login_reward = $1 WHERE id = $2',
                [todayUTC, user.id]
            );
        } catch (e) {
            console.error("Failed to give registration reward:", e);
        }

        return user;
    } catch (error: any) {
        if (error?.code === '23505') {
            if (error.constraint === 'local_users_username_key') {
                throw new Error('Username is already taken in JigsawMarket');
            }

            if (error.constraint === 'local_users_email_key') {
                throw new Error('Email is already registered in JigsawMarket');
            }
        }

        throw error;
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
            'SELECT id, username, email FROM local_users WHERE central_user_id = $1',
            [globalUserId]
        );

        if (localCheck.rows.length === 0) {
            const baseUsername = email.split('@')[0];
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const generatedUsername = `${baseUsername}_${randomSuffix}`;

            const insertResult = await client.query(`
                INSERT INTO local_users (central_user_id, username, email)
                VALUES ($1, $2, $3)
                RETURNING id, username, email
            `, [globalUserId, generatedUsername, email]);

            localCheck = insertResult;
        }

        const user = localCheck.rows[0];

        const todayUTC = new Date().toISOString().split('T')[0];
        
        const rewardCheck = await client.query(`
            SELECT id 
            FROM local_users 
            WHERE id = $1 AND last_login_reward = $2::DATE
        `, [user.id, todayUTC]);
        
        const alreadyReceived = rewardCheck.rows.length > 0;

        if (!alreadyReceived) {
            try {
                const rewardRef = `Daily Login Reward - ${todayUTC} - ${globalUserId}`;
                await creditCentralPoints(globalUserId, 100, rewardRef);
                
                await client.query(`
                    UPDATE local_users 
                    SET last_login_reward = $1 
                    WHERE id = $2
                `, [todayUTC, user.id]);
                
                console.log(`Daily reward given to ${user.username} for ${todayUTC}`);
            } catch (err) {
                console.error("Failed to process daily login reward:", err);
            }
        }

        return {
            id: user.id,
            central_user_id: globalUserId,
            username: user.username
        };
    } catch (error: any) {
        throw new Error(error.message || 'Invalid email or password');
    } finally {
        client.release();
    }
}