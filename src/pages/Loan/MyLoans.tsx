import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import type { Loan } from '../../types';
import { Plus, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';

const MyLoans = () => {
    const { loans, btcPrice } = useStore();

    const getLTVColor = (loan: Loan, currentPrice: number) => {
        const collateralVal = loan.btcCollateral * currentPrice;
        const ltv = (loan.amount / collateralVal) * 100;

        if (ltv <= 50) return 'bg-green-100 text-green-800';
        if (ltv <= 71.59) return 'bg-yellow-100 text-yellow-800';
        if (ltv <= 83.32) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">My Loans</h1>
                    <p className="mt-1 text-gray-400">Manage your active and past loans.</p>
                </div>
                <Link to="/loans/apply" className="btn-primary flex items-center">
                    <Plus className="h-4 w-4 mr-1.5" />
                    New Loan
                </Link>
            </div>

            {/* Loan List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loans.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No loans found.</p>
                        <Link to="/loans/apply" className="mt-4 btn-primary inline-flex">Apply Now</Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collateral</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LTV</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loans.map((loan) => {
                                    const collateralValue = loan.btcCollateral * btcPrice;
                                    const currentLTV = (loan.amount / collateralValue) * 100;

                                    return (
                                        <tr key={loan.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatINR(loan.amount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.btcCollateral.toFixed(4)} BTC</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {loan.status === 'active' || loan.status === 'pending' ? (
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLTVColor(loan, btcPrice)}`}>
                                                        {currentLTV.toFixed(2)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}

                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {loan.status === 'active' && <Clock className="h-4 w-4 text-green-500 mr-1.5" />}
                                                    {loan.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500 mr-1.5" />}
                                                    {loan.status === 'closed' && <CheckCircle className="h-4 w-4 text-gray-500 mr-1.5" />}
                                                    {loan.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500 mr-1.5" />}
                                                    <span className="text-sm text-gray-700 capitalize">{loan.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/loans/${loan.id}`} className="text-bitcoin-orange hover:text-orange-900 flex items-center justify-end">
                                                    View <ArrowRight className="h-4 w-4 ml-1" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLoans;
