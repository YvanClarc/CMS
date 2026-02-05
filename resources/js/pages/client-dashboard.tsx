import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { AnimatedStatCard } from '@/components/animated-stat-card';
import { AnimatedCard, AnimatedImage, AnimatedList } from '@/components/animated-components';
import { File, User, CheckCircle, Clock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Client Dashboard',
        href: '#',
    },
];

export default function ClientDashboard() {
    const stats = [
        { title: 'My Cases', value: 3, icon: <File size={24} />, color: 'blue' as const, trend: { value: 1, isPositive: true } },
        { title: 'Active Cases', value: 2, icon: <Clock size={24} />, color: 'purple' as const, trend: { value: 0, isPositive: true } },
        { title: 'Assigned Lawyer', value: '—', icon: <User size={24} />, color: 'green' as const },
        { title: 'Closed Cases', value: 1, icon: <CheckCircle size={24} />, color: 'pink' as const, trend: { value: 1, isPositive: true } },
    ];

    const myCases = [
        { id: 1, label: 'Smith vs. Corporation', value: 'In Progress', icon: '⚖️', color: 'text-blue-600 dark:text-blue-400' },
        { id: 2, label: 'Property Dispute', value: 'Under Review', icon: '🏠', color: 'text-purple-600 dark:text-purple-400' },
        { id: 3, label: 'Contract Review', value: 'Resolved', icon: '✅', color: 'text-green-600 dark:text-green-400' },
    ];

    const recentUpdates = [
        { id: 1, label: 'New document uploaded: Settlement Offer', value: '2 days ago', icon: '📄' },
        { id: 2, label: 'Message from your lawyer', value: '1 day ago', icon: '💬' },
        { id: 3, label: 'Case status updated to Review Stage', value: '3 days ago', icon: '📊' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Client Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="animate-slide-up">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Client Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Track your cases and communicate with your lawyer</p>
                </div>

                {/* Stats Grid */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <AnimatedStatCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            trend={stat.trend}
                            color={stat.color}
                            delay={index}
                        />
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* My Cases */}
                    <div className="lg:col-span-2">
                        <AnimatedCard
                            title="My Cases"
                            icon="📋"
                            delay={0}
                        >
                            <AnimatedList items={myCases} />
                        </AnimatedCard>
                    </div>

                    {/* Quick Links */}
                    <AnimatedCard
                        title="Quick Actions"
                        icon="⚡"
                        delay={1}
                    >
                        <div className="space-y-3">
                            <button className="w-full rounded-lg bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-left font-medium text-slate-900 dark:text-white transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:-translate-y-0.5">
                                📱 Message Lawyer
                            </button>
                            <button className="w-full rounded-lg bg-purple-50 dark:bg-purple-950/30 px-4 py-3 text-left font-medium text-slate-900 dark:text-white transition-all hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:-translate-y-0.5">
                                📁 View Documents
                            </button>
                            <button className="w-full rounded-lg bg-green-50 dark:bg-green-950/30 px-4 py-3 text-left font-medium text-slate-900 dark:text-white transition-all hover:bg-green-100 dark:hover:bg-green-900/50 hover:-translate-y-0.5">
                                🔔 Case Updates
                            </button>
                        </div>
                    </AnimatedCard>
                </div>

                {/* Updates and Timeline */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <AnimatedCard
                        title="Recent Updates"
                        icon="🔔"
                        delay={2}
                    >
                        <AnimatedList items={recentUpdates} />
                    </AnimatedCard>

                    <AnimatedCard
                        title="Case Timeline"
                        icon="📅"
                        delay={2}
                    >
                        <AnimatedImage
                            placeholder="gradient"
                            className="h-48 w-full"
                        />
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Add timeline visualization here</p>
                    </AnimatedCard>
                </div>
            </div>
        </AppLayout>
    );
}
