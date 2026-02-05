import React from 'react';

interface AnimatedStatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    delay?: number;
    color?: 'blue' | 'purple' | 'pink' | 'green' | 'orange';
}

const colorClasses = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-700',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-700',
    pink: 'from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 border-pink-200 dark:border-pink-700',
    green: 'from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-700',
    orange: 'from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200 dark:border-orange-700',
};

const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    pink: 'text-pink-600 dark:text-pink-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
};

export function AnimatedStatCard({
    title,
    value,
    icon,
    trend,
    className = '',
    delay = 0,
    color = 'blue',
}: AnimatedStatCardProps) {
    return (
        <div
            className={`animate-scale-in rounded-2xl border bg-gradient-to-br p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colorClasses[color]} ${className}`}
            style={{ animationDelay: `${delay * 100}ms` }}
        >
            {icon && (
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white dark:bg-slate-800 ${iconColorClasses[color]}`}>
                    {icon}
                </div>
            )}

            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>

            <div className="mt-3 flex items-end justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>

                {trend && (
                    <div
                        className={`text-sm font-semibold ${
                            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
        </div>
    );
}
