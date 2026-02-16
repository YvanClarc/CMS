<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Agreement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgreementController extends Controller
{
    /**
     * Display a listing of client's agreements.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $agreements = Agreement::where('client_id', $userId)
            ->with(['case'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($agreement) {
                return [
                    'id' => $agreement->id,
                    'case_id' => $agreement->case_id,
                    'status' => $agreement->status,
                    'agreement_content' => $agreement->agreement_content,
                    'signed_at' => $agreement->signed_at,
                    'signer_name' => $agreement->signer_name,
                    'signer_email' => $agreement->signer_email,
            'signature_image' => $agreement->signature_image,
                    'signer_ip_address' => $agreement->signer_ip_address,
                    'signature_timestamp' => $agreement->signature_timestamp,
                    'case' => $agreement->case ? [
                        'id' => $agreement->case->id,
                        'title' => $agreement->case->title ?? 'Untitled Case',
                    ] : null,
                ];
            });

        return Inertia::render('client/agreements', [
            'agreements' => $agreements,
        ]);
    }

    /**
     * Display a specific agreement.
     */
    public function show(Agreement $agreement, Request $request)
    {
        $this->authorize('view', $agreement);

        return Inertia::render('agreement-signing-page', [
            'agreementId' => $agreement->id,
            'agreementContent' => $agreement->agreement_content,
            'status' => $agreement->status,
            'isSigned' => $agreement->status === 'signed',
        ]);
    }
}
