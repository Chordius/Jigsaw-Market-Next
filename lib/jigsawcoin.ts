import axios from "axios";

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3000';
const API_KEY = process.env.CENTRAL_WALLET_API_KEY;

export async function deductCentralPoints(globalUserId: string, amount: number, localReferenceId: string) {
    const response = await axios.post(
        `${CENTRAL_API_URL}/api/v1/wallet/transaction`,
        {
            global_user_id: globalUserId,
            amount: -Math.abs(amount),
            reference_id: localReferenceId,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
        }
    );

    if (!response.data.success) throw new Error(response.data.message || 'Transaction failed');

    return response.data.payload;
}

export async function lookupGlobalUser(email: string) {
    const response = await axios.get(`${CENTRAL_API_URL}/api/v1/user/lookup/${email}`, {
        headers: { 'x-api-key': API_KEY },
        validateStatus: (status) => status < 500,
    });

    if (response.status === 404) return null;
    if (!response.data.success) throw new Error(response.data.message || 'Failed to lookup global user');

    return response.data.payload;
}

export async function registerGlobalUser(email: string, passwordRaw: string) {
    try {
        const response = await axios.post(
            `${CENTRAL_API_URL}/api/v1/user/register`,
            {
                email: email,
                password: passwordRaw
            },
            { headers: { 'x-api-key': API_KEY } }
        );

        return response.data.payload;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to register globally';
        throw new Error(errorMessage);
    }
}

export async function loginGlobalUser(email: string, passwordRaw: string) {
    try {
        const response = await axios.post(
            `${CENTRAL_API_URL}/api/v1/user/login`,
            {
                email: email,
                password: passwordRaw
            },
            { headers: { 'x-api-key': API_KEY } }
        );

        return response.data.payload;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Invalid email or password';
        throw new Error(errorMessage);
    }
}

export async function creditCentralPoints(globalUserId: string, amount: number, localReferenceId: string) {
    const response = await axios.post(
        `${CENTRAL_API_URL}/api/v1/wallet/transaction`,
        {
            global_user_id: globalUserId,
            amount: Math.abs(amount),
            reference_id: localReferenceId,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
        }
    );

    if (!response.data.success) throw new Error(response.data.message || 'Credit transaction failed');

    return response.data.payload;
}

export async function fetchCentralBalance(globalUserId: string) {
    const response = await axios.get(
        `${CENTRAL_API_URL}/api/v1/wallet/balance/${globalUserId}`,
        {
            headers: { 'x-api-key': API_KEY },
            validateStatus: (status) => status < 500,
        }
    );

    if (response.status === 404) throw new Error('User not found in central wallet');
    if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch balance');

    return response.data.payload;
}

export async function fetchCentralHistory(globalUserId: string) {
    const response = await axios.get(
        `${CENTRAL_API_URL}/api/v1/wallet/history/${globalUserId}`,
        {
            headers: { 'x-api-key': API_KEY },
            validateStatus: (status) => status < 500,
        }
    );

    if (response.status === 404) return [];
    if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch history');

    return response.data.payload;
}