import React from 'react';

interface AnimatedCardProps {
    title: string;
    children?: React.ReactNode;
    className?: string;
    delay?: number;
    icon?: React.ReactNode;
    hoverEffect?: 'lift' | 'glow' | 'scale';
}

export function AnimatedCard({
    title,
    children,
    className = '',
    delay = 0,
    icon,
    hoverEffect = 'lift',
}: AnimatedCardProps) {
    const hoverClasses = {
        lift: 'hover:-translate-y-2 hover:shadow-2xl',
        glow: 'hover:shadow-xl hover:glow-blue',
        scale: 'hover:scale-105',
    };

    return (
        <div
            className={`animate-slide-up card-modern ${hoverClasses[hoverEffect]} p-6 ${className}`}
            style={{ animationDelay: `${delay * 100}ms` }}
        >
            {icon && <div className="mb-4 text-3xl">{icon}</div>}

            {title && <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>}

            {children}
        </div>
    );
}

interface AnimatedImageProps {
    src?: string;
    placeholder?: 'pattern' | 'gradient' | 'solid';
    alt?: string;
    className?: string;
    delay?: number;
}

export function AnimatedImage({
    src,
    placeholder = 'gradient',
    alt = 'image',
    className = '',
    delay = 0,
}: AnimatedImageProps) {
    const placeholderClasses = {
        pattern: 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 animate-shimmer',
        gradient: 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 animate-float',
        solid: 'bg-slate-200 dark:bg-slate-700',
    };

    return (
        <div
            className={`animate-scale-in overflow-hidden rounded-2xl ${placeholderClasses[placeholder]} ${className}`}
            style={{ animationDelay: `${delay * 100}ms` }}
        >
            {src ? (
                <img src={src} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <div className="text-6xl opacity-20">📸</div>
                </div>
            )}
        </div>
    );
}

interface AnimatedListProps {
    items: Array<{
        id: string | number;
        label: string;
        value?: string | number;
        icon?: React.ReactNode;
        color?: string;
    }>;
    className?: string;
}

export function AnimatedList({ items, className = '' }: AnimatedListProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className="animate-slide-left animate-stagger-child flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex items-center gap-3">
                        {item.icon && <div className="text-2xl">{item.icon}</div>}
                        <span className="font-medium text-slate-900 dark:text-white">{item.label}</span>
                    </div>

                    {item.value && (
                        <span className={`font-bold ${item.color || 'text-blue-600 dark:text-blue-400'}`}>
                            {item.value}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
