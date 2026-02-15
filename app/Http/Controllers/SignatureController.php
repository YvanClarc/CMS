<?php

namespace App\Http\Controllers;

use App\Models\Agreement;
use App\Services\SignatureService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class SignatureController extends Controller
{
    protected SignatureService $signatureService;

    public function __construct(SignatureService $signatureService)
    {
        $this->signatureService = $signatureService;
    }

    /**
     * Get agreement details for signature
     */
    public function getAgreement(Agreement $agreement): JsonResponse
    {
        $this->authorize('view', $agreement);

        return response()->json([
            'id' => $agreement->id,
            'agreement_content' => $agreement->agreement_content,
            'status' => $agreement->status,
            'client_id' => $agreement->client_id,
            'signed_at' => $agreement->signed_at,
            'fee_arrangement' => $agreement->fee_arrangement,
            'is_signed' => $this->signatureService->isSigned($agreement),
        ]);
    }

    /**
     * Store signature for an agreement
     */
    public function store(Request $request, Agreement $agreement): JsonResponse
    {
        // Debug logging
        $user = auth()->user();
        \Log::info('Signature submission:', [
            'user_id' => $user?->id,
            'agreement_id' => $agreement->id,
            'agreement_client_id' => $agreement->client_id,
            'agreement_status' => $agreement->status,
            'user_role' => $user?->role,
        ]);

        try {
            $this->authorize('update', $agreement);
        } catch (\Illuminate\Auth\Access\AuthorizationException $ae) {
            \Log::warning('Authorization failed for signature:', [
                'user_id' => $user?->id,
                'agreement_id' => $agreement->id,
                'reason' => 'User not authorized to sign this agreement',
            ]);
            return response()->json([
                'message' => 'You are not authorized to sign this agreement. Make sure you are the correct client and the agreement is pending.',
                'error' => 'authorization_failed',
            ], 403);
        }

        try {
            // Validate input
            $validated = $request->validate([
                'signature_image' => 'required|string|min:100',
                'signer_name' => 'required|string|max:255',
                'signer_email' => 'required|email|max:255',
            ]);

            // Store signature
            $updatedAgreement = $this->signatureService->storeSignature(
                $agreement,
                $validated,
                $request
            );

            return response()->json([
                'message' => 'Signature stored successfully',
                'agreement' => $updatedAgreement,
                'signature_proof' => $this->signatureService->getSignatureProof($updatedAgreement),
            ], 200);
        } catch (ValidationException $e) {
            \Log::warning('Signature validation failed:', [
                'agreement_id' => $agreement->id,
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validation failed. Please check your input.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Signature storage error: ' . $e->getMessage(), [
                'agreement_id' => $agreement->id,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to store signature: ' . $e->getMessage(),
                'error' => 'storage_failed',
            ], 500);
        }
    }

    /**
     * Get signature details
     */
    public function show(Agreement $agreement): JsonResponse
    {
        $this->authorize('view', $agreement);

        if (!$this->signatureService->isSigned($agreement)) {
            return response()->json([
                'message' => 'Agreement has not been signed yet',
            ], 404);
        }

        return response()->json([
            'signature_proof' => $this->signatureService->getSignatureProof($agreement),
            'audit_trail' => $this->signatureService->getAuditTrail($agreement),
        ]);
    }

    /**
     * Revoke/delete signature
     */
    public function destroy(Agreement $agreement): JsonResponse
    {
        $this->authorize('update', $agreement);

        try {
            $this->signatureService->deleteSignature($agreement);

            return response()->json([
                'message' => 'Signature revoked successfully',
            ]);
        } catch (\Exception $e) {
            \Log::error('Signature deletion error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to revoke signature',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify signature integrity
     */
    public function verify(Request $request, Agreement $agreement): JsonResponse
    {
        $this->authorize('view', $agreement);

        try {
            $token = $request->input('token');

            if (!$token) {
                return response()->json([
                    'message' => 'Verification token is required',
                ], 422);
            }

            $isValid = $this->signatureService->verifySignature($agreement, $token);

            return response()->json([
                'is_valid' => $isValid,
                'message' => $isValid ? 'Signature is valid' : 'Signature verification failed',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Verification failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download signature as document
     */
    public function download(Agreement $agreement)
    {
        $this->authorize('view', $agreement);

        if (!$this->signatureService->isSigned($agreement)) {
            return response()->json([
                'message' => 'Agreement has not been signed yet',
            ], 404);
        }

        $signature = $agreement->signature_image;
        
        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($signature)) {
            return response()->json([
                'message' => 'Signature file not found',
            ], 404);
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download($signature);
    }
}
