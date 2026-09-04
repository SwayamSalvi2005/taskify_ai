import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmail as verifyEmailApi } from '../api/authApi';

const VerifyEmail = () => {
     // searchParams: Object containing URL query parameters
    // Example: ?token=abc123 → searchParams.get('token') = 'abc123'
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verifying your email...');

    //Verify email when component mounts
    useEffect(() => {
        const verify = async () => {
                // Step 1: Check if token exists in URL
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }   
             // Step 2== Call API to verify token
            try {
                const res = await verifyEmailApi(token);
                const data = res.data;

                if (data.success) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed. Link may be expired.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Server error. Please try again later.');
            }
        };

        verify();
    }, [token]); // Re-run if token changes

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
                
                {status === 'loading' && (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-xl font-bold text-white mb-2">Verifying Email</h2>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                        <p className="text-gray-300 mb-6">{message}</p>
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                        <p className="text-gray-300 mb-6">{message}</p>
                        <Link to="/register" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full">
                            Back to Register
                        </Link>
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default VerifyEmail;
