import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowRight, ArrowLeft, CheckCircle, Info, Bitcoin, Loader2 } from 'lucide-react';
import { useStore } from '../../store';
import { mockApi } from '../../api/mock';
import { toast } from 'react-toastify';
import { cn, formatCurrency } from '../../lib/utils';


const STEPS = [
    { id: 1, name: 'Loan Details' },
    { id: 2, name: 'Collateral' },
    { id: 3, name: 'Agreements' },
    { id: 4, name: 'Deposit BTC' },
];

const ApplyLoan = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialAmount = (location.state as any)?.initialAmount;

    // Eligibility Check
    const { btcPrice, user, bankAccounts } = useStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [loanAmount, setLoanAmount] = useState(initialAmount || 50000);
    const [processing, setProcessing] = useState(false);
    const [createdLoanId, setCreatedLoanId] = useState<string | null>(null);

    // Eligibility Check
    const isKYCVerified = user?.kycVerified;
    const hasBankAccount = bankAccounts.some(b => b.isVerified);

    if (!isKYCVerified || !hasBankAccount) {
        return (
            <div className="max-w-2xl mx-auto py-16 px-4 text-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-orange-100 mb-6">
                        <Info className="h-10 w-10 text-bitcoin-orange" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Required</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        To ensure the security of your loan, we need to verify your identity and bank account before you can proceed.
                    </p>

                    <div className="space-y-4 max-w-sm mx-auto">
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${isKYCVerified ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center">
                                <span className={`flex items-center justify-center h-8 w-8 rounded-full mr-3 ${isKYCVerified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {isKYCVerified ? <CheckCircle className="h-5 w-5" /> : '1'}
                                </span>
                                <span className={`font-medium ${isKYCVerified ? 'text-gray-900' : 'text-gray-500'}`}>Identity Verification (KYC)</span>
                            </div>
                            {!isKYCVerified && (
                                <button onClick={() => navigate('/kyc')} className="text-sm font-medium text-bitcoin-orange hover:text-orange-600">
                                    Start
                                </button>
                            )}
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center justify-between ${hasBankAccount ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center">
                                <span className={`flex items-center justify-center h-8 w-8 rounded-full mr-3 ${hasBankAccount ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {hasBankAccount ? <CheckCircle className="h-5 w-5" /> : '2'}
                                </span>
                                <span className={`font-medium ${hasBankAccount ? 'text-gray-900' : 'text-gray-500'}`}>Bank Account Link</span>
                            </div>
                            {!hasBankAccount && (
                                <button onClick={() => navigate('/bank-accounts')} className="text-sm font-medium text-bitcoin-orange hover:text-orange-600">
                                    Link
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 text-sm text-gray-400">
                        Both steps are required to unlock instant bitcoin-backed loans.
                    </div>
                </div>
            </div>
        );
    }

    // Calculated values
    const ltv = 0.5; // 50%
    const collateralValue = loanAmount / ltv;
    const requiredBTC = collateralValue / btcPrice;

    const { register, handleSubmit, watch } = useForm({
        defaultValues: {
            purpose: 'Personal',
            tenure: '12',
            agreeTerms: false,
            agreeRisk: false,
            agreeNBFC: false
        }
    });

    const { addLoan } = useStore();

    // formatINR definition removed

    const onNext = () => {
        if (currentStep < 3) setCurrentStep(curr => curr + 1);
    };

    const onBack = () => {
        if (currentStep > 1) setCurrentStep(curr => curr - 1);
    };

    const onSubmit = async (data: any) => {
        setProcessing(true);
        try {
            const loan = await mockApi.applyLoan(loanAmount, parseInt(data.tenure));
            addLoan(loan);
            setCreatedLoanId(loan.id);
            setCurrentStep(4);
            toast.success('Loan Approved! Please deposit collateral.');
        } catch (error) {
            toast.error('Application failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Stepper */}
            <div className="mb-8">
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center">
                        {STEPS.map((step, stepIdx) => (
                            <li key={step.name} className={cn(stepIdx !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative')}>
                                {step.id < currentStep || (step.id === currentStep && currentStep === 4) ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-bitcoin-orange" />
                                        </div>
                                        <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-full bg-bitcoin-orange hover:bg-orange-600">
                                            <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                                        </a>
                                    </>
                                ) : step.id === currentStep ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-gray-200" />
                                        </div>
                                        <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-bitcoin-orange bg-white" aria-current="step">
                                            <span className="h-2.5 w-2.5 rounded-full bg-bitcoin-orange" aria-hidden="true" />
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-gray-200" />
                                        </div>
                                        <a href="#" className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
                                            <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                                        </a>
                                    </>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Loan Details</h1>
                                <p className="text-slate-600">
                                    Enter the amount you wish to borrow. Our loans are backed by Bitcoin with a standard 50% LTV.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount (INR)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                                            className="block w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange"
                                            min="10000"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 sm:text-sm">INR</span>
                                        </div>
                                    </div>

                                    {/* Collateral Estimate */}
                                    <div className="mt-3 bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center justify-between">
                                        <div className="flex items-center text-sm text-orange-800">
                                            <Bitcoin className="h-4 w-4 mr-1.5" />
                                            Required Collateral:
                                        </div>
                                        <div className="text-base font-bold text-bitcoin-orange">
                                            {requiredBTC.toFixed(6)} BTC
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 px-1 mt-1">
                                        <span>Based on 50% LTV</span>
                                        <span>1 BTC ≈ {formatCurrency(btcPrice)}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Loan Tenure (Months)</label>
                                    <select
                                        {...register('tenure')}
                                        className="block w-full py-3 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange"
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1} Month{i !== 0 ? 's' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-slate-500">Choose a duration between 1 and 12 months.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Loan</label>
                                    <select
                                        {...register('purpose')}
                                        className="block w-full py-3 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange"
                                    >
                                        <option value="Personal">Personal</option>
                                        <option value="Business">Business</option>
                                        <option value="Investment">Investment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={onNext}
                                    className="btn-primary flex items-center text-lg px-8 py-3"
                                >
                                    Continue <ArrowRight className="h-5 w-5 ml-2" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Collateral Required</h2>

                            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-gray-600">Required BTC Collateral</div>
                                    <div className="flex items-center text-bitcoin-orange font-bold text-xl">
                                        <Bitcoin className="h-6 w-6 mr-1" />
                                        {requiredBTC.toFixed(6)} BTC
                                    </div>
                                </div>
                                <div className="space-y-2 pt-4 border-t border-orange-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Loan Amount</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(loanAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Current BTC Price</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(btcPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">LTV Ratio</span>
                                        <span className="font-medium text-green-600">50% (Safe)</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Yearly Interest</span>
                                        <span className="font-medium text-gray-900">14% p.a.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                                <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                Note: Maintaining LTV less than 50% mitigates more risk.
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Final Review & Sign</h2>

                            <div className="space-y-4">
                                <label className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-bitcoin-orange mt-1 mr-3"
                                        {...register('agreeTerms', { required: true })}
                                    />
                                    <span className="text-sm text-gray-700">I agree to the <b className="text-gray-900">Terms & Conditions</b> and <b className="text-gray-900">Privacy Policy</b> of the platform.</span>
                                </label>

                                <label className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-bitcoin-orange mt-1 mr-3"
                                        {...register('agreeRisk', { required: true })}
                                    />
                                    <span className="text-sm text-gray-700">I understand that Bitcoin is volatile. If LTV exceeds 83.33%, my collateral may be partially liquidated.</span>
                                </label>

                                <label className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-bitcoin-orange mt-1 mr-3"
                                        {...register('agreeNBFC', { required: true })}
                                    />
                                    <span className="text-sm text-gray-700">I authorize the lending partner (NBFC) to access my credit report and process this loan application.</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Application Approved!</h2>
                            <p className="mt-2 text-gray-600">Loan ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{createdLoanId}</span></p>

                            <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <p className="text-sm font-medium text-gray-500 uppercase">Next Step</p>
                                <h3 className="text-lg font-bold text-gray-900 mt-2">Deposit Bitcoin Collateral</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Send exactly <strong>{requiredBTC.toFixed(6)} BTC</strong> to the displayed address to trigger disbursement.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/loans/${createdLoanId}`)}
                                    className="mt-4 btn-primary"
                                >
                                    View Deposit Instructions
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep < 4 && (
                        <div className="mt-8 flex justify-between">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="btn-secondary flex items-center disabled:opacity-50"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                                </button>
                            )}
                            {currentStep > 1 && currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={onNext}
                                    className="btn-primary flex items-center"
                                >
                                    Next Step <ArrowRight className="h-4 w-4 ml-2" />
                                </button>
                            ) : currentStep >= 3 ? (
                                <button
                                    type="submit"
                                    disabled={processing || !watch('agreeTerms') || !watch('agreeRisk') || !watch('agreeNBFC')}
                                    className="btn-primary flex items-center"
                                >
                                    {processing ? <Loader2 className="animate-spin h-5 w-5" /> : 'Submit Application'}
                                </button>
                            ) : null}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ApplyLoan;
