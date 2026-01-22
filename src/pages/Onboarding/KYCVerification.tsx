import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, Loader2, FileText } from 'lucide-react';
import { useStore } from '../../store';
import { mockApi } from '../../api/mock';
import { toast } from 'react-toastify';


const KYCVerification = () => {
    const navigate = useNavigate();
    const { updateUser } = useStore();
    const [step, setStep] = useState(1); // 1: Upload, 2: Verifying, 3: Success
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    const [panFile, setPanFile] = useState<File | null>(null);
    const [verificationStatus, setVerificationStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhaar' | 'pan') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            if (type === 'aadhaar') setAadhaarFile(file);
            else setPanFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!aadhaarFile || !panFile) {
            toast.error('Please upload both documents');
            return;
        }

        setIsUploading(true);
        setStep(2);

        try {
            // Step 1: Uploading
            setVerificationStatus('Securely uploading documents...');
            setProgress(10);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 2: OCR Scanning
            setVerificationStatus('Scanning documents (OCR)...');
            setProgress(40);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 3: Face Match
            setVerificationStatus('Verifying face match with ID...');
            setProgress(70);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 4: Validating UID
            setVerificationStatus('Validating with UIDAI database...');
            setProgress(90);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Finalizing
            updateUser({
                kycStatus: 'verified',
                kycVerified: true,
                name: 'Demo User'
            });

            setProgress(100);
            await new Promise(resolve => setTimeout(resolve, 500));
            setStep(3);
            toast.success('KYC Verified Successfully!');
        } catch (error) {
            toast.error('Verification failed. Please try again.');
            setStep(1);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
                <p className="mt-2 text-gray-600">Complete your KYC to start borrowing against your Bitcoin.</p>
            </div>

            {step === 1 && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileText className="h-5 w-5 text-bitcoin-orange mr-2" />
                            Aadhaar Card (Front)
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-bitcoin-orange transition-colors">
                            {aadhaarFile ? (
                                <div className="flex items-center justify-center text-green-600">
                                    <CheckCircle className="h-6 w-6 mr-2" />
                                    <span className="font-medium">{aadhaarFile.name}</span>
                                    <button onClick={() => setAadhaarFile(null)} className="ml-4 text-sm text-red-500 hover:text-red-700">Remove</button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="aadhaar-upload" className="relative cursor-pointer rounded-md font-medium text-bitcoin-orange hover:text-orange-500">
                                            <span>Upload a file</span>
                                            <input id="aadhaar-upload" name="aadhaar-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'aadhaar')} accept="image/*,.pdf" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <FileText className="h-5 w-5 text-bitcoin-orange mr-2" />
                            PAN Card
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-bitcoin-orange transition-colors">
                            {panFile ? (
                                <div className="flex items-center justify-center text-green-600">
                                    <CheckCircle className="h-6 w-6 mr-2" />
                                    <span className="font-medium">{panFile.name}</span>
                                    <button onClick={() => setPanFile(null)} className="ml-4 text-sm text-red-500 hover:text-red-700">Remove</button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="pan-upload" className="relative cursor-pointer rounded-md font-medium text-bitcoin-orange hover:text-orange-500">
                                            <span>Upload a file</span>
                                            <input id="pan-upload" name="pan-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'pan')} accept="image/*,.pdf" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={!aadhaarFile || !panFile || isUploading}
                            className="btn-primary w-full sm:w-auto"
                        >
                            Verify Documents
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="text-center py-12 px-4">
                    <div className="relative h-32 w-32 mx-auto mb-8">
                        {/* Central Icon changing based on progress could be cool, but keep it simple with spinner for now */}
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-bitcoin-orange rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-bitcoin-orange">{progress}%</span>
                        </div>
                    </div>

                    <h3 className="mt-4 text-xl font-bold text-gray-900 animate-pulse">{verificationStatus}</h3>
                    <p className="mt-2 text-gray-500">Please do not close this window.</p>

                    <div className="max-w-md mx-auto mt-8 space-y-4">
                        {/* Detailed steps visualization */}
                        <div className={`flex items-center space-x-3 ${progress >= 10 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`h-2 w-2 rounded-full ${progress >= 10 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm font-medium">Document Upload</span>
                        </div>
                        <div className={`flex items-center space-x-3 ${progress >= 40 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`h-2 w-2 rounded-full ${progress >= 40 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm font-medium">Optical Character Recognition (OCR)</span>
                        </div>
                        <div className={`flex items-center space-x-3 ${progress >= 70 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`h-2 w-2 rounded-full ${progress >= 70 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm font-medium">Biometric Face Match</span>
                        </div>
                        <div className={`flex items-center space-x-3 ${progress >= 90 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`h-2 w-2 rounded-full ${progress >= 90 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm font-medium">UIDAI Database Check</span>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-gray-900">KYC Verified!</h3>
                    <p className="mt-2 text-gray-500">Your identity has been verified successfully.</p>

                    <div className="mt-8 bg-gray-50 p-4 rounded-lg text-left max-w-sm mx-auto">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Extracted Details</h4>
                        <p className="text-sm"><strong>Name:</strong> Demo User</p>
                        <p className="text-sm"><strong>PAN:</strong> ABCDE1234F</p>
                        <p className="text-sm"><strong>Aadhaar:</strong> XXXX XXXX 1234</p>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/bank-accounts')}
                            className="btn-primary"
                        >
                            Continue to Add Bank
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KYCVerification;
