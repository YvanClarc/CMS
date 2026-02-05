import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { AnimatedStatCard } from '@/components/animated-stat-card';
import { AnimatedCard, AnimatedImage, AnimatedList } from '@/components/animated-components';
import { Users, BarChart3, AlertCircle, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '#',
    },
];

export default function AdminDashboard() {
    const stats = [
        { title: 'Total Users', value: 284, icon: <Users size={24} />, color: 'blue' as const, trend: { value: 12, isPositive: true } },
        { title: 'Total Cases', value: 156, icon: <BarChart3 size={24} />, color: 'purple' as const, trend: { value: 8, isPositive: true } },
        { title: 'Active Lawyers', value: 42, icon: <TrendingUp size={24} />, color: 'green' as const, trend: { value: 5, isPositive: true } },
        { title: 'Active Clients', value: 198, icon: <AlertCircle size={24} />, color: 'pink' as const, trend: { value: 15, isPositive: true } },
    ];

    const recentUsers = [
        { id: 1, label: 'John Doe', value: 'Lawyer', icon: '👨‍⚖️' },
        { id: 2, label: 'Jane Smith', value: 'Client', icon: '👩‍💼' },
        { id: 3, label: 'Robert Johnson', value: 'Lawyer', icon: '👨‍⚖️' },
        { id: 4, label: 'Emily Davis', value: 'Client', icon: '👩‍💼' },
        { id: 5, label: 'Michael Brown', value: 'Lawyer', icon: '👨‍⚖️' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="animate-slide-up">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Monitor system activity and manage users, cases, and settings</p>
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
                    {/* Recent Users */}
                    <div className="lg:col-span-2">
                        <AnimatedCard
                            title="Recent Users"
                            icon="👥"
                            delay={0}
                        >
                            <AnimatedList items={recentUsers} />
                        </AnimatedCard>
                    </div>

                    {/* System Activity Summary */}
                    <AnimatedCard
                        title="System Activity"
                        icon="⚙️"
                        delay={1}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">System Status</span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">✓ Online</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Database</span>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Healthy</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-purple-50 dark:bg-purple-950/30 p-3">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Uptime</span>
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">99.9%</span>
                            </div>
                        </div>
                    </AnimatedCard>
                </div>

                {/* Charts and Analytics */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <AnimatedCard
                        title="Case Distribution"
                        icon="📊"
                        delay={2}
                    >
                        <AnimatedImage
                            placeholder="gradient"
                            className="h-48 w-full"
                        />
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Add your chart/graph here</p>
                    </AnimatedCard>

                    <AnimatedCard
                        title="User Growth Trend"
                        icon="📈"
                        delay={2}
                    >
                        <AnimatedImage
                            placeholder="gradient"
                            className="h-48 w-full"
                        />
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Add your chart/graph here</p>
                    </AnimatedCard>
                </div>
            </div>
        </AppLayout>
    );
}
