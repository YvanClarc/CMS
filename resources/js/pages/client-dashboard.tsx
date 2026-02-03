import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Client Dashboard',
        href: '#',
    },
];

export default function ClientDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Client Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your cases and communicate with your lawyer</p>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 dark:border-sidebar-border dark:bg-gray-900">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">My Cases</h3>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 dark:border-sidebar-border dark:bg-gray-900">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Cases</h3>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 dark:border-sidebar-border dark:bg-gray-900">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Lawyer</h3>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">-</p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 dark:border-sidebar-border dark:bg-gray-900">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed Cases</h3>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h3 className="font-semibold text-gray-900 dark:text-white">My Cases</h3>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Updates & Documents</h3>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
