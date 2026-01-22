import type { User, BankAccount, Loan } from '../types';

const DELAY = 800;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    login: async (email: string, password: string): Promise<User> => {
        await wait(DELAY);
        if (email === 'demo@pledg.in' && password === 'demo1234') {
            return {
                id: 'user-123',
                email,
                name: 'Demo User',
                kycVerified: false,
                kycStatus: 'none',
                phoneNumber: '9876543210'
            };
        }
        throw new Error('Invalid credentials');
    },

    register: async (email: string): Promise<void> => {
        await wait(DELAY);
        console.log('Registered', email);
        // Simulating success
    },

    uploadKYC: async (): Promise<void> => {
        await wait(2000); // OCR simulation
    },

    submitKYC: async (data: any): Promise<void> => {
        await wait(DELAY);
        console.log('Submitted KYC', data);
    },

    verifyBank: async (account: Partial<BankAccount>): Promise<BankAccount> => {
        await wait(2500); // Penny drop sim
        return {
            id: crypto.randomUUID(),
            userId: 'user-123',
            accountHolderName: account.accountHolderName || '',
            bankName: account.bankName || '',
            accountNumber: account.accountNumber || '',
            ifscCode: account.ifscCode || '',
            isPrimary: true,
            isVerified: true,
        };
    },

    applyLoan: async (amount: number, tenure: number): Promise<Loan> => {
        await wait(DELAY);
        const btcPrice = 7200000;
        const ltv = 0.5;
        const collateralValue = amount / ltv;
        const btcCollateral = collateralValue / btcPrice;

        return {
            id: `LN${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`,
            userId: 'user-123',
            amount,
            tenureMonths: tenure,
            interestRate: 14,
            status: 'pending',
            btcCollateral,
            btcPriceAtDisbursement: btcPrice,
            ltv: 50,
        };
    },

    fetchBTCPrice: async (): Promise<number> => {
        try {
            const response = await fetch('https://lucky-wave-c3fe.wolf07279.workers.dev/');
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            return data.bitcoin.inr;
        } catch (error) {
            console.error('API Fetch Error', error);
            // Fallback if API fails
            return 8000000;
        }
    }
};
