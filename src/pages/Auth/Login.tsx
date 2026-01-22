import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { useStore } from '../../store';
import { mockApi } from '../../api/mock';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const login = useStore(state => state.login);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const user = await mockApi.login(data.email, data.password);
            login(user);
            toast.success('Logged in successfully');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="input-primary"
                            {...register('email', { required: 'Email is required' })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-bitcoin-orange hover:text-orange-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                    <div className="mt-1">
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            className="input-primary"
                            {...register('password', { required: 'Password is required' })}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-bitcoin-orange focus:ring-bitcoin-orange border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                            Remember me
                        </label>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex justify-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-brand-dark text-gray-400">Demo Credentials</span>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                        <div className="mb-2">
                            Email: <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-gray-200">demo@pledg.in</span>
                        </div>
                        <div>
                            Password: <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-gray-200">demo1234</span>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default Login;
