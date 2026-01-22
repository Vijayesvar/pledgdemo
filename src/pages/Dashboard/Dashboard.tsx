import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Building } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import PortfolioSummary from './PortfolioSummary';
import BTCPriceWidget from './BTCPriceWidget';
import ActiveLoans from './ActiveLoans';
import { useStore } from '../../store';
import { toast } from 'react-toastify';
import LoanCalculator from '../Loan/components/LoanCalculator';
import LTVSimulator from '../Loan/components/LTVSimulator';

const Dashboard = () => {
    const { user, loans, btcPrice, bankAccounts, updateLoanLTV, addNotification } = useStore();
    const navigate = useNavigate();
    const [loanAmount, setLoanAmount] = useState(50000);

    // Simulated Risk Engine
    useEffect(() => {
        const checkRisk = () => {
            loans.forEach(loan => {
                if (loan.status === 'active') {
                    updateLoanLTV(loan.id, btcPrice);

                    const collateralValue = loan.btcCollateral * btcPrice;
                    const ltv = (loan.amount / collateralValue) * 100;

                    // Risk Thresholds (Simulated usage to avoid lints)
                    if (ltv > 83) {
                        addNotification({
                            id: `liquidation-${loan.id}`,
                            userId: user?.id || 'demo-user',
                            title: 'Liquidation Risk',
                            type: 'danger',
                            message: `Loan ${loan.id} is at liquidation risk! LTV: ${ltv.toFixed(2)}%`,
                            date: new Date().toISOString(),
                            read: false
                        });
                        toast.error(`Loan ${loan.id} is at liquidation risk! LTV: ${ltv.toFixed(2)}%`);
                    } else if (ltv > 70) {
                        addNotification({
                            id: `margin-call-${loan.id}`,
                            userId: user?.id || 'demo-user',
                            title: 'Margin Call',
                            type: 'warning',
                            message: `Loan ${loan.id} is approaching margin call! LTV: ${ltv.toFixed(2)}%`,
                            date: new Date().toISOString(),
                            read: false
                        });
                        toast.warn(`Loan ${loan.id} is approaching margin call! LTV: ${ltv.toFixed(2)}%`);
                    }
                }
            });
        };

        const interval = setInterval(checkRisk, 5000); // Check every 5s
        return () => clearInterval(interval);
    }, [loans, btcPrice, updateLoanLTV, addNotification]);

    return (
        <div className="space-y-8">
            {/* 1. Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 pb-6">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-bitcoin-orange flex items-center justify-center mr-3 relative">
                        <span className="text-white font-bold text-xl">₿</span>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-700 rounded-full flex items-center justify-center text-[10px] text-white border border-white">
                            ₹
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">BTC-backed loans</h1>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={() => navigate('/loans/apply')}
                        className="bg-[#F7931A] hover:bg-[#E2830D] text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center text-sm"
                    >
                        Apply for a loan
                    </button>
                </div>
            </div>

            {/* 2. Stats Section (Portfolio Summary + BTC Price) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <PortfolioSummary />
                </div>
                <div className="lg:col-span-1">
                    <BTCPriceWidget />
                </div>
            </div>

            {/* 3. Verification Alerts (Only show if needed) */}
            {(!user?.kycVerified || !bankAccounts.some(b => b.isVerified)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!user?.kycVerified && (
                        <div className="rounded-xl p-4 border bg-orange-50 border-orange-100 flex justify-between items-center">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                                <span className="text-sm font-medium text-orange-800">Identity verification required</span>
                            </div>
                            <button onClick={() => navigate('/kyc')} className="text-sm font-bold text-orange-600 hover:underline">Complete KYC</button>
                        </div>
                    )}
                    {!bankAccounts.some(b => b.isVerified) && (
                        <div className="rounded-xl p-4 border bg-blue-50 border-blue-100 flex justify-between items-center">
                            <div className="flex items-center">
                                <Building className="h-5 w-5 text-blue-500 mr-2" />
                                <span className="text-sm font-medium text-blue-800">Bank account required</span>
                            </div>
                            <button onClick={() => navigate('/bank-accounts')} className="text-sm font-bold text-blue-600 hover:underline">Link Account</button>
                        </div>
                    )}
                </div>
            )}


            {/* 4. Active Loans Section */}
            <div>
                <ActiveLoans />
            </div>

            {/* 5. Plan New Loan Section (Moved to Bottom) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Plan a New Loan</h2>
                        <p className="text-gray-500 mt-1">Calculate your terms and visualize LTV scenarios instantly.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <LoanCalculator
                        btcPrice={btcPrice}
                        loanAmount={loanAmount}
                        onLoanAmountChange={setLoanAmount}
                    />

                    <div className="space-y-8">
                        <LTVSimulator
                            currentBTCPrice={btcPrice}
                            loanAmount={loanAmount}
                            collateralBTC={loanAmount / (btcPrice * 0.5)} // Derived collateral based on 50% LTV
                        />

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Ready to proceed?</p>
                                    <p className="text-lg font-bold text-slate-900 mt-1">
                                        Get {formatCurrency(loanAmount)} today
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/loans/apply', { state: { initialAmount: loanAmount } })}
                                    className="btn-primary flex items-center px-6 py-3"
                                >
                                    Proceed to Application <ArrowRight className="h-4 w-4 ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
