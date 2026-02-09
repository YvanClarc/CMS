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
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'declined_at' => 'datetime',
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
}
