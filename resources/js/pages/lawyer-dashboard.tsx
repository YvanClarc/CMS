import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { AnimatedStatCard } from '@/components/animated-stat-card';
import { AnimatedCard, AnimatedImage, AnimatedList } from '@/components/animated-components';
import { Briefcase, Users, Clock, CheckCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lawyer Dashboard',
        href: '#',
    },
];

export default function LawyerDashboard() {
    const stats = [
        { title: 'Active Cases', value: 12, icon: <Briefcase size={24} />, color: 'blue' as const, trend: { value: 3, isPositive: true } },
        { title: 'My Clients', value: 8, icon: <Users size={24} />, color: 'purple' as const, trend: { value: 2, isPositive: true } },
        { title: 'Pending Tasks', value: 5, icon: <Clock size={24} />, color: 'orange' as const, trend: { value: 1, isPositive: false } },
        { title: 'Closed Cases', value: 28, icon: <CheckCircle size={24} />, color: 'green' as const, trend: { value: 4, isPositive: true } },
    ];

    const currentCases = [
        { id: 1, label: 'Smith vs. Corporation', value: 'In Progress', icon: '⚖️', color: 'text-blue-600 dark:text-blue-400' },
        { id: 2, label: 'Property Dispute', value: 'Discovery Phase', icon: '📋', color: 'text-purple-600 dark:text-purple-400' },
        { id: 3, label: 'Contract Review', value: 'Review Stage', icon: '📄', color: 'text-green-600 dark:text-green-400' },
        { id: 4, label: 'Employment Case', value: 'Settlement Talk', icon: '💼', color: 'text-orange-600 dark:text-orange-400' },
    ];

    const upcomingDeadlines = [
        { id: 1, label: 'File Motion Brief', value: 'Mar 15', icon: '📍' },
        { id: 2, label: 'Client Meeting', value: 'Mar 12', icon: '👥' },
        { id: 3, label: 'Submit Documents', value: 'Mar 18', icon: '📁' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lawyer Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="animate-slide-up">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Lawyer Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Manage your cases and client interactions efficiently</p>
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
                    {/* Current Cases */}
                    <div className="lg:col-span-2">
                        <AnimatedCard
                            title="Current Cases"
                            icon="📋"
                            delay={0}
                        >
                            <AnimatedList items={currentCases} />
                        </AnimatedCard>
                    </div>

                    {/* Quick Actions */}
                    <AnimatedCard
                        title="Quick Actions"
                        icon="⚡"
                        delay={1}
                    >
                        <div className="space-y-3">
                            <button className="w-full rounded-lg bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-left font-medium text-slate-900 dark:text-white transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:-translate-y-0.5">
                                + New Case
                            </button>
                            <button className="w-full rounded-lg bg-purple-50 dark:bg-purple-950/30 px-4 py-3 text-left font-medium text-slate-900 dark:text-white transition-all hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:-translate-y-0.5">
                                Message Client
                            </button>
                            <button className="w-full rounded-lg bg-pink-50 dark:bg-pink-950/30 px-4 py-3 text-left font-medium text-slate-900 dark:text-white transition-all hover:bg-pink-100 dark:hover:bg-pink-900/50 hover:-translate-y-0.5">
                                Upload Document
                            </button>
                        </div>
                    </AnimatedCard>
                </div>

                {/* Timeline and Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <AnimatedCard
                        title="Upcoming Deadlines"
                        icon="📅"
                        delay={2}
                    >
                        <div className="space-y-4">
                            {upcomingDeadlines.map((deadline, index) => (
                                <div
                                    key={deadline.id}
                                    className="animate-slide-left animate-stagger-child flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{deadline.icon}</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{deadline.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{deadline.value}</span>
                                </div>
                            ))}
                        </div>
                    </AnimatedCard>

                    <AnimatedCard
                        title="Case Progress"
                        icon="📊"
                        delay={2}
                    >
                        <AnimatedImage
                            placeholder="gradient"
                            className="h-48 w-full"
                        />
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Add your progress chart here</p>
                    </AnimatedCard>
                </div>
            </div>
        </AppLayout>
    );
}
