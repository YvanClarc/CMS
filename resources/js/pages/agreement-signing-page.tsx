import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import SignaturePad from '@/components/signature-pad';
import SignatureDetails from '@/components/signature-details';
import useSignature from '@/hooks/use-signature';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AgreementSigningPageProps {
    agreementId: number;
    agreementContent: string;
    status: 'pending' | 'signed' | 'declined';
    isSigned: boolean;
}

export const AgreementSigningPage: React.FC<AgreementSigningPageProps> = ({
    agreementId,
    agreementContent,
    status,
    isSigned: initialIsSigned,
}) => {
    const { props } = usePage<{ auth?: { user?: User } }>();
    const user = props.auth?.user;

    const {
        signature,
        loading,
        error,
        submitSignature,
        fetchSignature,
        downloadSignature,
        revokeSignature,
    } = useSignature(agreementId);

    const [isSigned, setIsSigned] = useState(initialIsSigned);
    const [showError, setShowError] = useState(error);

    // Fetch signature if already signed
    useEffect(() => {
        if (isSigned) {
            fetchSignature().catch(console.error);
        }
    }, []);

    const handleSignatureCapture = async (
        signatureImage: string,
        signerName: string,
        signerEmail: string
    ) => {
        try {
            await submitSignature(signatureImage, signerName, signerEmail);
            setIsSigned(true);
            setShowError(null);
        } catch (err) {
            setShowError(error || 'Failed to submit signature');
        }
    };

    const handleDownload = async () => {
        try {
            await downloadSignature();
        } catch (err) {
            setShowError('Failed to download signature');
        }
    };

    const handleRevoke = async () => {
        if (confirm('Are you sure you want to revoke your signature? This action cannot be undone.')) {
            try {
                await revokeSignature();
                setIsSigned(false);
                setShowError(null);
            } catch (err) {
                setShowError('Failed to revoke signature');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Agreement Signature
                    </h1>
                    <p className="text-gray-600">
                        Please review and sign this agreement
                    </p>
                </div>

                {/* Error Message */}
                {showError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            <strong>Error:</strong> {showError}
                        </p>
                    </div>
                )}

                {/* Agreement Content */}
                <div className="mb-8 p-6 bg-white border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Agreement Details</h2>
                    <div className="prose prose-sm max-w-none">
                        <div
                            className="text-gray-700 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: agreementContent }}
                        />
                    </div>
                </div>

                {/* Signature Section */}
                {isSigned && signature ? (
                    <SignatureDetails
                        proof={signature}
                        onDownload={handleDownload}
                        onRevoke={handleRevoke}
                        isRevoking={loading}
                    />
                ) : (
                    <SignaturePad
                        onSignatureCapture={handleSignatureCapture}
                        isLoading={loading}
                        defaultName={user?.name || ''}
                        defaultEmail={user?.email || ''}
                    />
                )}

                {/* Status Badge */}
                <div className="mt-8 text-center">
                    <div className="inline-block px-4 py-2 rounded-full">
                        {isSigned ? (
                            <span className="text-green-800 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                                ✓ Signed
                            </span>
                        ) : (
                            <span className="text-amber-800 bg-amber-100 px-3 py-1 rounded-full text-sm font-medium">
                                ⏳ Pending Signature
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgreementSigningPage;
