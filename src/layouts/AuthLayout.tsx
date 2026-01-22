import { Outlet } from 'react-router-dom';
import pledgIcon from '../assets/pledg-icon.png';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/95 to-brand-dark"></div>
            </div>

            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-20 w-20 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(247,147,26,0.2)]">
                        <img src={pledgIcon} alt="Pledg" className="h-12 w-12 object-contain" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
                        Pledg
                    </h2>
                    <p className="mt-2 text-sm text-gray-400 font-medium tracking-wide uppercase">
                        India's first Bitcoin backed lending platform
                    </p>
                </div>

                {/* Form Container */}
                <div className="w-full bg-gray-900/40 backdrop-blur-xl py-8 px-6 shadow-2xl border border-white/10 rounded-2xl sm:px-10 ring-1 ring-white/5">
                    <Outlet />
                </div>
            </div>

            {/* Footer Text */}
            <div className="mt-8 text-center text-xs text-gray-500 relative z-10">
                &copy; 2026 Pledg Financial Services. All rights reserved.
            </div>
        </div>
    );
};

export default AuthLayout;
