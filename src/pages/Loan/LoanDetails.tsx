import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Copy,
    CheckCircle,
    Loader2,
    AlertTriangle,
    Wallet,
    Clock,
    Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useStore } from '../../store';
import { cn, formatCurrency } from '../../lib/utils';
import type { Loan } from '../../types';
import Modal from '../../components/Modal';

const LoanDetails = () => {
    const { loanId } = useParams();
    const navigate = useNavigate();
    const { loans, updateLoanStatus, btcPrice, addTransaction, user, repayLoan } = useStore();
    const [loan, setLoan] = useState<Loan | undefined>(undefined);
    const [depositStep, setDepositStep] = useState(0); // 0: Waiting, 1: Detecting, 2: Confirmed
    const [isDisbursing, setIsDisbursing] = useState(false);
    const [repaymentAmount, setRepaymentAmount] = useState<string>('');
    const [showRepaymentInput, setShowRepaymentInput] = useState(false);

    useEffect(() => {
        const found = loans.find(l => l.id === loanId);
        setLoan(found);
    }, [loanId, loans]);

    const handleCopyAddress = () => {
        navigator.clipboard.writeText('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
        toast.success('Address copied to clipboard');
    };

    const simulateDeposit = () => {
        setDepositStep(1);
        setTimeout(() => {
            setDepositStep(2);
            toast.success('BTC Deposit Detected! Waiting for confirmations...');

            // Simulate 6 confirmations
            setTimeout(() => {
                triggerDisbursement();
            }, 3000);
        }, 2000);
    };

    const triggerDisbursement = () => {
        setIsDisbursing(true);
        if (loan) updateLoanStatus(loan.id, 'disbursing');

        setTimeout(() => {
            if (loan && user) {
                updateLoanStatus(loan.id, 'active');
                addTransaction({
                    id: `tx-${Date.now()}`,
                    userId: user.id,
                    type: 'disbursement',
                    amount: loan.amount,
                    currency: 'INR',
                    status: 'success',
                    date: new Date().toISOString().split('T')[0],
                    referenceId: `ref-disb-${Date.now()}`,
                    loanId: loan.id
                });
            }
            setIsDisbursing(false);
            toast.success('Funds Disbursed to your Bank Account!');
        }, 3000);
    };

    const handleRepayment = () => {
        if (!loan || !user || !repaymentAmount) return;

        const amount = parseFloat(repaymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount > loan.amount) {
            toast.error('Repayment amount cannot exceed loan balance');
            return;
        }

        repayLoan(loan.id, amount);

        addTransaction({
            id: `tx-${Date.now()}`,
            userId: user.id,
            type: 'repayment',
            amount: amount,
            currency: 'INR',
            status: 'success',
            date: new Date().toISOString().split('T')[0],
            referenceId: `ref-repay-${Date.now()}`,
            loanId: loan.id
        });

        setRepaymentAmount('');
        setShowRepaymentInput(false);
        toast.success('Repayment successful!');
    };

    if (!loan) {
        return <div className="p-8 text-center text-gray-500">Loan not found</div>;
    }

    const currentCollateralValue = loan.btcCollateral * btcPrice;
    const currentLTV = (loan.amount / currentCollateralValue) * 100;

    // Derived states
    const isPending = loan.status === 'pending';
    const isActive = loan.status === 'active';
    const isDisbursingState = loan.status === 'disbursing' || isDisbursing;
    const isTopUpEnabled = currentLTV >= 70;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Back to Dashboard"
            >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan #{loan.id}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Applied on {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium capitalize",
                    isPending ? "bg-yellow-100 text-yellow-800" :
                        isActive ? "bg-green-100 text-green-800" :
                            isDisbursingState ? "bg-blue-100 text-blue-800" :
                                "bg-gray-100 text-gray-800"
                )}>
                    {isDisbursingState ? 'Processing...' : loan.status}
                </div>
            </div>

            {isPending && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <Wallet className="h-5 w-5 mr-2 text-bitcoin-orange" />
                            Deposit Collateral
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                {/* Simulated QR Code */}
                                <div className="h-40 w-40 bg-gray-900 flex items-center justify-center text-white text-xs">
                                    [QR CODE]
                                </div>
                            </div>
                            <p className="mt-4 text-sm font-medium text-gray-900">Scan to Deposit</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Send Exactly</label>
                                <div className="mt-1 text-2xl font-bold text-gray-900">
                                    {loan.btcCollateral.toFixed(6)} BTC
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Deposit Address</label>
                                <div className="mt-1 flex items-center">
                                    <code className="block w-full bg-gray-50 p-3 rounded-lg text-sm text-gray-800 break-all border border-gray-200">
                                        bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                                    </code>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Copy Address"
                                    >
                                        <Copy className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-red-500 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Send only Bitcoin (BTC) to this address.
                                </p>
                            </div>

                            {depositStep === 0 ? (
                                <button
                                    onClick={simulateDeposit}
                                    className="w-full btn-primary"
                                >
                                    I have sent the BTC (Simulate)
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", depositStep >= 1 ? "bg-green-100 text-green-600" : "bg-gray-100")}>
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">Deposit Detected</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", depositStep >= 2 ? "bg-green-100 text-green-600" : "bg-gray-100")}>
                                            {depositStep === 1 ? <Loader2 className="h-5 w-5 animate-spin text-bitcoin-orange" /> : <CheckCircle className="h-5 w-5" />}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">Confirming (3/6)</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isDisbursingState && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
                    <Loader2 className="h-12 w-12 text-brand-blue animate-spin mx-auto" />
                    <h2 className="mt-4 text-xl font-bold text-gray-900">Disbursing Funds...</h2>
                    <p className="mt-2 text-gray-600">Sending {formatCurrency(loan.amount)} to your registered bank account.</p>
                </div>
            )}

            {isActive && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LTV & Health Card */}
                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Loan Health</h3>

                        <div className="relative pt-6 pb-2">
                            <div className="flex mb-2 items-center justify-between">
                                <div className="text-right">
                                    <span className={cn(
                                        "text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full",
                                        currentLTV > 70 ? "text-red-600 bg-red-200" : "text-green-600 bg-green-200"
                                    )}>
                                        LTV: {currentLTV.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
                                <div style={{ width: `${currentLTV}% ` }} className={cn(
                                    "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500",
                                    currentLTV > 80 ? "bg-red-500" :
                                        currentLTV > 70 ? "bg-orange-500" :
                                            "bg-green-500"
                                )}></div>
                            </div>

                            <div className="flex justify-between text-xs text-gray-500">
                                <span>0%</span>
                                <span>50% (Safe)</span>
                                <span>70% (Margin Call)</span>
                                <span>83% (Liquidate)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Current Collateral Value</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(currentCollateralValue)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Liquidation Price (BTC)</p>
                                <p className="text-lg font-bold text-red-600">
                                    {formatCurrency(loan.amount / (loan.btcCollateral * 0.83))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                className={cn("w-full btn-secondary text-left flex items-center justify-center", !isTopUpEnabled && "opacity-50 cursor-not-allowed")}
                                disabled={!isTopUpEnabled}
                                title={!isTopUpEnabled ? "Top-up available only when LTV > 70%" : ""}
                            >
                                <Wallet className="h-4 w-4 mr-2" /> Top-up Collateral
                            </button>
                            <button
                                onClick={() => setShowRepaymentInput(true)}
                                className="w-full btn-secondary text-left flex items-center justify-center"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" /> Make Repayment
                            </button>

                            <Modal
                                isOpen={showRepaymentInput}
                                onClose={() => setShowRepaymentInput(false)}
                                title="Repay Loan"
                            >
                                <div className="space-y-6">
                                    {/* Balance Breakdown */}
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Principal Balance</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(loan.amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Accrued Interest</span>
                                            <span className="font-medium text-gray-900">₹0</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
                                            <span className="text-gray-900">Total Outstanding</span>
                                            <span className="text-gray-900">{formatCurrency(loan.amount)}</span>
                                        </div>
                                    </div>

                                    {/* Input Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Repayment Amount</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-gray-500 text-lg font-medium">₹</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={repaymentAmount}
                                                onChange={(e) => setRepaymentAmount(e.target.value)}
                                                className="block w-full pl-10 pr-4 py-4 text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-shadow"
                                                placeholder="0"
                                                aria-label="Repayment Amount"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[25, 50, 100].map((percent) => (
                                            <button
                                                key={percent}
                                                onClick={() => setRepaymentAmount((loan.amount * (percent / 100)).toFixed(0))}
                                                className="py-2 px-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                {percent === 100 ? 'Full Amount' : `${percent}%`}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Summary */}
                                    {repaymentAmount && !isNaN(parseFloat(repaymentAmount)) && (
                                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex justify-between items-center">
                                            <span>New Balance after payment:</span>
                                            <span className="font-bold">
                                                {formatCurrency(Math.max(0, loan.amount - parseFloat(repaymentAmount)))}
                                            </span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-4 pt-2">
                                        <button
                                            onClick={() => setShowRepaymentInput(false)}
                                            className="flex-1 py-3 px-4 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRepayment}
                                            disabled={!repaymentAmount || parseFloat(repaymentAmount) <= 0}
                                            className="flex-1 py-3 px-4 text-white bg-bitcoin-orange hover:bg-opacity-90 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                        >
                                            Pay {repaymentAmount ? formatCurrency(parseFloat(repaymentAmount)) : formatCurrency(0)}
                                        </button>
                                    </div>
                                </div>
                            </Modal>
                            <button className="w-full btn-secondary text-left flex items-center justify-center text-gray-500">
                                <Download className="h-4 w-4 mr-2" /> Loan Agreement
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Loan Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-gray-500">Principal Amount</p>
                                <p className="text-lg font-medium">{formatCurrency(loan.amount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Interest Rate</p>
                                <p className="text-lg font-medium">{loan.interestRate}% p.a.</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Tenure</p>
                                <p className="text-lg font-medium">{loan.tenureMonths} Months</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Maturity Date</p>
                                <p className="text-lg font-medium flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                    {new Date(Date.now() + loan.tenureMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="col-span-2 md:col-span-4 mt-2 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">Total Repayment Amount</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Principal + Interest</p>
                                </div>
                                <p className="text-2xl font-bold text-bitcoin-orange">
                                    {formatCurrency(loan.amount + (loan.amount * (loan.interestRate / 100) * (loan.tenureMonths / 12)))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanDetails;
