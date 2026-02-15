import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Eye } from 'lucide-react';

interface Agreement {
    id: number;
    case_id: number;
    client_id: number;
    status: 'pending' | 'signed' | 'declined';
    agreement_content: string;
    signed_at: string | null;
    signer_name: string | null;
    signer_email: string | null;
    signature_image: string | null;
    signer_ip_address: string | null;
    signature_timestamp: string | null;
    client: {
        id: number;
        name: string;
        email: string;
    };
    case?: {
        id: number;
        title: string;
    };
}

interface AdminAgreementsProps {
    agreements: Agreement[];
}

export default function AdminAgreements({ agreements }: AdminAgreementsProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Agreements', href: '/admin/agreements' },
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agreements" />
            <div className="p-6 space-y-6 max-w-7xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Agreements</h1>
                    <p className="text-gray-600">Manage and view all client agreements</p>
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
                            <p className="text-gray-600">No agreements found</p>
                        </Card>
                    ) : (
                        agreements.map((agreement: Agreement) => (
                            <Card key={agreement.id} className="p-6 hover:shadow-lg transition">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Left Column */}
                                    <div>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Agreement #{agreement.id}
                                                </h3>
                                                {agreement.case && (
                                                    <p className="text-sm text-gray-600">
                                                        Case: {agreement.case.title}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={`${getStatusColor(agreement.status)}`}>
                                                {agreement.status.charAt(0).toUpperCase() +
                                                    agreement.status.slice(1)}
                                            </Badge>
                                        </div>

                                        {/* Client Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <span className="font-medium">Client:</span>
                                                <span>{agreement.client.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={16} />
                                                <span>{agreement.client.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-3">
                                        {agreement.status === 'signed' && agreement.signed_at && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    Signature Details
                                                </p>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} />
                                                        <span>
                                                            Signed:{' '}
                                                            {new Date(agreement.signed_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {agreement.signer_name && (
                                                        <div>
                                                            <span className="text-gray-700">
                                                                Signer: {agreement.signer_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {agreement.signer_ip_address && (
                                                        <div>
                                                            <span className="text-gray-700 font-mono text-xs">
                                                                IP: {agreement.signer_ip_address}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Agreement Preview */}
                                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 max-h-24 overflow-y-auto">
                                    <p className="text-xs text-gray-600 line-clamp-3">
                                        {agreement.agreement_content}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {agreement.status === 'signed' && agreement.signature_image && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => viewSignature(agreement)}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye size={16} />
                                            View Signature
                                        </Button>
                                    )}
                                    {agreement.status === 'pending' && (
                                        <span className="text-sm text-yellow-700 font-medium">
                                            Awaiting client signature...
                                        </span>
                                    )}
                                    {agreement.status === 'declined' && (
                                        <span className="text-sm text-red-700 font-medium">
                                            Client declined this agreement
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
                                    <h2 className="text-2xl font-bold">Client Signature</h2>
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
                                            alt="Client Signature"
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
                                        <div>
                                            <p className="text-gray-600 font-medium">Signed Date & Time</p>
                                            <p className="text-gray-900">
                                                {selectedAgreement.signed_at &&
                                                    new Date(selectedAgreement.signed_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-medium">IP Address</p>
                                            <p className="text-gray-900 font-mono text-xs">
                                                {selectedAgreement.signer_ip_address}
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
