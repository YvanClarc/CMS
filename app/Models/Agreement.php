<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Agreement extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_request_id',
        'case_id',
        'client_id',
        'status',
        'agreement_content',
        'fee_arrangement',
        'signed_at',
        'signed_document_path',
        'decline_reason',
        'declined_at',
        'signature_image',
        'signer_ip_address',
        'signer_user_agent',
        'signature_timestamp',
        'signer_name',
        'signer_email',
        'signature_token',
        'signed_pdf_path',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'declined_at' => 'datetime',
        'signature_timestamp' => 'datetime',
    ];

    /**
     * Get the case request associated with the agreement.
     */
    public function caseRequest()
    {
        return $this->belongsTo(CaseRequest::class);
    }

    /**
     * Get the legal case associated with the agreement.
     */
    public function case()
    {
        return $this->belongsTo(LegalCase::class);
    }

    /**
     * Get the client associated with the agreement.
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Check if the agreement is pending signature.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the agreement is signed.
     */
    public function isSigned(): bool
    {
        return $this->status === 'signed';
    }

    /**
     * Check if the agreement was declined.
     */
    public function isDeclined(): bool
    {
        return $this->status === 'declined';
    }

    /**
     * Check if agreement is signed with a valid signature.
     */
    public function hasValidSignature(): bool
    {
        return $this->status === 'signed' && !empty($this->signature_image);
    }

    /**
     * Get the signature audit trail.
     */
    public function getSignatureAuditTrail(): array
    {
        return [
            'signed_at' => $this->signed_at,
            'signer_name' => $this->signer_name,
            'signer_email' => $this->signer_email,
            'ip_address' => $this->signer_ip_address,
            'signature_timestamp' => $this->signature_timestamp,
        ];
    }

    /**
     * Get the signature image URL.
     */
    public function getSignatureImageUrl(): ?string
    {
        if (!$this->signature_image) {
            return null;
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->signature_image);
    }
}
