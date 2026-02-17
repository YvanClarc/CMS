import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Mail, Clock } from 'lucide-react';
import type { SharedData } from '@/types';

interface Props {
    isVerified?: boolean;
}

export default function VerifyEmailPage({ isVerified: initialIsVerified }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [isVerified, setIsVerified] = useState(initialIsVerified || false);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSendCode = async () => {
        setSending(true);
        try {
            const response = await fetch('/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setCodeSent(true);
                setCountdown(60);
                setMessage({ type: 'success', text: 'Verification code sent to your email!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to send verification code' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (verificationCode.length !== 6) {
            setMessage({ type: 'error', text: 'Please enter a 6-digit code' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/verify-email-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ verification_code: verificationCode }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsVerified(true);
                setVerificationCode('');
                setMessage({ type: 'success', text: 'Email verified successfully!' });
                setTimeout(() => {
                    router.visit('/dashboard');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to verify email' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setSending(true);
        try {
            const response = await fetch('/resend-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setCountdown(60);
                setMessage({ type: 'success', text: 'New verification code sent!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to resend code' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    if (isVerified) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                    <div className="w-full max-w-md text-center">
                        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Email Verified</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Your email has been successfully verified.
                        </p>
                        <Button onClick={() => router.visit('/dashboard')} className="mt-6 w-full">
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <div className="flex h-full flex-1 flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <Mail className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verify Your Email</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Please verify your email address to continue.
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                            Email: <span className="font-medium">{auth.user.email}</span>
                        </p>
                    </div>

                    {/* Messages */}
                    {message && (
                        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' : 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'}>
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                            <AlertDescription className={message.type === 'success' ? 'text-green-800 dark:text-green-200 ml-3 font-medium' : 'text-red-800 dark:text-red-200 ml-3 font-medium'}>
                                {message.text}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Step 1: Send Code */}
                    {!codeSent ? (
                        <div className="space-y-4">
                            <p className="text-center text-slate-600 dark:text-slate-400">
                                Click the button below to send a verification code to your email.
                            </p>
                            <Button
                                onClick={handleSendCode}
                                disabled={sending}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                {sending ? 'Sending...' : 'Send Verification Code'}
                            </Button>
                        </div>
                    ) : (
                        /* Step 2: Enter Code */
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    6-Digit Verification Code
                                </label>
                                <Input
                                    type="text"
                                    placeholder="000000"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setVerificationCode(val);
                                    }}
                                    maxLength={6}
                                    className="text-center text-2xl letter-spacing tracking-widest font-mono"
                                    autoFocus
                                />
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    Enter the 6-digit code sent to your email. The code will expire in 10 minutes.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    Didn't receive the code?
                                </p>
                                <Button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={sending || countdown > 0}
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    {countdown > 0 ? (
                                        <>
                                            <Clock className="w-4 h-4 mr-2" />
                                            Resend in {countdown}s
                                        </>
                                    ) : (
                                        'Resend Code'
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
