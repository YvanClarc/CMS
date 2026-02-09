<?php

namespace App\Http\Controllers;

use App\Models\Agreement;
use App\Models\CaseRequest;
use App\Models\CaseRequestDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CaseController extends Controller
{
    /**
     * Display all case requests for the authenticated client.
     */
    public function index()
    {
        $cases = CaseRequest::where('user_id', auth()->id())
            ->with('documents')
            ->orderBy('created_at', 'desc')
            ->get();

        $agreements = Agreement::where('client_id', auth()->id())
            ->with('caseRequest')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('client/cases', [
            'cases' => $cases,
            'agreements' => $agreements,
        ]);
    }

    /**
     * Store a newly created case request in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Basics
            'title' => 'required|string|max:255',
            'case_category' => 'required|string|in:labor_dispute,family_law,debt_collection,criminal_defense,contract_dispute,personal_injury,real_estate,other',
            'adverse_party_name' => 'required|string|max:255',
            'adverse_party_email' => 'nullable|email',
            'adverse_party_phone' => 'nullable|string|max:20',
            'incident_date' => 'required|date|before_or_equal:today',
            
            // Narrative & Facts
            'case_summary' => 'required|string|min:50',
            'description' => 'required|string|min:10',
            'key_witnesses' => 'nullable|string',
            'damages_objective' => 'required|string|max:500',
            
            // Administrative/Financial
            'has_existing_counsel' => 'boolean',
            'fee_preference' => 'required|string|in:contingency,hourly,flat_fee',
        ]);

        $case = CaseRequest::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'case_category' => $validated['case_category'],
            'adverse_party_name' => $validated['adverse_party_name'],
            'adverse_party_email' => $validated['adverse_party_email'] ?? null,
            'adverse_party_phone' => $validated['adverse_party_phone'] ?? null,
            'incident_date' => $validated['incident_date'],
            'case_summary' => $validated['case_summary'],
            'description' => $validated['description'],
            'key_witnesses' => $validated['key_witnesses'] ?? null,
            'damages_objective' => $validated['damages_objective'],
            'has_existing_counsel' => $validated['has_existing_counsel'] ?? false,
            'fee_preference' => $validated['fee_preference'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Case request submitted successfully! Admin will review it shortly.');
    }

    /**
     * Update the specified case request in storage.
     */
    public function update(Request $request, CaseRequest $case)
    {
        // Ensure client can only update their own case requests
        if ($case->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            // Basics
            'title' => 'required|string|max:255',
            'case_category' => 'required|string|in:labor_dispute,family_law,debt_collection,criminal_defense,contract_dispute,personal_injury,real_estate,other',
            'adverse_party_name' => 'required|string|max:255',
            'adverse_party_email' => 'nullable|email',
            'adverse_party_phone' => 'nullable|string|max:20',
            'incident_date' => 'required|date|before_or_equal:today',
            
            // Narrative & Facts
            'case_summary' => 'required|string|min:50',
            'description' => 'required|string|min:10',
            'key_witnesses' => 'nullable|string',
            'damages_objective' => 'required|string|max:500',
            
            // Administrative/Financial
            'has_existing_counsel' => 'boolean',
            'fee_preference' => 'required|string|in:contingency,hourly,flat_fee',
        ]);

        $case->update($validated);

        return back()->with('success', 'Case request updated successfully!');
    }

    /**
     * Delete the specified case request from storage.
     */
    public function destroy(CaseRequest $case)
    {
        // Ensure client can only delete their own case requests
        if ($case->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete all documents associated with the case request
        foreach ($case->documents as $document) {
            Storage::disk('public')->delete($document->file_path);
            $document->delete();
        }

        $case->delete();

        return back()->with('success', 'Case request deleted successfully!');
    }

    /**
     * Upload a document for a case request.
     */
    public function uploadDocument(Request $request, CaseRequest $case)
    {
        // Ensure client can only upload documents for their own case requests
        if ($case->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Validate the request
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'document' => 'required|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,xlsx,xls',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first('document')], 422);
        }

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $path = $file->store("case-requests/{$case->id}", 'public');

            CaseRequestDocument::create([
                'case_request_id' => $case->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);

            return response()->json(['success' => 'Document uploaded successfully!'], 200);
        }

        return response()->json(['error' => 'Failed to upload document.'], 400);
    }

    /**
     * Delete a document from a case request.
     */
    public function deleteDocument(CaseRequest $case, CaseRequestDocument $document)
    {
        // Ensure client can only delete documents from their own case requests
        if ($case->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete file from storage
        Storage::disk('public')->delete($document->file_path);

        $document->delete();

        return response()->json(['success' => 'Document deleted successfully!'], 200);
    }
}
