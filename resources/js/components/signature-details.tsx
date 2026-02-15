import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Calendar, Mail, Globe, Download } from 'lucide-react';

interface SignatureProof {
    agreement_id: number;
    signed_at: string;
    signer_name: string;
    signer_email: string;
    ip_address: string;
    signature_token: string;
    signature_image_url: string;
}

interface SignatureDetailsProps {
    proof: SignatureProof;
    onDownload?: () => void;
    onRevoke?: () => Promise<void>;
    isRevoking?: boolean;
}

export const SignatureDetails: React.FC<SignatureDetailsProps> = ({
    proof,
    onDownload,
    onRevoke,
    isRevoking = false,
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="space-y-6 p-6 border rounded-lg bg-white">
            {/* Success Message */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-green-900">Document Successfully Signed</p>
                    <p className="text-sm text-green-800">Your signature has been recorded and verified</p>
                </div>
            </div>

            {/* Signature Image */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Your Signature</h3>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                        src={proof.signature_image_url}
                        alt="Signature"
                        className="w-full h-auto max-h-64 object-contain p-4"
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
            </div>

            {/* Signature Details */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Signature Details</h3>

                {/* Signer Name */}
                <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">📝</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Signer Name</p>
                        <p className="font-medium">{proof.signer_name}</p>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium">{proof.signer_email}</p>
                    </div>
                </div>

                {/* Signed At */}
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-gray-600">Signed Date & Time</p>
                        <p className="font-medium">{formatDateTime(proof.signed_at)}</p>
                    </div>
                </div>

                {/* IP Address */}
                <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-gray-600">IP Address (for audit trail)</p>
                        <p className="font-medium font-mono text-sm">{proof.ip_address}</p>
                    </div>
                </div>

                {/* Verification Token */}
                <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-green-600">✓</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Verification Token</p>
                        <p className="font-medium font-mono text-xs break-all">{proof.signature_token}</p>
                    </div>
                </div>
            </div>

            {/* Audit Trail Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">Audit Trail</h4>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Signature timestamp: {formatDateTime(proof.signed_at)}</li>
                    <li>Signer IP address: {proof.ip_address}</li>
                    <li>Verification token: {proof.signature_token.slice(0, 20)}...</li>
                    <li>Document cannot be modified after signing</li>
                </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                {onDownload && (
                    <Button
                        onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Download Signature
                    </Button>
                )}

                {onRevoke && (
                    <Button
                        variant="outline"
                        onClick={onRevoke}
                        disabled={isRevoking}
                        className="flex-1"
                    >
                        {isRevoking ? 'Revoking...' : 'Revoke Signature'}
                    </Button>
                )}
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Security Notice:</p>
                    <p>
                        This digital signature is legally binding. Keep your verification token
                        confidential. Share this proof only with authorized parties.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignatureDetails;
