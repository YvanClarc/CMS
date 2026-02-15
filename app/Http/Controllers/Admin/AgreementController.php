<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agreement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgreementController extends Controller
{
    /**
     * Display a listing of all agreements.
     */
    public function index()
    {
        $this->authorize('viewAny', Agreement::class);

        $agreements = Agreement::with(['client', 'case'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($agreement) {
                return [
                    'id' => $agreement->id,
                    'case_id' => $agreement->case_id,
                    'client_id' => $agreement->client_id,
                    'status' => $agreement->status,
                    'agreement_content' => $agreement->agreement_content,
                    'signed_at' => $agreement->signed_at,
                    'signer_name' => $agreement->signer_name,
                    'signer_email' => $agreement->signer_email,
                    'signature_image' => $agreement->signature_image,
                    'signer_ip_address' => $agreement->signer_ip_address,
                    'signature_timestamp' => $agreement->signature_timestamp,
                    'client' => [
                        'id' => $agreement->client->id,
                        'name' => $agreement->client->name,
                        'email' => $agreement->client->email,
                    ],
                    'case' => $agreement->case ? [
                        'id' => $agreement->case->id,
                        'title' => $agreement->case->title ?? 'Untitled Case',
                    ] : null,
                ];
            });

        return Inertia::render('admin/agreements', [
            'agreements' => $agreements,
        ]);
    }

    /**
     * Display a single agreement.
     */
    public function show(Agreement $agreement)
    {
        $this->authorize('view', $agreement);

        return Inertia::render('admin/agreement-detail', [
            'agreement' => $agreement->load(['client', 'case']),
        ]);
    }
}
