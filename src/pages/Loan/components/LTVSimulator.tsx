import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useStore } from '../../../store';
import { cn } from '../../../lib/utils';

interface LTVSimulatorProps {
    currentBTCPrice?: number;
    loanAmount?: number;
    collateralBTC?: number;
}

const LTVSimulator = ({ currentBTCPrice }: LTVSimulatorProps) => {
    const { btcPrice: storeBtcPrice } = useStore();
    // Use passed price or store price
    const btcPrice = currentBTCPrice || storeBtcPrice;

    const [simulatedPrice, setSimulatedPrice] = useState(btcPrice);
    const [ltv, setLtv] = useState(50);

    // Initial LTV calculation based on 50% start
    const INITIAL_LTV = 50;

    useEffect(() => {
        setSimulatedPrice(btcPrice);
    }, [btcPrice]);

    const handlePriceChange = (newPrice: number) => {
        setSimulatedPrice(newPrice);
        // Calculate new LTV based on price change
        // Formula: New LTV = Initial LTV * (Initial Price / New Price)
        const newLtv = INITIAL_LTV * (btcPrice / newPrice);
        setLtv(Math.min(Math.max(newLtv, 10), 83)); // Clamp between 10% and 83%
    };

    const handleLtvChange = (newLtv: number) => {
        setLtv(newLtv);
        // Calculate price needed for this LTV
        // Formula: New Price = Initial Price * (Initial LTV / New LTV)
        const newPrice = btcPrice * (INITIAL_LTV / newLtv);
        setSimulatedPrice(newPrice);
    };

    const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const getStatusColor = (currentLtv: number) => {
        if (currentLtv < 65) return 'text-green-600';
        if (currentLtv < 83) return 'text-orange-500';
        return 'text-red-600';
    };

    const getStatusBg = (currentLtv: number) => {
        if (currentLtv < 65) return 'bg-green-50 border-green-100';
        if (currentLtv < 83) return 'bg-orange-50 border-orange-100';
        return 'bg-red-50 border-red-100';
    };

    return (
        <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-900">Loan-to-Value (LTV) simulator</h3>
            <p className="text-slate-600 mt-2 mb-8">
                Learn how the future market price of BTC would impact a new loan, and discover features to achieve the best outcomes.
            </p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-10">
                        {/* BTC Price Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <span className="text-sm font-bold text-slate-900">BTC price</span>
                                    <Info className="h-3.5 w-3.5 text-slate-400 ml-1.5 cursor-help" />
                                </div>
                                <div className="text-xs text-slate-500">
                                    Approximate BTC price: {formatINR(btcPrice)}
                                </div>
                            </div>

                            <div className="relative pt-6 pb-2">
                                <div className="flex justify-between text-xs text-slate-400 absolute w-full -top-1">
                                    <span>≤{formatINR(btcPrice * 0.5)}</span>
                                    <span>≥{formatINR(btcPrice * 1.5)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={btcPrice * 0.4}
                                    max={btcPrice * 1.6}
                                    step={btcPrice * 0.01}
                                    value={simulatedPrice}
                                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                />
                                <div className="mt-2 text-right">
                                    <span className="inline-block px-3 py-1 bg-white border border-slate-300 rounded text-sm font-bold text-slate-900 shadow-sm">
                                        {formatINR(simulatedPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* LTV Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <span className="text-sm font-bold text-slate-900">LTV</span>
                                    <Info className="h-3.5 w-3.5 text-slate-400 ml-1.5 cursor-help" />
                                </div>
                            </div>

                            <div className="relative pt-6 pb-2">
                                <div className="flex justify-between text-xs text-slate-400 absolute w-full -top-1 px-1">
                                    <span>≤10%</span>
                                    <span className="left-[55%] transform -translate-x-1/2 absolute">50%</span>
                                    <span className="left-[82%] transform -translate-x-1/2 absolute text-orange-400 font-medium">70%</span>
                                    <span className="right-0 absolute text-red-500 font-bold">83%</span>
                                </div>
                                {/* Track Markers */}
                                <div className="absolute top-7 w-full h-2 pointer-events-none z-0">
                                    <div className="absolute left-[82%] w-2 h-2 rounded-full bg-orange-200 -mt-0 transform -translate-x-1/2"></div>
                                </div>

                                <input
                                    type="range"
                                    min="10"
                                    max="83"
                                    step="0.5"
                                    value={ltv}
                                    onChange={(e) => handleLtvChange(Number(e.target.value))}
                                    className={cn(
                                        "w-full h-2 rounded-lg appearance-none cursor-pointer relative z-10",
                                        ltv < 70 ? "bg-slate-200 accent-slate-900" :
                                            ltv < 83 ? "bg-orange-100 accent-orange-500" : "bg-red-100 accent-red-600"
                                    )}
                                />
                                <div className="mt-2 text-right">
                                    <span className="inline-block px-3 py-1 bg-white border border-slate-300 rounded text-sm font-bold text-slate-900 shadow-sm">
                                        {ltv.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Feedback */}
                    <div className="flex flex-col h-full">
                        <div className={cn("border rounded-xl p-6 transition-colors duration-300 flex-1 flex flex-col justify-center", getStatusBg(ltv))}>
                            <h4 className={cn("text-lg font-bold mb-2", getStatusColor(ltv))}>
                                {ltv < 55 ? "Healthy, starting LTV" :
                                    ltv < 70 ? "Moderate Risk" :
                                        ltv < 83 ? "Margin Call Risk" : "Liquidation Risk"}
                            </h4>
                            <p className="text-slate-700 text-sm leading-relaxed">
                                {ltv < 55 ? "Loans start at 50% LTV. BTC market price and finance charges will make your LTV fluctuate." :
                                    ltv < 70 ? "Your LTV is rising. If it hits 70%, you'll receive a margin call." :
                                        ltv < 83 ? "Warning: At 70% LTV, you will be asked to add collateral or repay part of the loan." :
                                            "Critical: At 83% LTV, a portion of your collateral will be sold to reduce risk."}
                            </p>
                        </div>

                        <div className="mt-4 bg-sky-50 rounded-xl p-4 flex items-center shadow-sm">
                            <div className="bg-sky-100 p-2 rounded-full mr-3">
                                <Info className="h-4 w-4 text-sky-600" />
                            </div>
                            <p className="text-sm text-sky-800 font-medium">
                                Enable <span className="underline cursor-pointer hover:text-sky-900">auto top-up</span> to help protect your loan.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-xs text-slate-400 leading-snug">
                    Your LTV is affected by BTC price and the finance charges on your loan. As daily interest is added to your loan the LTV will change - the simulator should be only used for estimation purposes.
                </div>
            </div>
        </div>
    );
};

export default LTVSimulator;
