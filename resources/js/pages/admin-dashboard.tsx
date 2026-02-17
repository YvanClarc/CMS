import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { AnimatedStatCard } from '@/components/animated-stat-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, BarChart3, FileText, Mail } from 'lucide-react';

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
    const { auth } = usePage<SharedData>().props;
    const isEmailVerified = auth.user.email_verified_at !== null;

    const stats = [
        { title: 'Total Users', value: totalUsers, icon: <Users size={24} />, color: 'blue' as const, trend: { value: 12, isPositive: true } },
        { title: 'Pending Case Requests', value: pendingCaseRequests, icon: <FileText size={24} />, color: 'amber' as const, trend: { value: 5, isPositive: false } },
        { title: 'Active Cases', value: 156, icon: <BarChart3 size={24} />, color: 'purple' as const, trend: { value: 8, isPositive: true } },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lawyer Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Email Verification Alert */}
                {!isEmailVerified && (
                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-800 animate-in">
                        <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200 ml-3">
                            <div className="flex items-center justify-between">
                                <span>Your email is not verified. Please verify your email to unlock all features.</span>
                                <Button
                                    onClick={() => router.visit('/verify-email')}
                                    size="sm"
                                    className="ml-4 bg-amber-600 hover:bg-amber-700"
                                >
                                    Verify Email
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

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
