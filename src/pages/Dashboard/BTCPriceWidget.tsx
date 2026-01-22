import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { useStore } from '../../store';
import { mockApi } from '../../api/mock';

const BTCPriceWidget = () => {
    const { btcPrice, setBTCPrice } = useStore();
    const [change24h, setChange24h] = useState(2.5); // Mock change
    const [isRefreshing, setIsRefreshing] = useState(false);

    const formatINR = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const fetchPrice = async () => {
        setIsRefreshing(true);
        try {
            const price = await mockApi.fetchBTCPrice();
            setBTCPrice(price);
            // Simulate random change
            setChange24h(prev => prev + (Math.random() * 0.4 - 0.2));
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchPrice, 30000); // 30s update
        fetchPrice(); // Initial fetch
        return () => clearInterval(interval);
    }, []);

    const isPositive = change24h >= 0;

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden h-full min-h-[140px]">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 p-4 opacity-5 pointer-events-none">
                <svg className="h-32 w-32 text-bitcoin-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.24 14.9.358c6.43 1.605 10.341 8.115 8.738 14.548v-.002zm-16.088-6.724c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4z" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bitcoin Price (INR)</p>
                        <h2 className="text-2xl font-bold mt-1 text-gray-900">{formatINR(btcPrice)}</h2>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        <span className="text-xs font-bold">{Math.abs(change24h).toFixed(2)}%</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-400 flex items-center">
                        <div className={`h-1.5 w-1.5 rounded-full mr-2 ${isRefreshing ? 'bg-bitcoin-orange animate-pulse' : 'bg-green-500'}`}></div>
                        Live Updates
                    </div>
                    <button
                        onClick={fetchPrice}
                        className={`text-gray-400 hover:text-gray-600 transition-all p-1.5 rounded-full hover:bg-gray-50 ${isRefreshing ? 'animate-spin' : ''}`}
                        title="Refresh Price"
                    >
                        <RefreshCcw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BTCPriceWidget;
