# Modern Design Implementation Examples

## Quick Reference

### Using AnimatedStatCard

```tsx
import { AnimatedStatCard } from '@/components/animated-stat-card';
import { Users, TrendingUp } from 'lucide-react';

export function MyComponent() {
    return (
        <AnimatedStatCard
            title="Total Users"
            value={284}
            icon={<Users size={24} />}
            color="blue"
            trend={{ value: 12, isPositive: true }}
            delay={0}
        />
    );
}
```

### Using AnimatedCard

```tsx
import { AnimatedCard } from '@/components/animated-components';

export function MyComponent() {
    return (
        <AnimatedCard
            title="Recent Activity"
            icon="⚡"
            delay={1}
            hoverEffect="lift"
        >
            <p>Your content here</p>
        </AnimatedCard>
    );
}
```

### Using AnimatedImage

```tsx
import { AnimatedImage } from '@/components/animated-components';

export function MyComponent() {
    return (
        // With actual image
        <AnimatedImage
            src="https://example.com/image.jpg"
            alt="My image"
            className="w-full h-64"
        />
        
        // With placeholder
        {/* <AnimatedImage
            placeholder="gradient"
            className="w-full h-64"
            delay={1}
        /> */}
    );
}
```

### Using AnimatedList

```tsx
import { AnimatedList } from '@/components/animated-components';

export function MyComponent() {
    const items = [
        { id: 1, label: 'Task 1', value: '10', icon: '✓' },
        { id: 2, label: 'Task 2', value: '20', icon: '✓' },
        { id: 3, label: 'Task 3', value: '30', icon: '✓' },
    ];

    return <AnimatedList items={items} />;
}
```

## Animation Classes

### Direct Tailwind Usage

```tsx
<div className="animate-fade-in">
    <h1>Fades in smoothly</h1>
</div>

<div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
    <p>Slides up with delay</p>
</div>

<div className="animate-scale-in">
    <img src="image.jpg" alt="Scales in" />
</div>

<div className="animate-float">
    <div>Floats continuously</div>
</div>
```

### Staggered Animations

```tsx
{items.map((item, index) => (
    <div
        key={item.id}
        className="animate-slide-up animate-stagger-child"
        style={{ animationDelay: `${index * 50}ms` }}
    >
        {item.name}
    </div>
))}
```

## Button Styles

```tsx
// Primary Button
<button className="btn-primary">
    Click Me
</button>

// Secondary Button
<button className="btn-secondary">
    Secondary Action
</button>

// Ghost Button (Text only)
<button className="btn-ghost">
    Learn More
</button>
```

## Card Styles

```tsx
// Modern Card with shadow
<div className="card-modern p-6">
    <h2>Card Title</h2>
    <p>Card content</p>
</div>

// Subtle Card
<div className="card-modern-subtle p-4">
    <p>Subtle background with blur</p>
</div>
```

## Color Variants

### AnimatedStatCard Colors

```tsx
// Blue variant
<AnimatedStatCard color="blue" />

// Purple variant
<AnimatedStatCard color="purple" />

// Pink variant
<AnimatedStatCard color="pink" />

// Green variant
<AnimatedStatCard color="green" />

// Orange variant
<AnimatedStatCard color="orange" />
```

## Gradient Effects

```tsx
// Gradient Text
<h1 className="gradient-text">
    Gradient Text Effect
</h1>

// Glow Effects
<div className="glow-blue p-4 rounded">
    Blue glow shadow
</div>

<div className="glow-purple p-4 rounded">
    Purple glow shadow
</div>

<div className="glow-pink p-4 rounded">
    Pink glow shadow
</div>
```

## Dashboard Grid Patterns

### Stat Cards Grid

```tsx
<div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
    {stats.map((stat, index) => (
        <AnimatedStatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            delay={index}
        />
    ))}
</div>
```

### Content Grid

```tsx
<div className="grid gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2">
        <AnimatedCard title="Main Content">
            {/* Takes 2/3 width on large screens */}
        </AnimatedCard>
    </div>
    
    <AnimatedCard title="Sidebar">
        {/* Takes 1/3 width on large screens */}
    </AnimatedCard>
</div>
```

### Two Column Layout

```tsx
<div className="grid gap-6 lg:grid-cols-2">
    <AnimatedCard title="Left Section">
        <p>Left content</p>
    </AnimatedCard>
    
    <AnimatedCard title="Right Section">
        <p>Right content</p>
    </AnimatedCard>
</div>
```

## Real Data Example

### Before (Placeholder)

```tsx
export function AdminDashboard() {
    const stats = [
        { title: 'Total Users', value: 0, icon: <Users /> },
        { title: 'Total Cases', value: 0, icon: <BarChart3 /> },
    ];
}
```

### After (With Real Data)

```tsx
import { useQuery } from '@tanstack/react-query';

export function AdminDashboard() {
    const { data: dashboard } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await fetch('/api/dashboard');
            return response.json();
        },
    });

    const stats = [
        {
            title: 'Total Users',
            value: dashboard?.userCount || 0,
            icon: <Users />,
            trend: dashboard?.userTrend,
        },
        {
            title: 'Total Cases',
            value: dashboard?.caseCount || 0,
            icon: <BarChart3 />,
            trend: dashboard?.caseTrend,
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <AnimatedStatCard {...stat} delay={i} key={stat.title} />
            ))}
        </div>
    );
}
```

## Advanced: Custom Animations

### Adding Custom Animation

```tsx
// In app.css
@keyframes slideInCustom {
    from {
        opacity: 0;
        transform: translateX(-30px) rotate(-10deg);
    }
    to {
        opacity: 1;
        transform: translateX(0) rotate(0deg);
    }
}

@layer utilities {
    .animate-slide-custom {
        animation: slideInCustom 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
}

// In component
<div className="animate-slide-custom">
    Custom animation
</div>
```

## Responsive Patterns

```tsx
// Stack on mobile, 2 columns on tablet, 3 on desktop
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {/* Items */}
</div>

// Full width on mobile, half on desktop
<div className="grid gap-4 md:grid-cols-2">
    {/* Items */}
</div>

// Single column everywhere
<div className="space-y-4">
    {/* Items */}
</div>
```

## Performance Tips

### 1. Reduce Animation Delays
```tsx
// Use smaller delays for faster animations
style={{ animationDelay: `${index * 25}ms` }} // 25ms instead of 50ms
```

### 2. Limit Animations
```tsx
// Only animate on desktop
<div className={`${isMobile ? '' : 'animate-fade-in'}`}>
    Content
</div>
```

### 3. Use CSS Over JS
```tsx
// Good - CSS animation
<div className="animate-float">Content</div>

// Avoid - JavaScript animation
<div style={{ 
    animation: setInterval(() => {...}, 16) 
}}>
    Content
</div>
```

## Common Patterns

### Loading State
```tsx
<div className="animate-shimmer bg-slate-200 rounded p-4 h-10"></div>
```

### Hover Interaction
```tsx
<div className="card-modern hover:shadow-xl transition-shadow">
    Hover for effect
</div>
```

### Hero Section
```tsx
<section>
    <div className="animate-float">
        <AnimatedImage placeholder="gradient" />
    </div>
</section>
```

### Feature Showcase
```tsx
<div className="grid gap-8">
    {features.map((feature, i) => (
        <AnimatedCard key={feature.id} delay={i}>
            {feature.content}
        </AnimatedCard>
    ))}
</div>
```

---

**Check MODERN_DESIGN_GUIDE.md for detailed documentation!**
