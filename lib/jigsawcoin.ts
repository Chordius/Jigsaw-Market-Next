import axios from "axios";

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || 'http://localhost:3000';
const API_KEY = process.env.CENTRAL_WALLET_API_KEY;

export async function deductCentralPoints(globalUserId: string, amount: number, localReferenceId: string) {
    const response = await axios.post(
        `${CENTRAL_API_URL}/api/v1/wallet/transaction`,
        {
            global_user_id: globalUserId,
            amount: -Math.abs(amount), // Ensure it is a deduction
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
    const response = await axios.get(`${CENTRAL_API_URL}/api/v1/user/lookup`, {
        headers: { 'x-api-key': API_KEY },
        params: { email },
        validateStatus: (status) => status < 500,
    });

    if (response.status === 404) return null;
    if (!response.data.success) throw new Error(response.data.message || 'Failed to lookup global user');

    return response.data.payload;
}

export async function createGlobalUser(email: string, password: string) {
    const response = await axios.post(
        `${CENTRAL_API_URL}/api/v1/user/create`,
        { email, password },
        { headers: { 'x-api-key': API_KEY } }
    );

    if (!response.data.success) throw new Error(response.data.message || 'Failed to create global user');

    return response.data.payload;
}