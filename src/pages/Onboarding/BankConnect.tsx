import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Building, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useStore } from '../../store';

const BankConnect = () => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
    const [statusMessage, setStatusMessage] = useState('');
    const [progress, setProgress] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const [step, setStep] = useState<'form' | 'verifying' | 'success'>('form');
    const navigate = useNavigate();
    const { addBankAccount } = useStore();

    const ifscCode = watch('ifscCode');

    // Mock Auto-detect Bank Name
    if (ifscCode && ifscCode.length >= 4) {
        const bankCode = ifscCode.substring(0, 4).toUpperCase();
        let bankName = '';
        if (bankCode === 'HDFC') bankName = 'HDFC Bank';
        else if (bankCode === 'SBIN') bankName = 'State Bank of India';
        else if (bankCode === 'ICIC') bankName = 'ICICI Bank';
        else if (bankCode.length === 4) bankName = `${bankCode} Bank (Mock)`;

        if (bankName) setValue('bankName', bankName);
    }

    const onSubmit = async (data: any) => {
        setIsVerifying(true);
        setStep('verifying');

        try {
            // Penny drop simulation - Step 1: Initiate
            setStatusMessage('Initiating Penny Drop transaction...');
            setProgress(10);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 2: Bank Server Contact
            setStatusMessage('Connecting to Bank Servers...');
            setProgress(40);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 3: Deposit
            setStatusMessage('Depositing ₹1.00 to account...');
            setProgress(70);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 4: Verification
            setStatusMessage('Verifying Beneficiary Name...');
            setProgress(90);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Finalizing
            const verifiedAccount = { ...data, id: crypto.randomUUID(), isVerified: true, userId: 'user-123' };
            addBankAccount(verifiedAccount);

            setStatusMessage('Verification Successful!');
            setProgress(100);
            await new Promise(resolve => setTimeout(resolve, 500));

            setStep('success');
            toast.success('Bank account verified via Penny Drop!');
        } catch (error) {
            toast.error('Verification failed. Please check details.');
            setStep('form');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Add Bank Account</h1>
                <p className="mt-2 text-gray-600">Link your primary bank account for future loan disbursements.</p>
            </div>

            {step !== 'success' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
                        <Building className="h-5 w-5 text-blue-700 mt-0.5 mr-2" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">Instant Verification</h4>
                            <p className="text-xs text-blue-700 mt-1">
                                We will deposit ₹1 to your account to verify ownership immediately.
                            </p>
                        </div>
                    </div>

                    {step === 'verifying' ? (
                        <div className="text-center py-12">
                            <div className="relative h-24 w-24 mx-auto mb-6">
                                {/* Animated Coin Drop Icon Concept or Spinner */}
                                <Loader2 className="h-24 w-24 text-bitcoin-orange animate-spin opacity-20 absolute" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-800">₹1</span>
                                </div>
                            </div>

                            <h3 className="mt-4 text-xl font-bold text-gray-900 animate-pulse">{statusMessage}</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6 max-w-sm mx-auto">
                                <div className="bg-bitcoin-orange h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>

                            <div className="max-w-xs mx-auto mt-8 text-left space-y-4">
                                <div className={`flex items-center ${progress >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {progress >= 10 ? <CheckCircle className="h-5 w-5 mr-2" /> : <div className="h-5 w-5 mr-2 rounded-full border-2 border-gray-300"></div>}
                                    <span className="text-sm">Initiate Transfer</span>
                                </div>
                                <div className={`flex items-center ${progress >= 40 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {progress >= 40 ? <CheckCircle className="h-5 w-5 mr-2" /> : <div className="h-5 w-5 mr-2 rounded-full border-2 border-gray-300"></div>}
                                    <span className="text-sm">Bank Communication</span>
                                </div>
                                <div className={`flex items-center ${progress >= 70 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {progress >= 70 ? <CheckCircle className="h-5 w-5 mr-2" /> : <div className="h-5 w-5 mr-2 rounded-full border-2 border-gray-300"></div>}
                                    <span className="text-sm">Penny Drop (₹1.00)</span>
                                </div>
                                <div className={`flex items-center ${progress >= 90 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {progress >= 90 ? <CheckCircle className="h-5 w-5 mr-2" /> : <div className="h-5 w-5 mr-2 rounded-full border-2 border-gray-300"></div>}
                                    <span className="text-sm">Confirm Beneficiary</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                                <input
                                    type="text"
                                    className="input-primary mt-1 text-gray-900"
                                    defaultValue="Demo User"
                                    {...register('accountHolderName', { required: 'Name is required' })}
                                />
                                {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName.message as string}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                                    <input
                                        type="password" // Masked for security feeling
                                        className="input-primary mt-1 text-gray-900"
                                        placeholder="Enter account number"
                                        {...register('accountNumber', { required: 'Account Number is required', minLength: { value: 9, message: 'Invalid length' } })}
                                    />
                                    {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber.message as string}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm Account Number</label>
                                    <input
                                        type="text"
                                        className="input-primary mt-1 text-gray-900"
                                        placeholder="Confirm account number"
                                        {...register('confirmAccount', { required: 'Required' })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                                    <input
                                        type="text"
                                        className="input-primary mt-1 uppercase placeholder:normal-case"
                                        placeholder="HDFC0001234"
                                        maxLength={11}
                                        onInput={(e) => {
                                            e.currentTarget.value = e.currentTarget.value.toUpperCase();
                                        }}
                                        {...register('ifscCode', {
                                            required: 'IFSC is required',
                                            pattern: { value: /^[A-Z]{4}[A-Z0-9]{7}$/, message: 'Invalid IFSC format' }
                                        })}
                                    />
                                    {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode.message as string}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                    <input
                                        type="text"
                                        className="input-primary mt-1 bg-gray-50 text-gray-900"
                                        placeholder="Auto-detected from IFSC"
                                        readOnly
                                        {...register('bankName', { required: 'Bank Name is required' })}
                                    />
                                    {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName.message as string}</p>}
                                </div>
                            </div>

                            {/* Hidden mock verification button override */}
                            <div className="pt-4">
                                <button type="submit" disabled={isVerifying} className="btn-primary w-full flex justify-center items-center">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Verify Account
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {step === 'success' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Bank Account Verified!</h2>
                    <p className="text-gray-600 mt-2">
                        Your account ending in <span className="font-mono font-medium">XXXX</span> has been successfully linked.
                    </p>
                    <div className="mt-8">
                        <button onClick={() => navigate('/dashboard')} className="btn-primary">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankConnect;
