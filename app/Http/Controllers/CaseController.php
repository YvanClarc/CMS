<?php

namespace App\Http\Controllers;

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

        return Inertia::render('client/cases', [
            'cases' => $cases,
        ]);
    }

    /**
     * Store a newly created case request in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
        ]);

        $case = CaseRequest::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
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
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
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
