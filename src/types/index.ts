export interface User {
    id: string;
    email: string;
    name: string;
    kycVerified: boolean;
    kycStatus: 'pending' | 'verified' | 'rejected' | 'none';
    phoneNumber?: string;
}

export interface BankAccount {
    id: string;
    userId: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    isPrimary: boolean;
    isVerified: boolean;
}

export interface Loan {
    id: string;
    userId: string;
    amount: number;
    tenureMonths: number;
    interestRate: number;
    status: 'active' | 'pending' | 'closed' | 'rejected' | 'disbursing';
    btcCollateral: number;
    btcPriceAtDisbursement: number;
    ltv: number;
    disbursementDate?: string;
    maturityDate?: string;
    marginCallPrice?: number;
    liquidationPrice?: number;
}

export interface Transaction {
    id: string;
    userId: string;
    loanId?: string;
    type: 'disbursement' | 'deposit' | 'repayment' | 'liquidation' | 'interest' | 'withdrawal';
    amount: number;
    currency: 'INR' | 'BTC';
    status: 'success' | 'pending' | 'failed';
    date: string;
    referenceId: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    read: boolean;
    date: string;
}
