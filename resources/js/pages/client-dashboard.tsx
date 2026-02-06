import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { AnimatedStatCard } from '@/components/animated-stat-card';
import { File, CheckCircle, Clock } from 'lucide-react';

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
        { title: 'Closed Cases', value: 1, icon: <CheckCircle size={24} />, color: 'pink' as const, trend: { value: 1, isPositive: true } },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Client Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="animate-slide-up">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Client Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Track your cases and stay updated on their progress</p>
                </div>

                {/* Stats Grid */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            </div>
        </AppLayout>
    );
}
