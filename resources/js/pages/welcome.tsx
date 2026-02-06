import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { AnimatedCard, AnimatedImage } from '@/components/animated-components';

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

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="animate-slide-down flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg shadow-lg">
                                    ⚖️
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                                    LegalCase
                                </span>
                            </div>
                            <div className="animate-slide-down flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="btn-primary"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="btn-ghost"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="btn-primary"
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
                    {/* Animated background elements */}
                    <div className="absolute top-20 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-float"></div>
                    <div className="absolute bottom-0 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                            <div className="flex flex-col justify-center">
                                <h1 className="animate-slide-up text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                    Manage Your Legal Cases
                                    <span className="block gradient-text">with Confidence</span>
                                </h1>
                                <p className="animate-slide-up text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8" style={{ animationDelay: '100ms' }}>
                                    A comprehensive platform for clients and administrators to collaborate efficiently on legal cases with secure document management and real-time communication.
                                </p>
                                <div className="animate-slide-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: '200ms' }}>
                                    {!auth.user && canRegister && (
                                        <>
                                            <Link
                                                href={register()}
                                                className="btn-primary text-center hover:shadow-xl hover:shadow-blue-500/50"
                                            >
                                                Start Free Trial
                                            </Link>
                                            <Link
                                                href={login()}
                                                className="btn-secondary text-center"
                                            >
                                                Sign In
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20 dark:opacity-10"></div>
                                    <AnimatedImage
                                        placeholder="gradient"
                                        className="aspect-square"
                                        delay={1}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 sm:py-32 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16 animate-slide-up">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                                Designed for Legal Professionals
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Built with the needs of clients and legal administrators in mind
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Admin Features */}
                            <AnimatedCard
                                title="For Administrators"
                                icon="👨‍⚖️"
                                delay={0}
                            >
                                <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-bold">✓</span>
                                        Manage users and roles
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-bold">✓</span>
                                        Monitor system activity
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-bold">✓</span>
                                        Generate reports
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-bold">✓</span>
                                        Assign cases
                                    </li>
                                </ul>
                            </AnimatedCard>

                            {/* Client Features */}
                            <AnimatedCard
                                title="For Clients"
                                icon="👤"
                                delay={1}
                            >
                                <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 text-sm font-bold">✓</span>
                                        View case status
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 text-sm font-bold">✓</span>
                                        Access documents
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 text-sm font-bold">✓</span>
                                        Stay updated on progress
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 text-sm font-bold">✓</span>
                                        Receive updates
                                    </li>
                                </ul>
                            </AnimatedCard>
                        </div>
                    </div>
                </section>

                {/* Key Features Section */}
                <section className="py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center animate-slide-up">
                            Platform Features
                        </h2>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: '🔒', title: 'Secure & Encrypted', desc: 'Industry-standard encryption for all sensitive data' },
                                { icon: '💬', title: 'Real-Time Messaging', desc: 'Seamless communication between all parties' },
                                { icon: '📁', title: 'Document Management', desc: 'Organize and share case documents easily' },
                                { icon: '📊', title: 'Analytics & Reports', desc: 'Track case progress with detailed insights' },
                                { icon: '🔔', title: 'Smart Notifications', desc: 'Stay updated with important case milestones' },
                                { icon: '📱', title: 'Responsive Design', desc: 'Access from any device, anytime, anywhere' },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="animate-scale-in flex gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 animate-stagger-child"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex-shrink-0 text-4xl">{feature.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 sm:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center animate-slide-up">
                            How It Works
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connector lines */}
                            <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 -z-10"></div>

                            {[
                                { num: 1, title: 'Create Account', desc: 'Sign up as an Admin or Client with just a few clicks', color: 'from-blue-600 to-blue-700' },
                                { num: 2, title: 'Set Up Cases', desc: 'Create and manage cases with relevant documents and details', color: 'from-purple-600 to-purple-700' },
                                { num: 3, title: 'Collaborate & Track', desc: 'Work together with secure messaging and real-time updates', color: 'from-pink-600 to-pink-700' },
                            ].map((step, index) => (
                                <div
                                    key={index}
                                    className="animate-slide-up text-center animate-stagger-child"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${step.color} text-white text-3xl font-bold mb-4 shadow-lg`}>
                                        {step.num}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 sm:py-32 bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 dark:from-blue-900 dark:via-blue-800 dark:to-purple-900 relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                    </div>

                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h2 className="animate-slide-up text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                            Ready to Streamline Your Legal Practice?
                        </h2>
                        <p className="animate-slide-up text-xl text-blue-100 mb-8 max-w-2xl mx-auto" style={{ animationDelay: '100ms' }}>
                            Join organizations already using LegalCase to manage their cases more efficiently
                        </p>
                        {!auth.user && canRegister && (
                            <Link
                                href={register()}
                                className="animate-slide-up inline-block rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                style={{ animationDelay: '200ms' }}
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
                            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                                        ⚖️
                                    </div>
                                    <span className="font-bold text-white">LegalCase</span>
                                </div>
                                <p className="text-sm">Managing legal cases made simple</p>
                            </div>

                            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <h4 className="font-semibold text-white mb-4">Product</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white transition">Features</a></li>
                                    <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition">Security</a></li>
                                </ul>
                            </div>

                            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <h4 className="font-semibold text-white mb-4">Company</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white transition">About</a></li>
                                    <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                    <li><a href="#" className="hover:text-white transition">Contact</a></li>
                                </ul>
                            </div>

                            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
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
