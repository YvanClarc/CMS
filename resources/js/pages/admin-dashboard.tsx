import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { AnimatedStatCard } from '@/components/animated-stat-card';
import { Users, BarChart3, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lawyer Dashboard',
        href: '#',
    },
];

interface Props {
    totalUsers: number;
    pendingCaseRequests: number;
}

export default function AdminDashboard({ totalUsers, pendingCaseRequests }: Props) {
    const stats = [
        { title: 'Total Users', value: totalUsers, icon: <Users size={24} />, color: 'blue' as const, trend: { value: 12, isPositive: true } },
        { title: 'Pending Case Requests', value: pendingCaseRequests, icon: <FileText size={24} />, color: 'amber' as const, trend: { value: 5, isPositive: false } },
        { title: 'Active Cases', value: 156, icon: <BarChart3 size={24} />, color: 'purple' as const, trend: { value: 8, isPositive: true } },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lawyer Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="animate-slide-up">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Lawyer Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Monitor system activity and manage users, cases, and settings</p>
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
