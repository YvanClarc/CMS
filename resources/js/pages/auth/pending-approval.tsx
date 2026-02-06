import { Head, Link, router } from '@inertiajs/react';
import { Mail, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PendingApproval() {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
            <Head title="Account Pending Approval" />
            
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 space-y-8 border border-slate-200 dark:border-slate-700">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full p-4">
                                <Clock className="text-white" size={40} />
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Account Pending Approval
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Your account has been registered successfully
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {/* Info Box */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-2">
                            <div className="flex gap-3">
                                <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                                        Waiting for Approval
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        Our admin team is reviewing your account. This typically takes 24-48 hours.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Mail size={18} className="text-slate-500 dark:text-slate-400" />
                                What happens next?
                            </h3>
                            <ol className="space-y-2">
                                <li className="flex gap-3 text-sm">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold text-xs flex-shrink-0">
                                        1
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400 pt-0.5">
                                        Admin reviews your registration details
                                    </span>
                                </li>
                                <li className="flex gap-3 text-sm">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold text-xs flex-shrink-0">
                                        2
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400 pt-0.5">
                                        You'll receive an email notification when approved
                                    </span>
                                </li>
                                <li className="flex gap-3 text-sm">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold text-xs flex-shrink-0">
                                        3
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400 pt-0.5">
                                        You can log in and start using the platform
                                    </span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            <span className="font-semibold">Note:</span> Your account cannot be used until approved by an admin.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleLogout}
                            className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Log Out
                        </Button>
                        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                            Questions?{' '}
                            <a href="mailto:support@example.com" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-slate-400">
                        © 2026 Your Platform. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
