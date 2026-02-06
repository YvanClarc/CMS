<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseRequestDocument extends Model
{
    protected $fillable = [
        'case_request_id',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    public function caseRequest(): BelongsTo
    {
        return $this->belongsTo(CaseRequest::class);
    }
}
