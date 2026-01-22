import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useStore } from '../../store';
import { formatCurrency } from '../../lib/utils';
import type { Loan } from '../../types';

const ActiveLoans = () => {
    const { loans, btcPrice } = useStore();
    const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'pending');

    const getLTVColor = (loan: Loan, currentPrice: number) => {
        const collateralVal = loan.btcCollateral * currentPrice;
        const ltv = (loan.amount / collateralVal) * 100;

        if (ltv <= 50) return 'bg-green-100 text-green-800';
        if (ltv <= 71.59) return 'bg-yellow-100 text-yellow-800';
        if (ltv <= 83.32) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const getLTVStatus = (ltv: number) => {
        if (ltv <= 50) return 'Safe';
        if (ltv <= 71.59) return 'Monitor';
        if (ltv <= 83.32) return 'Margin Call';
        return 'Liquidation Risk';
    };

    // formatINR definition removed as we use global utility

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-6">
                <button className="text-sm font-bold text-teal-900 border-b-2 border-teal-900 pb-4 -mb-4.5 z-10">
                    Active <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{activeLoans.length}</span>
                </button>
                <button className="text-sm font-medium text-gray-500 pb-4 cursor-not-allowed">
                    Closed
                </button>
            </div>

            {activeLoans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No Active Loans</h3>
                    <p className="mt-1 text-sm text-gray-500">You don't have any active loans yet.</p>
                    <div className="mt-6">
                        <Link to="/loans/apply" className="bg-bitcoin-orange hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm">
                            Apply for a Loan
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loan ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Collateral</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">LTV</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeLoans.map((loan) => {
                                const collateralValue = loan.btcCollateral * btcPrice;
                                const currentLTV = (loan.amount / collateralValue) * 100;

                                return (
                                    <tr key={loan.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 line-clamp-1 max-w-[100px]" title={loan.id}>{loan.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(loan.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.btcCollateral.toFixed(4)} BTC</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLTVColor(loan, btcPrice)}`}>
                                                {currentLTV.toFixed(2)}% ({getLTVStatus(currentLTV)})
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{loan.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/loans/${loan.id}`} className="text-bitcoin-orange hover:text-orange-900 font-semibold">Manage</Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ActiveLoans;
