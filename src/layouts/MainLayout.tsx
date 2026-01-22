import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    History,
    LogOut
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import NotificationCenter from '../components/NotificationCenter';
import pledgIcon from '../assets/pledg-icon.png';

const MainLayout = () => {
    const location = useLocation();
    const { logout, user, fetchBTCPrice } = useStore();

    useEffect(() => {
        fetchBTCPrice();
        // Refresh BTC price every 60 seconds
        const interval = setInterval(() => {
            fetchBTCPrice();
        }, 60000);
        return () => clearInterval(interval);
    }, [fetchBTCPrice]);

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Loans', href: '/loans', icon: Wallet },
        { name: 'Transactions', href: '/transactions', icon: History },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Mobile sidebar placeholder */}

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-slate-100 mt-2">
                        <div className="flex items-center group cursor-pointer transition-opacity hover:opacity-90">
                            <img src={pledgIcon} alt="Pledg" className="h-10 w-10 object-contain" />
                            <span className="ml-3 text-xl font-bold text-slate-900 tracking-tight">Pledg</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col overflow-y-auto pt-6 px-4">
                        <nav className="flex-1 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            isActive
                                                ? 'bg-bitcoin-orange/10 text-bitcoin-orange font-semibold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                isActive ? 'text-bitcoin-orange' : 'text-slate-400 group-hover:text-slate-600',
                                                'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="flex-shrink-0 flex border-t border-slate-100 p-4 mt-auto mb-2">
                            <button
                                onClick={() => logout()}
                                className="flex-shrink-0 w-full group block bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-all border border-slate-200 hover:border-slate-300 shadow-sm"
                            >
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold border border-slate-300">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="ml-3 text-left overflow-hidden">
                                        <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                                            {user?.name || 'User'}
                                        </p>
                                        <div className="text-xs font-medium text-slate-500 group-hover:text-slate-600 flex items-center mt-0.5 transition-colors">
                                            <LogOut className="h-3 w-3 mr-1" /> Logout
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:pl-64 flex flex-col flex-1">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-end px-8 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center space-x-6">
                        <NotificationCenter />
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden bg-slate-50">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
