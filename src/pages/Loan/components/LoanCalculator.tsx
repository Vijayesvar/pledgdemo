import { useState, useEffect } from 'react';
import { Bitcoin, Info, ShieldCheck, ExternalLink } from 'lucide-react';
import { useStore } from '../../../store';
import { cn } from '../../../lib/utils';

interface LoanCalculatorProps {
    loanAmount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLoanAmount?: (amount: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onLoanAmountChange?: (amount: number) => void;
    btcPrice?: number;
}

const LoanCalculator = ({ loanAmount, setLoanAmount, onLoanAmountChange, btcPrice: propBtcPrice }: LoanCalculatorProps) => {
    const { btcPrice: storeBtcPrice } = useStore();
    const btcPrice = propBtcPrice || storeBtcPrice;

    // Helper to handle change regardless of which prop is passed
    const updateAmount = (val: number) => {
        if (setLoanAmount) setLoanAmount(val);
        if (onLoanAmountChange) onLoanAmountChange(val);
    };
    const [collateralBTC, setCollateralBTC] = useState<string>("");
    const [activeInput, setActiveInput] = useState<'loan' | 'collateral'>('loan');
    // Local state to manage input display (allows clearing field)
    const [loanInput, setLoanInput] = useState(loanAmount.toString());

    const LTV_RATIO = 0.5; // 50%
    const INTEREST_RATE = 14.00;
    const ADMIN_FEE_PERCENT = 2.00;
    const MIN_ADMIN_FEE = 25 * 87; // Approx 25 USD in INR

    // Sync local input with prop changes if they differ
    useEffect(() => {
        if (Number(loanInput) !== loanAmount) {
            setLoanInput(loanAmount.toString());
        }
    }, [loanAmount]);

    // Calculate derived values
    useEffect(() => {
        if (activeInput === 'loan') {
            const requiredCollateral = loanAmount / (btcPrice * LTV_RATIO);
            setCollateralBTC(requiredCollateral.toFixed(6));
        }
    }, [loanAmount, btcPrice, activeInput]);

    const handleCollateralChange = (val: string) => {
        setCollateralBTC(val);
        setActiveInput('collateral');
        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
            const newLoanAmount = numVal * btcPrice * LTV_RATIO;
            const roundedAmt = Math.round(newLoanAmount);
            const limitedAmt = Math.min(roundedAmt, 100000000);
            updateAmount(limitedAmt);
        }
    };

    const handleLoanChange = (val: string) => {
        setLoanInput(val);
        setActiveInput('loan');

        let numVal = parseInt(val, 10);
        if (isNaN(numVal)) numVal = 0;

        const limitedVal = Math.min(numVal, 100000000); // Limit to 1 Crore

        // If the limit kicked in, update the input text to match user reality
        if (limitedVal !== numVal && numVal > 100000000) {
            setLoanInput(limitedVal.toString());
        }

        updateAmount(limitedVal);
    };

    const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left Column: Inputs */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-700">Loan amount</label>
                                <span className="text-xs font-medium text-slate-500">Funded in INR</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={loanInput}
                                    onChange={(e) => handleLoanChange(e.target.value)}
                                    max={100000000}
                                    className="block w-full pl-4 pr-16 py-3 text-lg font-medium text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-all shadow-sm"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-slate-500 font-semibold">INR 🇮🇳</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-700">Collateral</label>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={collateralBTC}
                                    onChange={(e) => handleCollateralChange(e.target.value)}
                                    className="block w-full pl-4 pr-16 py-3 text-lg font-medium text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-bitcoin-orange focus:border-bitcoin-orange transition-all shadow-sm"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-slate-500 font-semibold mr-2">BTC</span>
                                    <Bitcoin className="h-5 w-5 text-bitcoin-orange" />
                                </div>
                            </div>
                        </div>

                        {/* Security Banner */}
                        <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 flex items-start space-x-4">
                            <div className="bg-white p-2 rounded-full shadow-sm flex-shrink-0">
                                <ShieldCheck className="h-5 w-5 text-sky-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Security first, always.</h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    Your collateral is held securely in custody with BitGo or our trusted partners — never lent out to earn interest. We don't take risks with your assets just to offer a lower rate.
                                </p>
                                <a href="#" className="inline-flex items-center text-xs font-semibold text-sky-700 mt-2 hover:text-sky-800 hover:underline">
                                    How Pledg keeps your collateral safe <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calculations */}
                    <div className="border-l border-slate-100 md:pl-12 space-y-6">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Loan amount</div>
                            <div className="text-3xl font-bold text-slate-900">{formatINR(loanAmount)}</div>
                            <div className="text-sm text-slate-500 mt-1">Funded in INR.</div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Collateral</div>
                            <div className="text-3xl font-bold text-slate-900 flex items-baseline">
                                {collateralBTC} <span className="text-lg text-slate-500 ml-2 font-medium">BTC</span>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">Amount required once your loan is approved.</div>
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Finance charge</div>
                            <div className="text-3xl font-bold text-slate-900">Starting from 14%</div>
                            <div className="text-sm text-slate-500 mt-1 leading-relaxed">
                                Transparent pricing designed for long-term holding. No hidden fees or prepayment penalties.
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                Initial loan-to-value (LTV)
                                <Info className="h-3 w-3 ml-1 cursor-help" />
                            </div>
                            <div className="text-3xl font-bold text-green-600">50%</div>
                            <div className="text-sm text-slate-500 mt-1">
                                Margin call LTV: <span className="text-orange-600 font-medium">70%</span> • Liquidation LTV: <span className="text-red-600 font-medium">83%</span>
                                <a href="#" className="inline-flex items-center ml-2 text-sky-600 hover:underline">
                                    Learn more <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanCalculator;
