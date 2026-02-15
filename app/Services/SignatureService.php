<?php

namespace App\Services;

use App\Models\Agreement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Exception;

class SignatureService
{
    /**
     * Store a signature for an agreement
     */
    public function storeSignature(Agreement $agreement, array $data, Request $request): Agreement
    {
        try {
            // Extract signature data
            $signatureImage = $data['signature_image'] ?? null;
            $signerName = $data['signer_name'] ?? null;
            $signerEmail = $data['signer_email'] ?? null;

            if (!$signatureImage) {
                throw new Exception('Signature image is required');
            }

            // Process and save the signature image
            $signaturePath = $this->saveSignatureImage($signatureImage, $agreement->id);

            // Update agreement with signature details
            $agreement->update([
                'signature_image' => $signaturePath,
                'signer_name' => $signerName,
                'signer_email' => $signerEmail,
                'signer_ip_address' => $this->getClientIp($request),
                'signer_user_agent' => $request->userAgent(),
                'signature_timestamp' => now(),
                'signature_token' => Str::random(64),
                'status' => 'signed',
                'signed_at' => now(),
            ]);

            return $agreement;
        } catch (Exception $e) {
            \Log::error('Signature storage error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Save signature image from base64
     */
    private function saveSignatureImage(string $signatureData, int $agreementId): string
    {
        try {
            // Remove data URI prefix if present
            if (strpos($signatureData, 'data:image') === 0) {
                $signatureData = preg_replace('#^data:image/\w+;base64,#i', '', $signatureData);
            }

            // Decode base64
            $imageData = base64_decode($signatureData, true);

            if ($imageData === false) {
                throw new Exception('Invalid base64 signature data');
            }

            // Generate file name
            $fileName = "signatures/agreement_{$agreementId}_" . time() . '.png';

            // Store the image
            Storage::disk('public')->put($fileName, $imageData);

            return $fileName;
        } catch (Exception $e) {
            \Log::error('Signature image save error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get client IP address
     */
    private function getClientIp(Request $request): string
    {
        return $request->ip() ?? 'Unknown';
    }

    /**
     * Generate a verification code for signature
     */
    public function generateVerificationCode(Agreement $agreement): string
    {
        $code = Str::random(6);
        $agreement->update(['signature_token' => $code]);
        return $code;
    }

    /**
     * Verify signature integrity
     */
    public function verifySignature(Agreement $agreement, string $token): bool
    {
        return hash_equals($agreement->signature_token ?? '', $token);
    }

    /**
     * Get signature audit trail
     */
    public function getAuditTrail(Agreement $agreement): array
    {
        return [
            'signed_at' => $agreement->signed_at,
            'signer_name' => $agreement->signer_name,
            'signer_email' => $agreement->signer_email,
            'ip_address' => $agreement->signer_ip_address,
            'user_agent' => $agreement->signer_user_agent,
            'signature_timestamp' => $agreement->signature_timestamp,
            'status' => $agreement->status,
        ];
    }

    /**
     * Delete signature
     */
    public function deleteSignature(Agreement $agreement): bool
    {
        try {
            // Delete signature image file if exists
            if ($agreement->signature_image && Storage::disk('public')->exists($agreement->signature_image)) {
                Storage::disk('public')->delete($agreement->signature_image);
            }

            // Delete signed PDF if exists
            if ($agreement->signed_pdf_path && Storage::disk('public')->exists($agreement->signed_pdf_path)) {
                Storage::disk('public')->delete($agreement->signed_pdf_path);
            }

            // Reset signature fields
            $agreement->update([
                'signature_image' => null,
                'signer_name' => null,
                'signer_email' => null,
                'signer_ip_address' => null,
                'signer_user_agent' => null,
                'signature_timestamp' => null,
                'signature_token' => null,
                'signed_at' => null,
                'signed_pdf_path' => null,
                'status' => 'pending',
            ]);

            return true;
        } catch (Exception $e) {
            \Log::error('Signature deletion error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if agreement is signed
     */
    public function isSigned(Agreement $agreement): bool
    {
        return $agreement->status === 'signed' && !empty($agreement->signature_image);
    }

    /**
     * Download signature proof
     */
    public function getSignatureProof(Agreement $agreement): array
    {
        return [
            'agreement_id' => $agreement->id,
            'signed_at' => $agreement->signed_at->format('Y-m-d H:i:s'),
            'signer_name' => $agreement->signer_name,
            'signer_email' => $agreement->signer_email,
            'ip_address' => $agreement->signer_ip_address,
            'signature_token' => $agreement->signature_token,
            'signature_image_url' => Storage::disk('public')->url($agreement->signature_image),
        ];
    }
}
