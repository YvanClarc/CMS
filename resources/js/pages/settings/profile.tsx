import { useRef, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Camera, CheckCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => setShowSuccessModal(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessModal]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                            encType: 'multipart/form-data',
                            onSuccess: () => {
                                setShowSuccessModal(true);
                                setPreviewUrl(null);
                            },
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {/* Avatar Section */}
                                <div className="space-y-4">
                                    <div className="flex items-end gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label>Profile Photo</Label>
                                            <div className="relative">
                                                <Avatar className="h-20 w-20">
                                                    <AvatarImage
                                                        src={
                                                            previewUrl ||
                                                            (auth.user.avatar
                                                                ? `/storage/${auth.user.avatar}`
                                                                : undefined)
                                                        }
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-lg font-semibold text-white">
                                                        {auth.user.name
                                                            .split(' ')
                                                            .map((n) =>
                                                                n[0]
                                                            )
                                                            .join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                    className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    <Camera size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">
                                                PNG, JPG, or GIF.
                                                <br />
                                                Max 2MB.
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        name="avatar"
                                        accept="image/jpeg,image/png,image/gif"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.avatar}
                                    />
                                </div>

                                {/* Personal Information Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Personal Information
                                    </h3>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                className="mt-1 block w-full"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="John Doe"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.name}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                className="mt-1 block w-full"
                                                defaultValue={
                                                    auth.user.phone || ''
                                                }
                                                name="phone"
                                                autoComplete="tel"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.phone}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.email}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.bio || ''}
                                            name="bio"
                                            placeholder="Tell us about yourself..."
                                            rows={3}
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.bio}
                                        />
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Address
                                    </h3>

                                    <div className="grid gap-2">
                                        <Label htmlFor="address">
                                            Street Address
                                        </Label>
                                        <Input
                                            id="address"
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                auth.user.address || ''
                                            }
                                            name="address"
                                            placeholder="123 Street Name"
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.address}
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                className="mt-1 block w-full"
                                                defaultValue={
                                                    auth.user.city || ''
                                                }
                                                name="city"
                                                placeholder="City"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.city}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="state">Province</Label>
                                            <Input
                                                id="state"
                                                className="mt-1 block w-full"
                                                defaultValue={
                                                    auth.user.state || ''
                                                }
                                                name="state"
                                                placeholder="e.g., Metro Manila"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.state}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="zip_code">
                                                ZIP Code
                                            </Label>
                                            <Input
                                                id="zip_code"
                                                className="mt-1 block w-full"
                                                defaultValue={
                                                    auth.user.zip_code || ''
                                                }
                                                name="zip_code"
                                                placeholder="12345"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.zip_code}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="country">
                                                Country
                                            </Label>
                                            <Input
                                                id="country"
                                                className="mt-1 block w-full"
                                                defaultValue={
                                                    auth.user.country || ''
                                                }
                                                name="country"
                                                placeholder="United States"
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors.country}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save Changes
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Success Modal */}
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent className="max-w-sm">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-xl">Changes Saved Successfully</DialogTitle>
                                <DialogDescription>
                                    Your profile information has been updated.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button 
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
