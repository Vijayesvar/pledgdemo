import { useStore } from '../../store';
import { Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const PortfolioSummary = () => {
    const { loans, btcPrice } = useStore();

    const activeLoans = loans.filter(l => l.status === 'active');
    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalCollateral = activeLoans.reduce((sum, loan) => sum + loan.btcCollateral, 0);
    const collateralValue = totalCollateral * btcPrice;

    const weightedLTV = collateralValue > 0 ? (totalLoanAmount / collateralValue) * 100 : 0;



    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center">
                <div className="p-3 bg-gray-50 rounded-lg mr-4">
                    <Wallet className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Active Loans</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalLoanAmount)}</h3>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center">
                <div className="p-3 bg-orange-50 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-bitcoin-orange" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Collateral Value</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(collateralValue)}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{totalCollateral.toFixed(6)} BTC</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${weightedLTV > 70 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <AlertTriangle className={`h-6 w-6 ${weightedLTV > 70 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Portfolio LTV</p>
                    <h3 className={`text-2xl font-bold ${weightedLTV > 70 ? 'text-red-600' : 'text-green-600'}`}>
                        {weightedLTV.toFixed(2)}%
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Safe Limit: 70%</p>
                </div>
            </div>
        </div>
    );
};

export default PortfolioSummary;
