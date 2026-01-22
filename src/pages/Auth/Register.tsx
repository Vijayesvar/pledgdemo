import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { mockApi } from '../../api/mock';
import pledgIcon from '../../assets/pledg-icon.png';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const pwd = watch('password');

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await mockApi.register(data.email);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error: any) {
            toast.error('Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex justify-center mb-6">
                <img src={pledgIcon} alt="Pledg" className="h-12 w-12 object-contain" />
            </div>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            type="password"
                            className="input-primary"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Min 8 characters' }
                            })}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="confirmPassword"
                            type="password"
                            className="input-primary"
                            {...register('confirmPassword', {
                                required: 'Please confirm password',
                                validate: value => value === pwd || "Passwords do not match"
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message as string}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="terms"
                        type="checkbox"
                        className="h-4 w-4 text-bitcoin-orange focus:ring-bitcoin-orange border-gray-300 rounded"
                        {...register('terms', { required: 'You must accept the terms' })}
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                        I agree to the <a href="#" className="text-bitcoin-orange hover:text-orange-500">Terms</a> and <a href="#" className="text-bitcoin-orange hover:text-orange-500">Privacy Policy</a>
                    </label>
                </div>
                {errors.terms && (
                    <p className="mt-1 text-sm text-red-600">{errors.terms.message as string}</p>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bitcoin-orange hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin-orange disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                    </div>
                </div>
                <div className="mt-6 flex justify-center text-sm">
                    <Link to="/login" className="font-medium text-bitcoin-orange hover:text-orange-500">
                        Sign in
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Register;
