<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LegalCase extends Model
{
    use HasFactory;

    protected $table = 'cases';

    protected $fillable = [
        'case_request_id',
        'client_id',
        'title',
        'description',
        'status',
        'assigned_to',
        'notes',
    ];

    public function caseRequest(): BelongsTo
    {
        return $this->belongsTo(CaseRequest::class, 'case_request_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function assignedLawyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function agreement(): HasOne
    {
        return $this->hasOne(Agreement::class, 'case_id');
    }
}
