<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CaseRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'notes',
        'case_category',
        'adverse_party_name',
        'adverse_party_email',
        'adverse_party_phone',
        'incident_date',
        'case_summary',
        'key_witnesses',
        'damages_objective',
        'has_existing_counsel',
        'fee_preference',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(CaseRequestDocument::class);
    }

    public function case(): HasOne
    {
        return $this->hasOne(LegalCase::class);
    }

    public function agreement(): HasOne
    {
        return $this->hasOne(Agreement::class);
    }
}
