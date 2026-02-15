import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Eye } from 'lucide-react';
import { Head } from '@inertiajs/react';

interface Agreement {
    id: number;
    case_id: number;
    status: 'pending' | 'signed' | 'declined';
    agreement_content: string;
    signed_at: string | null;
    signer_name: string | null;
    signer_email: string | null;
    signature_image: string | null;
    signature_timestamp: string | null;
    case?: {
        id: number;
        title: string;
    };
}

interface ClientAgreementsProps {
    agreements: Agreement[];
}

export default function ClientAgreements({ agreements }: ClientAgreementsProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Agreements', href: '/agreements' },
    ];

    const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'signed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const viewSignature = (agreement: Agreement) => {
        setSelectedAgreement(agreement);
        setShowSignatureModal(true);
    };

    const handleSignAgreement = (agreementId: number) => {
        router.get(`/agreements/${agreementId}/sign`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Agreements" />
            <div className="p-6 space-y-6 max-w-6xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Agreements</h1>
                    <p className="text-gray-600">Manage and review your agreements</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                        <p className="text-sm text-gray-600">Total Agreements</p>
                        <p className="text-2xl font-bold">{agreements.length}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-gray-600">Signed</p>
                        <p className="text-2xl font-bold text-green-600">
                            {agreements.filter((a: Agreement) => a.status === 'signed').length}
                        </p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {agreements.filter((a: Agreement) => a.status === 'pending').length}
                        </p>
                    </Card>
                </div>

                {/* Agreements List */}
                <div className="space-y-4">
                    {agreements.length === 0 ? (
                        <Card className="p-8 text-center">
                            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                            <p className="text-gray-600 mb-2">No agreements yet</p>
                            <p className="text-sm text-gray-500">
                                When your legal team sends you agreements, they will appear here.
                            </p>
                        </Card>
                    ) : (
                        agreements.map((agreement: Agreement) => (
                            <Card key={agreement.id} className="p-6 hover:shadow-lg transition">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Agreement for {agreement.case?.title || 'Your Case'}
                                        </h3>
                                        <Badge className={`${getStatusColor(agreement.status)}`}>
                                            {agreement.status.charAt(0).toUpperCase() +
                                                agreement.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Agreement Preview */}
                                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 max-h-24 overflow-y-auto">
                                    <p className="text-xs text-gray-600 line-clamp-3">
                                        {agreement.agreement_content}
                                    </p>
                                </div>

                                {/* Signature Info (if signed) */}
                                {agreement.status === 'signed' && agreement.signed_at && (
                                    <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                                        <div className="flex items-center gap-2 text-sm text-green-800">
                                            <Calendar size={16} />
                                            <span>
                                                Signed on{' '}
                                                {new Date(agreement.signed_at).toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 flex-wrap">
                                    {agreement.status === 'pending' && (
                                        <Button
                                            onClick={() => handleSignAgreement(agreement.id)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Sign Agreement
                                        </Button>
                                    )}
                                    {agreement.status === 'signed' && agreement.signature_image && (
                                        <Button
                                            variant="outline"
                                            onClick={() => viewSignature(agreement)}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye size={16} />
                                            View Signature
                                        </Button>
                                    )}
                                    {agreement.status === 'declined' && (
                                        <span className="text-sm text-red-700 font-medium py-2">
                                            You declined this agreement
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Signature Modal */}
                {showSignatureModal && selectedAgreement && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold">Your Signature</h2>
                                    <button
                                        onClick={() => setShowSignatureModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Signature Image */}
                                <div className="mb-6 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                    {selectedAgreement.signature_image && (
                                        <img
                                            src={`/storage/${selectedAgreement.signature_image}`}
                                            alt="Your Signature"
                                            className="w-full h-auto max-h-96 object-contain p-4"
                                        />
                                    )}
                                </div>

                                {/* Signature Details */}
                                <div className="space-y-4 bg-gray-50 p-4 rounded">
                                    <h3 className="font-semibold text-gray-900">Signature Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600 font-medium">Signer Name</p>
                                            <p className="text-gray-900">{selectedAgreement.signer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-medium">Signer Email</p>
                                            <p className="text-gray-900">{selectedAgreement.signer_email}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-600 font-medium">Signed Date & Time</p>
                                            <p className="text-gray-900">
                                                {selectedAgreement.signature_timestamp &&
                                                    new Date(selectedAgreement.signature_timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <div className="mt-6 flex justify-end">
                                    <Button onClick={() => setShowSignatureModal(false)}>Close</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
