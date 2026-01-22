import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, BankAccount, Loan, Notification, Transaction } from '../types';

interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    bankAccounts: BankAccount[];
    loans: Loan[];
    transactions: Transaction[];
    notifications: Notification[];
    btcPrice: number;

    // Actions
    login: (user: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    addBankAccount: (account: BankAccount) => void;
    addLoan: (loan: Loan) => void;
    updateLoanStatus: (loanId: string, status: Loan['status']) => void;
    updateLoanLTV: (loanId: string, currentPrice: number) => void;
    setBTCPrice: (price: number) => void;
    addNotification: (notification: Notification) => void;
    addTransaction: (transaction: Transaction) => void;
    fetchBTCPrice: () => Promise<void>;
    repayLoan: (loanId: string, amount: number) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            bankAccounts: [],
            loans: [],
            transactions: [],
            notifications: [],
            btcPrice: 8000000,

            fetchBTCPrice: async () => {
                try {
                    const response = await fetch('https://lucky-wave-c3fe.wolf07279.workers.dev/');
                    if (!response.ok) throw new Error('Failed to fetch price');
                    const data = await response.json();
                    if (data.bitcoin?.inr) {
                        set({ btcPrice: data.bitcoin.inr });
                    }
                } catch (error) {
                    console.warn('Failed to fetch real BTC price, using fallback:', error);
                    // Keep existing price or set realistic fallback if 0
                    if (get().btcPrice === 0) set({ btcPrice: 8000000 });
                }
            },

            login: (user) => set({
                user: { ...user, kycVerified: false, kycStatus: 'none' },
                isAuthenticated: true,
                bankAccounts: [],
                loans: [],
                notifications: [],
                transactions: [] // Reset transactions on login
            }),
            logout: () => set({ user: null, isAuthenticated: false, bankAccounts: [], loans: [], transactions: [] }),

            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),

            addBankAccount: (account) => set((state) => ({
                bankAccounts: [...state.bankAccounts, account]
            })),

            addLoan: (loan) => set((state) => ({
                loans: [...state.loans, loan]
            })),

            updateLoanStatus: (loanId, status) => set((state) => ({
                loans: state.loans.map(l => l.id === loanId ? { ...l, status } : l)
            })),

            updateLoanLTV: (loanId, currentPrice) => set((state) => ({
                loans: state.loans.map(loan => {
                    if (loan.id !== loanId) return loan;
                    const collateralValue = loan.btcCollateral * currentPrice;
                    const ltv = (loan.amount / collateralValue) * 100;
                    return { ...loan, ltv };
                })
            })),

            setBTCPrice: (price) => set({ btcPrice: price }),

            addNotification: (notification) => set((state) => ({
                notifications: [notification, ...state.notifications]
            })),

            addTransaction: (transaction) => set((state) => ({
                transactions: [transaction, ...state.transactions]
            })),

            repayLoan: (loanId, amount) => set((state) => {
                const loanIndex = state.loans.findIndex(l => l.id === loanId);
                if (loanIndex === -1) return {};

                const updatedLoans = [...state.loans];
                const loan = updatedLoans[loanIndex];
                const newAmount = loan.amount - amount;

                // Update loan
                updatedLoans[loanIndex] = {
                    ...loan,
                    amount: newAmount > 0 ? newAmount : 0,
                    status: newAmount <= 0 ? 'closed' : loan.status
                };

                return { loans: updatedLoans };
            })
        }),
        {
            name: 'pledg-storage',
        }
    )
);
