import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { AnimatedStatCard } from '@/components/animated-stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, Edit2, Check, X, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'client';
    status: 'active' | 'pending' | 'declined';
    created_at: string;
}

interface Props {
    users: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Manage Users',
        href: '#',
    },
];

export default function ManageUsers({ users }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; userId: number | null }>({ isOpen: false, userId: null });
    const [approveConfirmation, setApproveConfirmation] = useState<{ isOpen: boolean; userId: number | null }>({ isOpen: false, userId: null });
    const [declineConfirmation, setDeclineConfirmation] = useState<{ isOpen: boolean; userId: number | null }>({ isOpen: false, userId: null });

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'client',
        status: 'pending',
    });

    // Auto-dismiss notification after 4 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                reset();
                setIsFormOpen(false);
                setNotification({ type: 'success', message: 'User created successfully! They will receive approval notification.' });
            },
        });
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setData('name', user.name);
        setData('email', user.email);
        setData('password', '');
        setData('password_confirmation', '');
        setData('role', user.role);
        setData('status', user.status);
        setIsFormOpen(true);
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(`/admin/users/${editingUser.id}`, {
                onSuccess: () => {
                    reset();
                    setEditingUser(null);
                    setIsFormOpen(false);
                    setNotification({ type: 'success', message: 'User updated successfully!' });
                },
            });
        }
    };

    const handleDeleteUser = (userId: number) => {
        setDeleteConfirmation({ isOpen: true, userId });
    };

    const confirmDeleteUser = () => {
        if (deleteConfirmation.userId) {
            destroy(`/admin/users/${deleteConfirmation.userId}`, {
                onSuccess: () => {
                    setNotification({ type: 'success', message: 'User deleted successfully!' });
                    setDeleteConfirmation({ isOpen: false, userId: null });
                },
            });
        }
    };

    const handleApproveUser = (userId: number) => {
        setApproveConfirmation({ isOpen: true, userId });
    };

    const confirmApproveUser = () => {
        if (approveConfirmation.userId) {
            post(`/admin/users/${approveConfirmation.userId}/approve`, {
                onSuccess: () => {
                    setNotification({ type: 'success', message: 'User approved successfully! They can now access the system.' });
                    setApproveConfirmation({ isOpen: false, userId: null });
                },
            });
        }
    };

    const handleDeclineUser = (userId: number) => {
        setDeclineConfirmation({ isOpen: true, userId });
    };

    const confirmDeclineUser = () => {
        if (declineConfirmation.userId) {
            post(`/admin/users/${declineConfirmation.userId}/decline`, {
                onSuccess: () => {
                    setNotification({ type: 'success', message: 'User declined successfully!' });
                    setDeclineConfirmation({ isOpen: false, userId: null });
                },
            });
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingUser(null);
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Users" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Notification */}
                {notification && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className={notification.type === 'success' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}>
                            {notification.type === 'success' && <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />}
                            <AlertTitle className={notification.type === 'success' ? 'text-green-900 dark:text-green-100' : ''}>
                                {notification.type === 'success' ? 'Success' : 'Error'}
                            </AlertTitle>
                            <AlertDescription className={notification.type === 'success' ? 'text-green-700 dark:text-green-200' : ''}>
                                {notification.message}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Header */}
                <div className="animate-slide-up">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Manage Users</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                        Add, edit, delete, and manage user accounts
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        onClick={() => {
                            setEditingUser(null);
                            reset();
                            setIsFormOpen(true);
                        }}
                        className="whitespace-nowrap"
                    >
                        + Add User
                    </Button>
                </div>

                {/* User Management Modal */}
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={editingUser ? handleUpdateUser : handleAddUser}
                            className="space-y-4"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                {!editingUser && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Password
                                            </label>
                                            <Input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                required={!editingUser}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Confirm Password
                                            </label>
                                            <Input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) =>
                                                    setData('password_confirmation', e.target.value)
                                                }
                                                required={!editingUser}
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Role
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="client">Client</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="declined">Declined</option>
                                    </select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    onClick={handleCloseForm}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {editingUser ? 'Update User' : 'Add User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => setDeleteConfirmation({ isOpen: open, userId: deleteConfirmation.userId })}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Delete User</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-slate-700 dark:text-slate-300">
                                Are you sure you want to delete this user? All associated data will be permanently removed.
                            </p>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                onClick={() => setDeleteConfirmation({ isOpen: false, userId: null })}
                                variant="outline"
                            >
                                No, Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmDeleteUser}
                                disabled={processing}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Yes, Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Approve Confirmation Modal */}
                <Dialog open={approveConfirmation.isOpen} onOpenChange={(open) => setApproveConfirmation({ isOpen: open, userId: approveConfirmation.userId })}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Approve User</DialogTitle>
                            <DialogDescription>
                                This action will approve the user's registration.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-slate-700 dark:text-slate-300">
                                Are you sure you want to approve this user? They will be able to access the system immediately.
                            </p>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                onClick={() => setApproveConfirmation({ isOpen: false, userId: null })}
                                variant="outline"
                            >
                                No, Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmApproveUser}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Yes, Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Decline Confirmation Modal */}
                <Dialog open={declineConfirmation.isOpen} onOpenChange={(open) => setDeclineConfirmation({ isOpen: open, userId: declineConfirmation.userId })}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Decline User</DialogTitle>
                            <DialogDescription>
                                This action will decline the user's registration.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-slate-700 dark:text-slate-300">
                                Are you sure you want to decline this user? They will receive a notification about the declined registration.
                            </p>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                onClick={() => setDeclineConfirmation({ isOpen: false, userId: null })}
                                variant="outline"
                            >
                                No, Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmDeclineUser}
                                disabled={processing}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                Yes, Decline
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Users Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                    <td className="px-4 py-3">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${
                                                user.status === 'active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : user.status === 'pending'
                                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {user.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApproveUser(user.id)}
                                                        className="rounded p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeclineUser(user.id)}
                                                        className="rounded p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                                                        title="Decline"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="rounded p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">No users found</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
