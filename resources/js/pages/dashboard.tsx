import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { AnimatedCard, AnimatedImage } from '@/components/animated-components';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Welcome Banner */}
                <div className="animate-slide-up rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
                    <h1 className="text-3xl font-bold mb-2">Welcome to MGC Case Management</h1>
                    <p className="text-blue-100">Manage your legal cases efficiently with our modern platform</p>
                </div>

                {/* Stats Overview */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <AnimatedCard
                        title="📊 Quick Stats"
                        delay={0}
                    >
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Active Cases</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">—</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Users</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">—</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Pending Tasks</span>
                                <span className="font-bold text-pink-600 dark:text-pink-400">—</span>
                            </div>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard
                        title="🎯 Recent Activity"
                        delay={1}
                    >
                        <div className="space-y-2 text-sm">
                            <div className="text-slate-600 dark:text-slate-400">No recent activities</div>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard
                        title="📱 Quick Links"
                        delay={2}
                    >
                        <div className="space-y-2">
                            <a href="#" className="block text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">→ View Cases</a>
                            <a href="#" className="block text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium">→ Manage Users</a>
                            <a href="#" className="block text-pink-600 dark:text-pink-400 hover:underline text-sm font-medium">→ Settings</a>
                        </div>
                    </AnimatedCard>
                </div>

                {/* Featured Sections */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <AnimatedCard
                        title="📈 System Overview"
                        delay={0}
                    >
                        <AnimatedImage
                            placeholder="gradient"
                            className="aspect-video w-full"
                        />
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Add system metrics or charts here</p>
                    </AnimatedCard>

                    <AnimatedCard
                        title="🔔 Notifications"
                        delay={1}
                    >
                        <AnimatedImage
                            placeholder="gradient"
                            className="aspect-video w-full"
                        />
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Recent updates and alerts appear here</p>
                    </AnimatedCard>
                </div>

                {/* Large Content Area */}
                <AnimatedCard
                    title="📊 Dashboard Content"
                    delay={2}
                >
                    <AnimatedImage
                        placeholder="gradient"
                        className="aspect-video w-full"
                    />
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Add your main dashboard content, charts, and visualizations here</p>
                </AnimatedCard>
            </div>
        </AppLayout>
    );
}
