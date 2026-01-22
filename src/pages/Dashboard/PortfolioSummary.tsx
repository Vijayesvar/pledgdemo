import { useStore } from '../../store';
import { Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

const PortfolioSummary = () => {
    const { loans, btcPrice } = useStore();

    const activeLoans = loans.filter(l => l.status === 'active');
    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalCollateral = activeLoans.reduce((sum, loan) => sum + loan.btcCollateral, 0);
    const collateralValue = totalCollateral * btcPrice;

    const weightedLTV = collateralValue > 0 ? (totalLoanAmount / collateralValue) * 100 : 0;



    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full min-h-[140px]">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Active Loans</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalLoanAmount)}</h3>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <Wallet className="h-5 w-5 text-gray-700" />
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                    {activeLoans.length} active loan{activeLoans.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full min-h-[140px]">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Collateral Value</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(collateralValue)}</h3>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-bitcoin-orange" />
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                    {totalCollateral.toFixed(6)} BTC locked
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full min-h-[140px]">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Portfolio LTV</p>
                        <h3 className={cn("text-2xl font-bold mt-1", weightedLTV > 70 ? 'text-red-600' : 'text-green-600')}>
                            {weightedLTV.toFixed(2)}%
                        </h3>
                    </div>
                    <div className={cn("p-2 rounded-lg", weightedLTV > 70 ? 'bg-red-50' : 'bg-green-50')}>
                        <AlertTriangle className={cn("h-5 w-5", weightedLTV > 70 ? 'text-red-600' : 'text-green-600')} />
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                    Safe Limit: 70%
                </div>
            </div>
        </div>
    );
};

export default PortfolioSummary;
