import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Legal Case Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
                                    ⚖️
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    LegalCase
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-500 transition"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-500 transition"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                            <div className="flex flex-col justify-center">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                                    Manage Your Legal Cases
                                    <span className="block text-blue-600 dark:text-blue-400">with Confidence</span>
                                </h1>
                                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8">
                                    A comprehensive platform for lawyers, clients, and administrators to collaborate efficiently on legal cases with secure document management and real-time communication.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {!auth.user && canRegister && (
                                        <>
                                            <Link
                                                href={register()}
                                                className="rounded-lg bg-blue-600 px-8 py-3 text-center font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-500 transition"
                                            >
                                                Start Free Trial
                                            </Link>
                                            <Link
                                                href={login()}
                                                className="rounded-lg border-2 border-slate-300 px-8 py-3 text-center font-semibold text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800 transition"
                                            >
                                                Sign In
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-3xl opacity-20 dark:opacity-10"></div>
                                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                                        <div className="space-y-4">
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3"></div>
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2"></div>
                                            <div className="pt-4 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
                                                    <div className="flex-1">
                                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">L</div>
                                                    <div className="flex-1">
                                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">C</div>
                                                    <div className="flex-1">
                                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 sm:py-32 bg-white dark:bg-slate-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                                Designed for Legal Professionals
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Built with the needs of lawyers, clients, and legal administrators in mind
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Admin Features */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 hover:shadow-lg transition">
                                <div className="text-4xl mb-4">👨‍⚖️</div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    For Administrators
                                </h3>
                                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Manage users and roles
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Monitor system activity
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Generate reports
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Assign cases
                                    </li>
                                </ul>
                            </div>

                            {/* Lawyer Features */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 hover:shadow-lg transition bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
                                <div className="text-4xl mb-4">📋</div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    For Lawyers
                                </h3>
                                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Track active cases
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Manage clients
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Upload documents
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Set reminders
                                    </li>
                                </ul>
                            </div>

                            {/* Client Features */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 hover:shadow-lg transition">
                                <div className="text-4xl mb-4">👤</div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    For Clients
                                </h3>
                                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> View case status
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Access documents
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Communicate with lawyer
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-600">✓</span> Receive updates
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Features Section */}
                <section className="py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                            Platform Features
                        </h2>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="flex gap-4">
                                <div className="text-3xl">🔒</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Secure & Encrypted</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Industry-standard encryption for all sensitive data</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-3xl">💬</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Real-Time Messaging</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Seamless communication between all parties</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-3xl">📁</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Document Management</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Organize and share case documents easily</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-3xl">📊</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Analytics & Reports</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Track case progress with detailed insights</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-3xl">🔔</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Smart Notifications</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Stay updated with important case milestones</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-3xl">📱</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Responsive Design</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Access from any device, anytime, anywhere</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 sm:py-32 bg-white dark:bg-slate-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                            How It Works
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                                    1
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    Create Account
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Sign up as an Admin, Lawyer, or Client with just a few clicks
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-white text-2xl font-bold mb-4">
                                    2
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    Set Up Cases
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Create and manage cases with relevant documents and details
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600 text-white text-2xl font-bold mb-4">
                                    3
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    Collaborate & Track
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Work together with secure messaging and real-time updates
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 sm:py-32 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                            Ready to Streamline Your Legal Practice?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join lawyers and law firms who are already using LegalCase to manage their cases more efficiently
                        </p>
                        {!auth.user && canRegister && (
                            <Link
                                href={register()}
                                className="inline-block rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 hover:bg-blue-50 transition"
                            >
                                Start Your Free Trial Today
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                                        ⚖️
                                    </div>
                                    <span className="font-bold text-white">LegalCase</span>
                                </div>
                                <p className="text-sm">Managing legal cases made simple</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-4">Product</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white transition">Features</a></li>
                                    <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition">Security</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-4">Company</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white transition">About</a></li>
                                    <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                    <li><a href="#" className="hover:text-white transition">Contact</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-4">Legal</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                    <li><a href="#" className="hover:text-white transition">Terms</a></li>
                                    <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-8">
                            <p className="text-sm text-center">
                                &copy; 2026 LegalCase. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
