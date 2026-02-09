<?php

namespace App\Http\Controllers;

use App\Models\Agreement;
use App\Models\CaseRequest;
use App\Models\LegalCase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaseRequestController extends Controller
{
    /**
     * Display all pending case requests for admin review.
     */
    public function index()
    {
        $caseRequests = CaseRequest::where('status', 'pending')
            ->with(['user', 'documents'])
            ->orderBy('created_at', 'desc')
            ->get();

        $cases = LegalCase::with(['caseRequest', 'client', 'assignedLawyer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/case-requests', [
            'caseRequests' => $caseRequests,
            'cases' => $cases,
        ]);
    }

    /**
     * Display a single case request for detailed review.
     */
    public function show(CaseRequest $caseRequest)
    {
        $caseRequest->load(['user', 'documents']);

        return Inertia::render('admin/case-request-detail', [
            'caseRequest' => $caseRequest,
        ]);
    }

    /**
     * Accept a case request and create a retainer agreement for client signature.
     */
    public function accept(Request $request, CaseRequest $caseRequest)
    {
        // Ensure only admins can accept case requests
        if (!auth()->user()->isAdmin()) {
            return back()->with('error', 'Unauthorized');
        }

        // Validate the request
        $validated = $request->validate([
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string|max:1000',
            'agreement_content' => 'nullable|string',
        ]);

        // Create the legal case record with pending_agreement status
        $case = LegalCase::create([
            'case_request_id' => $caseRequest->id,
            'client_id' => $caseRequest->user_id,
            'title' => $caseRequest->title,
            'description' => $caseRequest->description,
            'status' => 'pending_agreement',
            'assigned_to' => $validated['assigned_to'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Create the agreement record with pending status
        // Use the client's fee preference from the case request
        $agreement = Agreement::create([
            'case_request_id' => $caseRequest->id,
            'case_id' => $case->id,
            'client_id' => $caseRequest->user_id,
            'status' => 'pending',
            'fee_arrangement' => $caseRequest->fee_preference,
            'agreement_content' => $validated['agreement_content'] ?? $this->generateDefaultRetainerAgreement($caseRequest),
        ]);

        // Keep the case request status as pending (not in_progress)
        $caseRequest->update([
            'status' => 'pending',
            'notes' => 'AWAITING AGREEMENT SIGNATURE: Retainer agreement sent to client for review and signature.',
        ]);

        return back()->with('success', 'Retainer agreement sent to client! Case status will update once agreement is signed.');
    }

    /**
     * Reject a case request.
     */
    public function reject(Request $request, CaseRequest $caseRequest)
    {
        // Ensure only admins can reject case requests
        if (!auth()->user()->isAdmin()) {
            return back()->with('error', 'Unauthorized');
        }

        // Validate the request
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        // Update the case request status to closed with rejection reason
        $caseRequest->update([
            'status' => 'closed',
            'notes' => 'REJECTED: ' . $validated['rejection_reason'],
        ]);

        return back()->with('success', 'Case request rejected successfully!');
    }

    /**
     * Request more information from the client.
     */
    public function requestInfo(Request $request, CaseRequest $caseRequest)
    {
        // Ensure only admins can request info
        if (!auth()->user()->isAdmin()) {
            return back()->with('error', 'Unauthorized');
        }

        // Validate the request
        $validated = $request->validate([
            'highlighted_fields' => 'required|array|min:1',
            'highlighted_fields.*' => 'string|in:case_summary,adverse_party_email,adverse_party_phone,key_witnesses,damages_objective',
            'message' => 'nullable|string|max:1000',
        ]);

        // Store the request info details
        $fieldLabels = [
            'case_summary' => 'Case Summary',
            'adverse_party_email' => 'Adverse Party Email',
            'adverse_party_phone' => 'Adverse Party Phone',
            'key_witnesses' => 'Key Witnesses',
            'damages_objective' => 'Damages/Objectives',
        ];

        $highlightedFieldNames = array_map(function($field) use ($fieldLabels) {
            return $fieldLabels[$field] ?? $field;
        }, $validated['highlighted_fields']);

        $notes = "INFO REQUESTED: The following fields need clarification:\n- " . implode("\n- ", $highlightedFieldNames);
        if (!empty($validated['message'])) {
            $notes .= "\n\nAdmin Message: " . $validated['message'];
        }

        // Update case request with pending status and add notes
        $caseRequest->update([
            'status' => 'pending',
            'notes' => $notes,
        ]);

        return back()->with('success', 'Information request sent to client! They can now update their submission and provide evidence.');
    }

    /**
     * Decline a case request (non-engagement).
     */
    public function decline(Request $request, CaseRequest $caseRequest)
    {
        // Ensure only admins can decline case requests
        if (!auth()->user()->isAdmin()) {
            return back()->with('error', 'Unauthorized');
        }

        // Validate the request
        $validated = $request->validate([
            'decline_reason' => 'required|string|max:1000',
        ]);

        // Update the case request status to closed with decline reason
        $caseRequest->update([
            'status' => 'closed',
            'notes' => "DECLINED - NON-ENGAGEMENT LETTER SENT:\n\n" . $validated['decline_reason'],
        ]);

        return back()->with('success', 'Non-engagement letter sent successfully! Case request declined.');
    }

    /**
     * Sign the retainer agreement (client action).
     */
    public function signAgreement(Request $request, Agreement $agreement)
    {
        // Ensure only the client can sign their own agreement
        if (auth()->user()->id !== $agreement->client_id) {
            return back()->with('error', 'Unauthorized');
        }

        // Validate the request
        $validated = $request->validate([
            'signed_document_path' => 'nullable|string',
        ]);

        // Update the agreement status to signed
        $agreement->update([
            'status' => 'signed',
            'signed_at' => now(),
            'signed_document_path' => $validated['signed_document_path'] ?? null,
        ]);

        // Update the associated case request status to in_progress
        $agreement->caseRequest->update([
            'status' => 'in_progress',
            'notes' => 'Agreement signed by client. Case is now active.',
        ]);

        // Update the legal case status to active
        if ($agreement->case) {
            $agreement->case->update([
                'status' => 'active',
            ]);
        }

        return back()->with('success', 'Agreement signed successfully! Your case is now active.');
    }

    /**
     * Decline the retainer agreement (client action).
     */
    public function declineAgreement(Request $request, Agreement $agreement)
    {
        // Ensure only the client can decline their own agreement
        if (auth()->user()->id !== $agreement->client_id) {
            return back()->with('error', 'Unauthorized');
        }

        // Validate the request
        $validated = $request->validate([
            'decline_reason' => 'required|string|max:500',
        ]);

        // Update the agreement status to declined
        $agreement->update([
            'status' => 'declined',
            'declined_at' => now(),
            'decline_reason' => $validated['decline_reason'],
        ]);

        // Update the associated case request status to closed
        $agreement->caseRequest->update([
            'status' => 'closed',
            'notes' => 'Agreement declined by client: ' . $validated['decline_reason'],
        ]);

        return back()->with('success', 'Agreement declined. We appreciate your consideration.');
    }

    /**
     * Generate a default retainer agreement based on case details.
     */
    private function generateDefaultRetainerAgreement(CaseRequest $caseRequest): string
    {
        $client = $caseRequest->user;
        $today = now()->format('F d, Y');

        return <<<EOT
RETAINER AGREEMENT

This Retainer Agreement ("Agreement") is entered into on {$today} between our law firm (hereinafter "Attorney") and {$client->name} (hereinafter "Client").

WHEREAS, the Client desires to retain the Attorney to provide legal representation concerning the following matter:

CASE MATTER:
{$caseRequest->title}

CASE SUMMARY:
{$caseRequest->case_summary}

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

1. SCOPE OF REPRESENTATION
The Attorney agrees to represent the Client in connection with the above-described matter. The scope of representation includes all matters relating to the case as outlined above.

2. FEES AND COSTS
The Client agrees to pay the Attorney for services rendered. The fee arrangement is as follows:
- Fee Type: As agreed upon during consultation
- Client is responsible for all out-of-pocket costs and expenses incurred in connection with the representation.

3. COMMUNICATION
The Client agrees to maintain regular communication with the Attorney and to promptly provide all necessary documents, information, and instructions needed for effective representation.

4. TERMINATION
Either party may terminate this Agreement with written notice. Upon termination, the Client shall pay for all services rendered and costs incurred up to the date of termination.

5. CONFIDENTIALITY
All communications between the Client and Attorney are protected by attorney-client privilege and shall remain confidential.

BY SIGNING BELOW, BOTH PARTIES ACKNOWLEDGE THAT THEY HAVE READ, UNDERSTOOD, AND AGREE TO THE TERMS OF THIS RETAINER AGREEMENT.

Client Name (Print): _______________________________

Client Signature: _________________________________ Date: _________

Attorney: _______________________________________ Date: _________
EOT;
    }
}
