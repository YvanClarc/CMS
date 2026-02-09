import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, FileText, AlertCircle, Eye, Download, HelpCircle, Ban } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CaseDocument {
    id: number;
    file_name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface CaseRequest {
    id: number;
    title: string;
    description: string;
    case_category?: string;
    adverse_party_name?: string;
    adverse_party_email?: string;
    adverse_party_phone?: string;
    incident_date?: string;
    case_summary?: string;
    key_witnesses?: string;
    damages_objective?: string;
    has_existing_counsel?: boolean;
    fee_preference?: string;
    status: string;
    notes?: string;
    created_at: string;
    user: User;
    documents: CaseDocument[];
}

interface LegalCase {
    id: number;
    title: string;
    description: string;
    status: string;
    notes?: string;
    created_at: string;
    case_request_id?: number;
    client_id?: number;
    assigned_to?: number;
    caseRequest?: CaseRequest;
    client?: User;
    assignedLawyer?: User;
}

interface Props {
    caseRequests: CaseRequest[];
    cases: LegalCase[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Case Requests',
        href: '#',
    },
];

export default function CaseRequests({ caseRequests: initialCaseRequests, cases: initialCases }: Props) {
    const [caseRequests, setCaseRequests] = useState<CaseRequest[]>(initialCaseRequests);
    const [cases, setCases] = useState<LegalCase[]>(initialCases);
    const [selectedRequest, setSelectedRequest] = useState<CaseRequest | null>(null);
    const [action, setAction] = useState<'view' | 'accept' | 'request-info' | 'decline' | null>(null);
    const [notes, setNotes] = useState('');
    const [declineReason, setDeclineReason] = useState('');
    const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
    const [infoRequestMessage, setInfoRequestMessage] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [agreementContent, setAgreementContent] = useState('');

    const infoFields = [
        'case_summary',
        'adverse_party_email',
        'adverse_party_phone',
        'key_witnesses',
        'damages_objective',
    ];

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleAccept = () => {
        if (!selectedRequest) return;

        router.post(`/admin/case-requests/${selectedRequest.id}/accept`, { 
            notes,
            agreement_content: agreementContent || undefined,
        }, {
            onSuccess: () => {
                setSelectedRequest(null);
                setAction(null);
                setNotes('');
                setAgreementContent('');
            },
        });
    };

    const handleRequestInfo = () => {
        if (!selectedRequest) return;

        if (highlightedFields.length === 0) {
            setNotification({ type: 'error', message: 'Please select at least one field to highlight' });
            return;
        }

        router.post(`/admin/case-requests/${selectedRequest.id}/request-info`, { 
            highlighted_fields: highlightedFields,
            message: infoRequestMessage,
        }, {
            onSuccess: () => {
                setSelectedRequest(null);
                setAction(null);
                setHighlightedFields([]);
                setInfoRequestMessage('');
            },
        });
    };

    const handleDecline = () => {
        if (!selectedRequest) return;

        if (!declineReason.trim()) {
            setNotification({ type: 'error', message: 'Please provide a decline reason' });
            return;
        }

        router.post(`/admin/case-requests/${selectedRequest.id}/decline`, { 
            decline_reason: declineReason,
        }, {
            onSuccess: () => {
                setSelectedRequest(null);
                setAction(null);
                setDeclineReason('');
            },
        });
    };

    const toggleFieldHighlight = (field: string) => {
        setHighlightedFields(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Case Requests" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header */}
                <div className="animate-slide-up">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Case Requests</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Review and manage client case requests</p>
                </div>

                {/* Notification */}
                {notification && (
                    <Alert className={notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                        <AlertCircle className={notification.type === 'success' ? 'text-green-600' : 'text-red-600'} />
                        <AlertDescription className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                            {notification.message}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="pending">Pending Requests {caseRequests.length > 0 && `(${caseRequests.length})`}</TabsTrigger>
                        <TabsTrigger value="existing">Existing Cases {cases.length > 0 && `(${cases.length})`}</TabsTrigger>
                    </TabsList>

                    {/* Pending Requests Tab */}
                    <TabsContent value="pending" className="mt-6">
                        {/* Case Requests List */}
                        {caseRequests.length === 0 ? (
                            <Card className="border-slate-200 dark:border-slate-700">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <CheckCircle2 className="mb-4 size-12 text-green-600" />
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">No pending case requests</p>
                                    <p className="mt-1 text-slate-600 dark:text-slate-400">All case requests have been reviewed</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                        {caseRequests.map((request) => (
                            <Card key={request.id} className="border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{request.title}</h3>
                                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="font-medium">From:</span> {request.user.name} ({request.user.email})
                                            </p>
                                            <p className="mt-2 text-slate-700 dark:text-slate-300">{request.description}</p>
                                            
                                            {/* Documents */}
                                            {request.documents.length > 0 && (
                                                <div className="mt-4 flex items-center gap-2">
                                                    <FileText size={18} className="text-slate-500" />
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                        {request.documents.length} document{request.documents.length !== 1 ? 's' : ''} attached
                                                    </span>
                                                </div>
                                            )}

                                            <p className="mt-3 text-xs text-slate-500">
                                                Submitted on {new Date(request.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setAction('view');
                                                }}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Eye size={16} className="mr-1" />
                                                View Details
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setAction('accept');
                                                }}
                                                className="bg-green-600 hover:bg-green-700"
                                                size="sm"
                                            >
                                                <CheckCircle2 size={16} className="mr-1" />
                                                Accept & Retain
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setAction('request-info');
                                                }}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                <HelpCircle size={16} className="mr-1" />
                                                Request Info
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setAction('decline');
                                                }}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <Ban size={16} className="mr-1" />
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Existing Cases Tab */}
                    <TabsContent value="existing" className="mt-6">
                        {cases.length === 0 ? (
                            <Card className="border-slate-200 dark:border-slate-700">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <FileText className="mb-4 size-12 text-slate-400" />
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">No existing cases</p>
                                    <p className="mt-1 text-slate-600 dark:text-slate-400">No official cases have been created yet</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {cases.map((legalCase) => (
                                    <Card key={legalCase.id} className="border-slate-200 dark:border-slate-700">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{legalCase.title}</h3>
                                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                                                            legalCase.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : legalCase.status === 'closed'
                                                                ? 'bg-slate-100 text-slate-800'
                                                                : legalCase.status === 'on_hold'
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-slate-100 text-slate-800'
                                                        }`}>
                                                            {legalCase.status}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                        <span className="font-medium">Client:</span> {legalCase.client?.name} ({legalCase.client?.email})
                                                    </p>
                                                    {legalCase.assignedLawyer && (
                                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                            <span className="font-medium">Assigned Lawyer:</span> {legalCase.assignedLawyer.name}
                                                        </p>
                                                    )}
                                                    <p className="mt-2 text-slate-700 dark:text-slate-300">{legalCase.description}</p>
                                                    {legalCase.notes && (
                                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                                            <span className="font-medium">Notes:</span> {legalCase.notes}
                                                        </p>
                                                    )}
                                                    <p className="mt-3 text-xs text-slate-500">
                                                        Created on {new Date(legalCase.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* View Details Dialog */}
            <Dialog open={action === 'view'} onOpenChange={(open) => !open && (setSelectedRequest(null), setAction(null))}>
                <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Case Request Details</DialogTitle>
                        <DialogDescription>Full information about the case request</DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 px-6">
                        {selectedRequest && (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Title</p>
                                            <p className="text-slate-900 dark:text-white mt-1">{selectedRequest.title}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Category</p>
                                            <p className="text-slate-900 dark:text-white mt-1 capitalize">{selectedRequest.case_category?.replace('_', ' ')}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Client</p>
                                            <p className="text-slate-900 dark:text-white mt-1">{selectedRequest.user.name}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Email</p>
                                            <p className="text-slate-900 dark:text-white mt-1">{selectedRequest.user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Adverse Party */}
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Adverse Party</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</p>
                                            <p className="text-slate-900 dark:text-white mt-1">{selectedRequest.adverse_party_name || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Email</p>
                                            <p className="text-slate-900 dark:text-white mt-1">{selectedRequest.adverse_party_email || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Phone</p>
                                            <p className="text-slate-900 dark:text-white mt-1">{selectedRequest.adverse_party_phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Case Details */}
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Case Details</h3>
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Summary</p>
                                            <p className="text-slate-900 dark:text-white mt-1 break-words">{selectedRequest.case_summary || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</p>
                                            <p className="text-slate-900 dark:text-white mt-1 break-words">{selectedRequest.description || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Witnesses</p>
                                            <p className="text-slate-900 dark:text-white mt-1 break-words">{selectedRequest.key_witnesses || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Damages/Objectives</p>
                                            <p className="text-slate-900 dark:text-white mt-1 break-words">{selectedRequest.damages_objective || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Administrative */}
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Administrative</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Existing Counsel</p>
                                            <p className="text-slate-900 dark:text-white mt-1">{selectedRequest.has_existing_counsel ? 'Yes' : 'No'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Fee Preference</p>
                                            <p className="text-slate-900 dark:text-white mt-1 capitalize">{selectedRequest.fee_preference?.replace('_', ' ') || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                {selectedRequest.documents.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Attached Documents</h3>
                                        <div className="space-y-2">
                                            {selectedRequest.documents.map(doc => (
                                                <div key={doc.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{doc.file_name}</p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400">{(doc.file_size / 1024).toFixed(2)} KB</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <Download size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <Button variant="outline" onClick={() => {
                            setSelectedRequest(null);
                            setAction(null);
                        }}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Accept & Retain Dialog - Retainer Agreement */}
            <Dialog open={action === 'accept'} onOpenChange={(open) => !open && (setSelectedRequest(null), setAction(null), setNotes(''), setAgreementContent(''))}>
                <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Accept & Retain Case - Retainer Agreement</DialogTitle>
                        <DialogDescription>Generate a retainer agreement for the client to sign</DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 px-6">
                        <div className="space-y-4">
                            {selectedRequest && (
                                <>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            <strong>Case:</strong> {selectedRequest.title}
                                        </p>
                                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                            <strong>Client:</strong> {selectedRequest.user.name}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">RETAINER AGREEMENT</h4>
                                        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3">
                                            <p>
                                                This Retainer Agreement ("Agreement") is entered into as of {new Date().toLocaleDateString()} between the Law Firm and {selectedRequest.user.name} ("Client").
                                            </p>
                                            <p>
                                                <strong>Case Matter:</strong> {selectedRequest.title}
                                            </p>
                                            <p>
                                                <strong>Fee Arrangement:</strong> {selectedRequest.fee_preference?.replace('_', ' ')}
                                            </p>
                                            <p>
                                                The Client hereby retains the Law Firm to provide legal services for the above-named matter. The Client agrees to:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Pay all agreed fees and costs for legal services</li>
                                                <li>Provide all necessary documents and information</li>
                                                <li>Respond timely to attorney communications</li>
                                                <li>Keep the Law Firm informed of any case developments</li>
                                            </ul>
                                            <p className="pt-3 border-t border-slate-300 dark:border-slate-600">
                                                The Law Firm agrees to provide competent and professional legal representation in accordance with applicable rules of professional conduct.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                            Agreement Content (Optional - uses default if blank)
                                        </label>
                                        <Textarea
                                            placeholder="Customize the agreement content if needed..."
                                            value={agreementContent}
                                            onChange={(e) => setAgreementContent(e.target.value)}
                                            rows={4}
                                            className="bg-white dark:bg-slate-800"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                            Internal Notes (Optional)
                                        </label>
                                        <Textarea
                                            placeholder="Add internal notes about this case..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <Button variant="outline" onClick={() => {
                            setSelectedRequest(null);
                            setAction(null);
                            setNotes('');
                            setAgreementContent('');
                        }}>
                            Cancel
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleAccept}>
                            Send Agreement & Create Case
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request More Info Dialog */}
            <Dialog open={action === 'request-info'} onOpenChange={(open) => !open && (setSelectedRequest(null), setAction(null), setHighlightedFields([]))}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Additional Information</DialogTitle>
                        <DialogDescription>Select fields that need more information and optionally add a message</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedRequest && (
                            <>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedRequest.title}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">From: {selectedRequest.user.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                                        Select Fields to Highlight
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <input
                                                type="checkbox"
                                                checked={highlightedFields.includes('case_summary')}
                                                onChange={() => toggleFieldHighlight('case_summary')}
                                                className="w-4 h-4"
                                            />
                                            <span className="ml-3 text-slate-900 dark:text-white">Case Summary - needs more detail</span>
                                        </label>
                                        <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <input
                                                type="checkbox"
                                                checked={highlightedFields.includes('adverse_party_email')}
                                                onChange={() => toggleFieldHighlight('adverse_party_email')}
                                                className="w-4 h-4"
                                            />
                                            <span className="ml-3 text-slate-900 dark:text-white">Adverse Party Email - missing or incorrect</span>
                                        </label>
                                        <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <input
                                                type="checkbox"
                                                checked={highlightedFields.includes('adverse_party_phone')}
                                                onChange={() => toggleFieldHighlight('adverse_party_phone')}
                                                className="w-4 h-4"
                                            />
                                            <span className="ml-3 text-slate-900 dark:text-white">Adverse Party Phone - needed</span>
                                        </label>
                                        <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <input
                                                type="checkbox"
                                                checked={highlightedFields.includes('key_witnesses')}
                                                onChange={() => toggleFieldHighlight('key_witnesses')}
                                                className="w-4 h-4"
                                            />
                                            <span className="ml-3 text-slate-900 dark:text-white">Key Witnesses - list incomplete</span>
                                        </label>
                                        <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <input
                                                type="checkbox"
                                                checked={highlightedFields.includes('damages_objective')}
                                                onChange={() => toggleFieldHighlight('damages_objective')}
                                                className="w-4 h-4"
                                            />
                                            <span className="ml-3 text-slate-900 dark:text-white">Damages/Objectives - needs clarification</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        Additional Message (Optional)
                                    </label>
                                    <Textarea
                                        placeholder="Add any additional instructions or questions for the client..."
                                        value={infoRequestMessage}
                                        onChange={(e) => setInfoRequestMessage(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        The client will receive the form with highlighted fields and can provide additional evidence (photos, documents, etc.)
                                    </AlertDescription>
                                </Alert>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setSelectedRequest(null);
                            setAction(null);
                            setHighlightedFields([]);
                            setInfoRequestMessage('');
                        }}>
                            Cancel
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleRequestInfo}>
                            Send Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Case Dialog - Non-Engagement Letter */}
            <Dialog open={action === 'decline'} onOpenChange={(open) => !open && (setSelectedRequest(null), setAction(null), setDeclineReason(''))}>
                <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Decline Case - Non-Engagement Letter</DialogTitle>
                        <DialogDescription>Issue a professional non-engagement letter to the client</DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 px-6">
                        <div className="space-y-4">
                            {selectedRequest && (
                                <>
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                            <strong>Case:</strong> {selectedRequest.title}
                                        </p>
                                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                            <strong>Client:</strong> {selectedRequest.user.name}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">NON-ENGAGEMENT LETTER</h4>
                                        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-4">
                                            <p>
                                                Dear {selectedRequest.user.name},
                                            </p>
                                            <p>
                                                Thank you for contacting our firm regarding your legal matter: {selectedRequest.title}
                                            </p>
                                            <p>
                                                After careful consideration of your case, we regrettably must inform you that we are unable to provide legal representation for your matter at this time.
                                            </p>
                                            <p>
                                                <strong>Reason for Non-Engagement:</strong>
                                            </p>
                                            <p className="bg-slate-100 dark:bg-slate-600/50 p-3 rounded border-l-4 border-slate-400 dark:border-slate-600">
                                                [This is where the decline reason will appear]
                                            </p>
                                            <p>
                                                We recommend that you seek representation from another qualified attorney who may be better suited to handle your specific legal needs.
                                            </p>
                                            <p>
                                                We wish you success in your legal matter.
                                            </p>
                                            <p>
                                                Sincerely,<br/>
                                                <strong>Law Firm</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            Reason for Declining *
                                        </label>
                                        <Textarea
                                            placeholder="Example: This matter presents a potential conflict of interest with our existing clients. A legal matter outside our area of practice. Insufficient resources available. Lack of meritorious claim. etc."
                                            value={declineReason}
                                            onChange={(e) => setDeclineReason(e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <Button variant="outline" onClick={() => {
                            setSelectedRequest(null);
                            setAction(null);
                            setDeclineReason('');
                        }}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDecline}>
                            Send Decline Letter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
