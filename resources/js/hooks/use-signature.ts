import { useState } from 'react';
import { usePage } from '@inertiajs/react';

interface SignatureProof {
    agreement_id: number;
    signed_at: string;
    signer_name: string;
    signer_email: string;
    ip_address: string;
    signature_token: string;
    signature_image_url: string;
}

interface UseSignatureOptions {
    onSuccess?: (proof: SignatureProof) => void;
    onError?: (error: string) => void;
}

export function useSignature(agreementId: number, options?: UseSignatureOptions) {
    const { props } = usePage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [signature, setSignature] = useState<SignatureProof | null>(null);

    const submitSignature = async (
        signatureImage: string,
        signerName: string,
        signerEmail: string
    ) => {
        setLoading(true);
        setError(null);

        try {
            // Log the signature data size for debugging
            console.log('Submitting signature:', {
                imageSize: signatureImage.length,
                signerName,
                signerEmail,
                agreementId,
            });

            const response = await fetch(
                `/client/agreements/${agreementId}/signature`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector(
                            'meta[name="csrf-token"]'
                        ) as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify({
                        signature_image: signatureImage,
                        signer_name: signerName,
                        signer_email: signerEmail,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error('Signature submission error:', {
                    status: response.status,
                    message: data.message,
                    errors: data.errors,
                });
                throw new Error(data.message || 'Failed to submit signature');
            }

            setSignature(data.signature_proof);

            if (options?.onSuccess) {
                options.onSuccess(data.signature_proof);
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Signature submission failed:', errorMessage);
            setError(errorMessage);

            if (options?.onError) {
                options.onError(errorMessage);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchSignature = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/client/agreements/${agreementId}/signature/verify`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector(
                            'meta[name="csrf-token"]'
                        ) as HTMLMetaElement)?.content || '',
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch signature');
            }

            const data = await response.json();
            setSignature(data.signature_proof);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);

            if (options?.onError) {
                options.onError(errorMessage);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const verifySignature = async (token: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/client/agreements/${agreementId}/signature/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector(
                            'meta[name="csrf-token"]'
                        ) as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify({ token }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to verify signature');
            }

            const data = await response.json();
            return data.is_valid;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);

            if (options?.onError) {
                options.onError(errorMessage);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const downloadSignature = async () => {
        try {
            const response = await fetch(
                `/client/agreements/${agreementId}/signature/download`,
                {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': (document.querySelector(
                            'meta[name="csrf-token"]'
                        ) as HTMLMetaElement)?.content || '',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to download signature');
            }

            // Create blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `signature-${agreementId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);

            if (options?.onError) {
                options.onError(errorMessage);
            }

            throw err;
        }
    };

    const revokeSignature = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/client/agreements/${agreementId}/signature`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector(
                            'meta[name="csrf-token"]'
                        ) as HTMLMetaElement)?.content || '',
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to revoke signature');
            }

            setSignature(null);

            if (options?.onSuccess) {
                options.onSuccess(null as any);
            }

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);

            if (options?.onError) {
                options.onError(errorMessage);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        signature,
        loading,
        error,
        submitSignature,
        fetchSignature,
        verifySignature,
        downloadSignature,
        revokeSignature,
    };
}

export default useSignature;
