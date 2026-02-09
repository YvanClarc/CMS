import React, { useState, useEffect } from 'react';
import { useForm, usePage, router, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Trash2, Upload, X, Plus, FileText, AlertTriangle, FileCheck, Clock } from 'lucide-react';
import type { BreadcrumbItem, SharedData } from '@/types';

interface Case {
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
  status: 'pending' | 'in_progress' | 'closed' | 'on_hold';
  notes?: string;
  created_at: string;
  documents?: CaseDocument[];
}

interface CaseDocument {
  id: number;
  case_id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

interface Agreement {
  id: number;
  case_request_id: number;
  case_id: number;
  client_id: number;
  status: 'pending' | 'signed' | 'declined';
  agreement_content: string;
  fee_arrangement: 'contingency' | 'hourly' | 'flat_fee';
  signed_at?: string;
  signed_document_path?: string;
  decline_reason?: string;
  declined_at?: string;
  created_at: string;
  caseRequest?: Case;
}

interface Props {
  cases: Case[];
  agreements: Agreement[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'My Cases',
    href: '/client/cases',
  },
];

export default function CasesPage(props: Props) {
  const { cases: initialCases = [], agreements: initialAgreements = [], flash } = props;
  const { auth } = usePage<SharedData>().props;
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [agreements, setAgreements] = useState<Agreement[]>(initialAgreements);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [viewingCase, setViewingCase] = useState<Case | null>(null);
  const [viewingAgreement, setViewingAgreement] = useState<Agreement | null>(null);
  const [detailsMode, setDetailsMode] = useState<'view' | 'edit'>('view');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ case: Case | null }>({ case: null });
  const [deleteDocumentConfirmation, setDeleteDocumentConfirmation] = useState<{ document: CaseDocument | null; caseId: number | null }>({ document: null, caseId: null });
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [signingAgreement, setSigningAgreement] = useState(false);
  const [decliningAgreement, setDecliningAgreement] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const fileInputRefs = React.useRef<{ [key: number]: HTMLInputElement | null }>({});

  const [formStep, setFormStep] = useState(1);

  const caseForm = useForm({
    title: '',
    case_category: '',
    adverse_party_name: '',
    adverse_party_email: '',
    adverse_party_phone: '',
    incident_date: '',
    case_summary: '',
    description: '',
    key_witnesses: '',
    damages_objective: '',
    has_existing_counsel: false,
    fee_preference: '',
  });

  // Check if user profile is complete
  const checkProfileComplete = (): { isComplete: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    if (!auth.user.phone) missingFields.push('Phone Number');
    if (!auth.user.address) missingFields.push('Street Address');
    if (!auth.user.city) missingFields.push('City');
    if (!auth.user.state) missingFields.push('Province');
    if (!auth.user.zip_code) missingFields.push('ZIP Code');
    if (!auth.user.country) missingFields.push('Country');

    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (flash?.success) {
      setSuccessMessage(flash.success);
      // Refresh cases list
      router.get('/client/cases', {}, { only: ['cases'] });
    }
  }, [flash?.success]);

  const handleAddCase = () => {
    const { isComplete } = checkProfileComplete();
    
    if (!isComplete) {
      setShowProfileModal(true);
      return;
    }

    setEditingCase(null);
    setFormStep(1);
    caseForm.reset();
    setShowCaseModal(true);
  };

  const handleEditCase = (c: Case) => {
    setEditingCase(c);
    setFormStep(1);
    caseForm.setData({
      title: c.title,
      case_category: '',
      adverse_party_name: '',
      adverse_party_email: '',
      adverse_party_phone: '',
      incident_date: '',
      case_summary: '',
      description: c.description,
      key_witnesses: '',
      damages_objective: '',
      has_existing_counsel: false,
      fee_preference: '',
    });
    setShowCaseModal(true);
  };

  const handleViewDetails = (c: Case) => {
    setViewingCase(c);
    setDetailsMode('view');
    setShowDetailsModal(true);
  };

  const handleDetailsEdit = (c: Case) => {
    setViewingCase(c);
    setDetailsMode('edit');
    caseForm.setData({
      title: c.title || '',
      case_category: c.case_category || '',
      adverse_party_name: c.adverse_party_name || '',
      adverse_party_email: c.adverse_party_email || '',
      adverse_party_phone: c.adverse_party_phone || '',
      incident_date: c.incident_date || '',
      case_summary: c.case_summary || '',
      description: c.description || '',
      key_witnesses: c.key_witnesses || '',
      damages_objective: c.damages_objective || '',
      has_existing_counsel: c.has_existing_counsel || false,
      fee_preference: c.fee_preference || '',
    });
    setFormStep(1);
  };

  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate current step before proceeding
    if (formStep === 1) {
      if (!caseForm.data.title || !caseForm.data.case_category || !caseForm.data.adverse_party_name || !caseForm.data.incident_date) {
        alert('Please fill in all required fields in this step');
        return;
      }
      setFormStep(2);
      return;
    }
    
    if (formStep === 2) {
      if (!caseForm.data.case_summary || !caseForm.data.description || !caseForm.data.damages_objective) {
        alert('Please fill in all required fields in this step');
        return;
      }
      setFormStep(3);
      return;
    }

    if (formStep === 3) {
      if (!caseForm.data.fee_preference) {
        alert('Please select a fee preference');
        return;
      }

      // Debug: Log form data before submission
      console.log('Submitting form data:', caseForm.data);

      const caseToUpdate = editingCase || viewingCase;
      
      if (caseToUpdate) {
        caseForm.put(`/client/cases/${caseToUpdate.id}`, {
          onSuccess: () => {
            setShowCaseModal(false);
            setShowDetailsModal(false);
            caseForm.reset();
            setEditingCase(null);
            setViewingCase(null);
            setFormStep(1);
            setDetailsMode('view');
            setSuccessMessage('Case updated successfully!');
            setCases(cases.map(c => c.id === caseToUpdate.id ? { ...c, ...caseForm.data } : c));
          },
          onError: (errors: any) => {
            console.error('Form validation errors:', errors);
            const errorMessages = Object.entries(errors)
              .map(([field, message]: [string, any]) => `${field}: ${Array.isArray(message) ? message.join(', ') : message}`)
              .join('\n');
            alert('Validation error:\n\n' + errorMessages);
          },
        });
      } else {
        caseForm.post('/client/cases', {
          onSuccess: () => {
            setShowCaseModal(false);
            caseForm.reset();
            setFormStep(1);
            setSuccessMessage('Case created successfully!');
            router.get('/client/cases', {}, { only: ['cases'] });
          },
          onError: (errors: any) => {
            console.error('Form validation errors:', errors);
            const errorMessages = Object.entries(errors)
              .map(([field, message]: [string, any]) => `${field}: ${Array.isArray(message) ? message.join(', ') : message}`)
              .join('\n');
            alert('Validation error:\n\n' + errorMessages);
          },
        });
      }
    }
  };

  const handlePreviousStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  const handleDeleteCase = (c: Case) => {
    setDeleteConfirmation({ case: c });
  };

  const confirmDeleteCase = () => {
    const caseToDelete = deleteConfirmation.case;
    if (!caseToDelete) return;

    router.delete(`/client/cases/${caseToDelete.id}`, {
      onSuccess: () => {
        setDeleteConfirmation({ case: null });
        setSuccessMessage('Case deleted successfully!');
        setCases(cases.filter(c => c.id !== caseToDelete.id));
      },
    });
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, c: Case) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocument(true);
    const formData = new FormData();
    formData.append('document', file);
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    try {
      const response = await fetch(`/client/cases/${c.id}/documents`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse response:', response.statusText);
        alert('Server error. Please check your file and try again.');
        return;
      }
      
      if (response.ok && data.success) {
        setSuccessMessage(data.success);
        // Refresh the cases list
        router.get('/client/cases', {}, { only: ['cases'] });
        // Reset the input
        if (fileInputRefs.current[c.id]) {
          fileInputRefs.current[c.id]!.value = '';
        }
      } else if (data.error) {
        alert('Error uploading document: ' + data.error);
      } else {
        alert('Error uploading document. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading document: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingDocument(false);
    }
  };

  const triggerFileInput = (caseId: number) => {
    fileInputRefs.current[caseId]?.click();
  };

  const handleDeleteDocument = (doc: CaseDocument, caseId: number) => {
    setDeleteDocumentConfirmation({ document: doc, caseId });
  };

  const confirmDeleteDocument = () => {
    const { document: doc, caseId } = deleteDocumentConfirmation;
    if (!doc || !caseId) return;

    const deleteDocument = async () => {
      try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const response = await fetch(`/client/cases/${caseId}/documents/${doc.id}`, {
          method: 'DELETE',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
          },
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error('Failed to parse response:', response.statusText);
          alert('Server error. Please try again.');
          return;
        }

        if (response.ok && data.success) {
          setDeleteDocumentConfirmation({ document: null, caseId: null });
          setSuccessMessage(data.success);
          // Update case documents
          setCases(cases.map(c => 
            c.id === caseId 
              ? { ...c, documents: (c.documents || []).filter(d => d.id !== doc.id) }
              : c
          ));
        } else if (data.error) {
          alert('Error: ' + data.error);
        } else {
          alert('Error deleting document');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting document: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };

    deleteDocument();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'closed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'on_hold':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewAgreement = (agreement: Agreement) => {
    setViewingAgreement(agreement);
    setShowAgreementModal(true);
  };

  const handleSignAgreement = async (agreement: Agreement) => {
    if (!confirm('By signing this agreement, you authorize our law firm to represent you in the described matter. Do you understand and agree?')) {
      return;
    }

    setSigningAgreement(true);
    router.post(`/client/agreements/${agreement.id}/sign`, {}, {
      onSuccess: () => {
        setShowAgreementModal(false);
        setViewingAgreement(null);
        setSigningAgreement(false);
        setSuccessMessage('Agreement signed successfully! Your case is now active.');
        // Refresh agreements
        router.get('/client/cases', {}, { only: ['agreements'] });
      },
      onError: () => {
        setSigningAgreement(false);
        alert('Error signing agreement. Please try again.');
      },
    });
  };

  const handleDeclineAgreement = async (agreement: Agreement) => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining the agreement.');
      return;
    }

    setDecliningAgreement(true);
    router.post(`/client/agreements/${agreement.id}/decline`, {
      decline_reason: declineReason,
    }, {
      onSuccess: () => {
        setShowAgreementModal(false);
        setViewingAgreement(null);
        setDecliningAgreement(false);
        setDeclineReason('');
        setSuccessMessage('Agreement declined. We appreciate your consideration.');
        // Refresh agreements
        router.get('/client/cases', {}, { only: ['agreements'] });
      },
      onError: () => {
        setDecliningAgreement(false);
        alert('Error declining agreement. Please try again.');
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Cases" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">My Cases</h1>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Manage your legal cases and supporting documents</p>
            </div>
            <Button onClick={handleAddCase} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              New Case
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 animate-in">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200 ml-3 font-medium">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Pending Agreements Section */}
        {agreements.some(a => a.status === 'pending') && (
          <div className="animate-slide-up">
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-800">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 ml-3">
                You have pending agreements that require your signature. Please review and sign them to activate your case.
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mt-4">
              {agreements.filter(a => a.status === 'pending').map((agreement) => (
                <div
                  key={agreement.id}
                  className="border border-amber-200 dark:border-amber-800 rounded-xl p-6 bg-amber-50 dark:bg-amber-950/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                        <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Retainer Agreement</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Awaiting your signature</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    Case: <span className="font-semibold">{agreement.caseRequest?.title}</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                    Fee Arrangement: <span className="font-semibold capitalize">{agreement.fee_arrangement.replace('_', ' ')}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAgreement(agreement)}
                      className="hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cases Grid */}
        {cases.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No cases yet</p>
            <p className="text-slate-500 dark:text-slate-500 mt-2">Create your first case to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {cases.map((c) => (
              <div
                key={c.id}
                className="group border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 bg-white dark:bg-slate-800"
              >
                {/* Case Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{c.title}</h3>
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mt-3 ${getStatusBadgeColor(c.status)}`}>
                      {c.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(c)}
                      className="hover:bg-blue-50 dark:hover:bg-slate-700"
                    >
                      View
                    </Button>
                    {c.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCase(c)}
                        className="hover:bg-blue-50 dark:hover:bg-slate-700"
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCase(c)}
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">{c.description}</p>
                {c.notes && <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 italic">📝 {c.notes}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Created on {formatDate(c.created_at)}</p>

                {/* Documents Section */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Documents
                    </h4>
                    <div>
                      <input
                        ref={(el) => { if (el) fileInputRefs.current[c.id] = el; }}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUploadDocument(e, c)}
                        disabled={uploadingDocument}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => triggerFileInput(c.id)}
                        disabled={uploadingDocument}
                        className="hover:bg-blue-50 dark:hover:bg-slate-700 gap-2"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingDocument ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </div>

                  {(!c.documents || c.documents.length === 0) ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">No documents uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {c.documents.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg group/doc hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 dark:text-white font-medium text-sm truncate">{doc.file_name}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc, c.id)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Completion Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex gap-2 items-start">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <DialogTitle>Complete Your Profile First</DialogTitle>
                  <DialogDescription>
                    We need some additional information before you can create a case
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Please complete the following information:
                </p>
                <ul className="space-y-2">
                  {checkProfileComplete().missingFields.map((field) => (
                    <li key={field} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 ml-2 text-sm">
                  This information is required for data integrity and security purposes.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowProfileModal(false);
                  router.visit('/settings/profile');
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Profile Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Case Modal - Multi-step Form */}
        <Dialog open={showCaseModal} onOpenChange={setShowCaseModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCase ? 'Edit Case' : 'Create New Case'}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                  Step {formStep} of 3
                </span>
              </DialogTitle>
              <DialogDescription>
                {formStep === 1 && 'Basic case information'}
                {formStep === 2 && 'Case details and narrative'}
                {formStep === 3 && 'Administrative details'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveCase} className="space-y-4">
              {/* Step 1: Basics */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Case Title *
                    </label>
                    <Input
                      value={caseForm.data.title}
                      onChange={(e) => caseForm.setData('title', e.target.value)}
                      placeholder="e.g., Workplace Discrimination Claim"
                      className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                    />
                    {caseForm.errors.title && <p className="text-red-600 text-sm mt-1">{caseForm.errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Case Category *
                    </label>
                    <select
                      value={caseForm.data.case_category}
                      onChange={(e) => caseForm.setData('case_category', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      <option value="labor_dispute">Labor Dispute</option>
                      <option value="family_law">Family Law</option>
                      <option value="debt_collection">Debt Collection</option>
                      <option value="criminal_defense">Criminal Defense</option>
                      <option value="contract_dispute">Contract Dispute</option>
                      <option value="personal_injury">Personal Injury</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="other">Other</option>
                    </select>
                    {caseForm.errors.case_category && <p className="text-red-600 text-sm mt-1">{caseForm.errors.case_category}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Adverse Party Name *
                      </label>
                      <Input
                        value={caseForm.data.adverse_party_name}
                        onChange={(e) => caseForm.setData('adverse_party_name', e.target.value)}
                        placeholder="Individual or organization name"
                        className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                      {caseForm.errors.adverse_party_name && <p className="text-red-600 text-sm mt-1">{caseForm.errors.adverse_party_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={caseForm.data.adverse_party_email}
                        onChange={(e) => caseForm.setData('adverse_party_email', e.target.value)}
                        placeholder="contact@example.com"
                        className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                      {caseForm.errors.adverse_party_email && <p className="text-red-600 text-sm mt-1">{caseForm.errors.adverse_party_email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Phone Number
                      </label>
                      <Input
                        value={caseForm.data.adverse_party_phone}
                        onChange={(e) => caseForm.setData('adverse_party_phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                      {caseForm.errors.adverse_party_phone && <p className="text-red-600 text-sm mt-1">{caseForm.errors.adverse_party_phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Incident Date *
                      </label>
                      <Input
                        type="date"
                        value={caseForm.data.incident_date}
                        onChange={(e) => caseForm.setData('incident_date', e.target.value)}
                        className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                      {caseForm.errors.incident_date && <p className="text-red-600 text-sm mt-1">{caseForm.errors.incident_date}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Facts & Narrative */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Case Summary *
                    </label>
                    <textarea
                      value={caseForm.data.case_summary}
                      onChange={(e) => caseForm.setData('case_summary', e.target.value)}
                      placeholder="Brief summary of the case (50+ characters)"
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {caseForm.errors.case_summary && <p className="text-red-600 text-sm mt-1">{caseForm.errors.case_summary}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      value={caseForm.data.description}
                      onChange={(e) => caseForm.setData('description', e.target.value)}
                      placeholder="Provide detailed facts and circumstances"
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {caseForm.errors.description && <p className="text-red-600 text-sm mt-1">{caseForm.errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Key Witnesses
                    </label>
                    <textarea
                      value={caseForm.data.key_witnesses}
                      onChange={(e) => caseForm.setData('key_witnesses', e.target.value)}
                      placeholder="Names and details of important witnesses"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {caseForm.errors.key_witnesses && <p className="text-red-600 text-sm mt-1">{caseForm.errors.key_witnesses}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Damages/Objectives *
                    </label>
                    <textarea
                      value={caseForm.data.damages_objective}
                      onChange={(e) => caseForm.setData('damages_objective', e.target.value)}
                      placeholder="What damages or outcomes are you seeking?"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {caseForm.errors.damages_objective && <p className="text-red-600 text-sm mt-1">{caseForm.errors.damages_objective}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Administrative */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Do you already have legal representation?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!caseForm.data.has_existing_counsel}
                          onChange={() => caseForm.setData('has_existing_counsel', false)}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-700 dark:text-slate-300">No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={caseForm.data.has_existing_counsel}
                          onChange={() => caseForm.setData('has_existing_counsel', true)}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-700 dark:text-slate-300">Yes</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Fee Preference *
                    </label>
                    <select
                      value={caseForm.data.fee_preference}
                      onChange={(e) => caseForm.setData('fee_preference', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a fee arrangement</option>
                      <option value="contingency">Contingency (pay only if we win)</option>
                      <option value="hourly">Hourly Rate</option>
                      <option value="flat_fee">Flat Fee</option>
                    </select>
                    {caseForm.errors.fee_preference && <p className="text-red-600 text-sm mt-1">{caseForm.errors.fee_preference}</p>}
                  </div>

                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200 ml-2 text-sm">
                      After submitting, an administrator will review your case and contact you with next steps.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <DialogFooter className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  {formStep > 1 && (
                    <Button type="button" variant="outline" onClick={handlePreviousStep}>
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCaseModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={caseForm.processing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {caseForm.processing ? 'Saving...' : formStep === 3 ? (editingCase ? 'Update Case' : 'Submit Case') : 'Next'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Case Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {detailsMode === 'edit' ? `Edit Case - Step ${formStep} of 3` : 'Case Details'}
              </DialogTitle>
              <DialogDescription>
                {detailsMode === 'view' ? 'Full details of your case request' : (
                  <>
                    {formStep === 1 && 'Basic case information'}
                    {formStep === 2 && 'Case details and narrative'}
                    {formStep === 3 && 'Administrative details'}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 px-6">
              {detailsMode === 'view' ? (
                <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Case Title</p>
                      <p className="text-slate-900 dark:text-white mt-1">{viewingCase?.title}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Case Category</p>
                      <p className="text-slate-900 dark:text-white mt-1 capitalize">{viewingCase?.case_category?.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Incident Date</p>
                      <p className="text-slate-900 dark:text-white mt-1">{viewingCase?.incident_date ? new Date(viewingCase.incident_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</p>
                      <p className={`text-white mt-1 inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(viewingCase?.status || 'pending')}`}>
                        {viewingCase?.status?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Adverse Party Information */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Adverse Party</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</p>
                      <p className="text-slate-900 dark:text-white mt-1">{viewingCase?.adverse_party_name || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Email</p>
                      <p className="text-slate-900 dark:text-white mt-1">{viewingCase?.adverse_party_email || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Phone</p>
                      <p className="text-slate-900 dark:text-white mt-1">{viewingCase?.adverse_party_phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Case Details */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Case Details</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Case Summary</p>
                      <p className="text-slate-900 dark:text-white mt-1 whitespace-pre-wrap break-words overflow-hidden">{viewingCase?.case_summary || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</p>
                      <p className="text-slate-900 dark:text-white mt-1 whitespace-pre-wrap break-words overflow-hidden">{viewingCase?.description || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Key Witnesses</p>
                      <p className="text-slate-900 dark:text-white mt-1 whitespace-pre-wrap break-words overflow-hidden">{viewingCase?.key_witnesses || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Damages/Objectives</p>
                      <p className="text-slate-900 dark:text-white mt-1 whitespace-pre-wrap break-words overflow-hidden">{viewingCase?.damages_objective || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Administrative Details */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Administrative Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Existing Counsel</p>
                      <p className="text-slate-900 dark:text-white mt-1">{viewingCase?.has_existing_counsel ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Fee Preference</p>
                      <p className="text-slate-900 dark:text-white mt-1 capitalize">{viewingCase?.fee_preference?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {viewingCase?.notes && (
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Admin Notes</h3>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <p className="text-slate-900 dark:text-white whitespace-pre-wrap break-words overflow-hidden">{viewingCase.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveCase} className="space-y-4">
                {/* Step 1: Basics */}
                {formStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Case Title *
                      </label>
                      <Input
                        value={caseForm.data.title}
                        onChange={(e) => caseForm.setData('title', e.target.value)}
                        placeholder="e.g., Workplace Discrimination Claim"
                        className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                      />
                      {caseForm.errors.title && <p className="text-red-600 text-sm mt-1">{caseForm.errors.title}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Case Category *
                      </label>
                      <select
                        value={caseForm.data.case_category}
                        onChange={(e) => caseForm.setData('case_category', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a category</option>
                        <option value="labor_dispute">Labor Dispute</option>
                        <option value="family_law">Family Law</option>
                        <option value="debt_collection">Debt Collection</option>
                        <option value="criminal_defense">Criminal Defense</option>
                        <option value="contract_dispute">Contract Dispute</option>
                        <option value="personal_injury">Personal Injury</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="other">Other</option>
                      </select>
                      {caseForm.errors.case_category && <p className="text-red-600 text-sm mt-1">{caseForm.errors.case_category}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          Adverse Party Name *
                        </label>
                        <Input
                          value={caseForm.data.adverse_party_name}
                          onChange={(e) => caseForm.setData('adverse_party_name', e.target.value)}
                          placeholder="Individual or organization name"
                          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        {caseForm.errors.adverse_party_name && <p className="text-red-600 text-sm mt-1">{caseForm.errors.adverse_party_name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={caseForm.data.adverse_party_email}
                          onChange={(e) => caseForm.setData('adverse_party_email', e.target.value)}
                          placeholder="contact@example.com"
                          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        {caseForm.errors.adverse_party_email && <p className="text-red-600 text-sm mt-1">{caseForm.errors.adverse_party_email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={caseForm.data.adverse_party_phone}
                          onChange={(e) => caseForm.setData('adverse_party_phone', e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        {caseForm.errors.adverse_party_phone && <p className="text-red-600 text-sm mt-1">{caseForm.errors.adverse_party_phone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          Incident Date *
                        </label>
                        <Input
                          type="date"
                          value={caseForm.data.incident_date}
                          onChange={(e) => caseForm.setData('incident_date', e.target.value)}
                          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        {caseForm.errors.incident_date && <p className="text-red-600 text-sm mt-1">{caseForm.errors.incident_date}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Facts & Narrative */}
                {formStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Case Summary *
                      </label>
                      <textarea
                        value={caseForm.data.case_summary}
                        onChange={(e) => caseForm.setData('case_summary', e.target.value)}
                        placeholder="Brief summary of the case (50+ characters)"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {caseForm.errors.case_summary && <p className="text-red-600 text-sm mt-1">{caseForm.errors.case_summary}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Detailed Description *
                      </label>
                      <textarea
                        value={caseForm.data.description}
                        onChange={(e) => caseForm.setData('description', e.target.value)}
                        placeholder="Provide detailed facts and circumstances"
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {caseForm.errors.description && <p className="text-red-600 text-sm mt-1">{caseForm.errors.description}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Key Witnesses
                      </label>
                      <textarea
                        value={caseForm.data.key_witnesses}
                        onChange={(e) => caseForm.setData('key_witnesses', e.target.value)}
                        placeholder="Names and details of important witnesses"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {caseForm.errors.key_witnesses && <p className="text-red-600 text-sm mt-1">{caseForm.errors.key_witnesses}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Damages/Objectives *
                      </label>
                      <textarea
                        value={caseForm.data.damages_objective}
                        onChange={(e) => caseForm.setData('damages_objective', e.target.value)}
                        placeholder="What damages or outcomes are you seeking?"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {caseForm.errors.damages_objective && <p className="text-red-600 text-sm mt-1">{caseForm.errors.damages_objective}</p>}
                    </div>
                  </div>
                )}

                {/* Step 3: Administrative */}
                {formStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Do you already have legal representation?
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!caseForm.data.has_existing_counsel}
                            onChange={() => caseForm.setData('has_existing_counsel', false)}
                            className="w-4 h-4"
                          />
                          <span className="text-slate-700 dark:text-slate-300">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={caseForm.data.has_existing_counsel}
                            onChange={() => caseForm.setData('has_existing_counsel', true)}
                            className="w-4 h-4"
                          />
                          <span className="text-slate-700 dark:text-slate-300">Yes</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Fee Preference *
                      </label>
                      <select
                        value={caseForm.data.fee_preference}
                        onChange={(e) => caseForm.setData('fee_preference', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a fee arrangement</option>
                        <option value="contingency">Contingency (pay only if we win)</option>
                        <option value="hourly">Hourly Rate</option>
                        <option value="flat_fee">Flat Fee</option>
                      </select>
                      {caseForm.errors.fee_preference && <p className="text-red-600 text-sm mt-1">{caseForm.errors.fee_preference}</p>}
                    </div>

                    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200 ml-2 text-sm">
                        After submitting, an administrator will review your case and contact you with next steps.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <DialogFooter className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    {formStep > 1 && (
                      <Button type="button" variant="outline" onClick={handlePreviousStep}>
                        Previous
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      setShowDetailsModal(false);
                      setDetailsMode('view');
                      setFormStep(1);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={caseForm.processing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {caseForm.processing ? 'Saving...' : formStep === 3 ? 'Update Case' : 'Next'}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            )}
            </div>

            {detailsMode === 'view' && (
              <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                {viewingCase?.status === 'pending' && (
                  <Button
                    onClick={() => handleDetailsEdit(viewingCase)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Case
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Case Confirmation Modal */}
        {deleteConfirmation.case && (
          <Dialog open={!!deleteConfirmation.case} onOpenChange={() => setDeleteConfirmation({ case: null })}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Case</DialogTitle>
              </DialogHeader>
              <p className="text-slate-700 dark:text-slate-300">
                Are you sure you want to delete <span className="font-semibold">"{deleteConfirmation.case.title}"</span>? This action cannot be undone and all associated documents will be deleted.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmation({ case: null })}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteCase}>
                  Delete Case
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Document Confirmation Modal */}
        {deleteDocumentConfirmation.document && (
          <Dialog open={!!deleteDocumentConfirmation.document} onOpenChange={() => setDeleteDocumentConfirmation({ document: null, caseId: null })}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Document</DialogTitle>
              </DialogHeader>
              <p className="text-slate-700 dark:text-slate-300">
                Are you sure you want to delete <span className="font-semibold">"{deleteDocumentConfirmation.document.file_name}"</span>? This action cannot be undone.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDocumentConfirmation({ document: null, caseId: null })}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteDocument}>
                  Delete Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Agreement Modal */}
        <Dialog open={showAgreementModal} onOpenChange={setShowAgreementModal}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Retainer Agreement</DialogTitle>
              <DialogDescription>
                Please review the agreement below and sign if you agree to the terms.
              </DialogDescription>
            </DialogHeader>

            {viewingAgreement && (
              <div className="space-y-6">
                {/* Agreement Content */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700 min-h-96">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words overflow-hidden">
                      {viewingAgreement.agreement_content}
                    </p>
                  </div>
                </div>

                {/* Agreement Status Section */}
                {viewingAgreement.status === 'pending' && (
                  <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Reason for Declining (if applicable)
                      </label>
                      <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="Please provide a reason if you choose to decline this agreement..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200 ml-2 text-sm">
                        By signing this agreement, you authorize our law firm to represent you in the described matter.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="destructive"
                        onClick={() => handleDeclineAgreement(viewingAgreement)}
                        disabled={decliningAgreement}
                        className="flex-1"
                      >
                        {decliningAgreement ? 'Declining...' : 'Decline Agreement'}
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleSignAgreement(viewingAgreement)}
                        disabled={signingAgreement}
                      >
                        {signingAgreement ? 'Signing...' : 'Sign Agreement'}
                      </Button>
                    </div>
                  </div>
                )}

                {viewingAgreement.status === 'signed' && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <FileCheck className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Signed</p>
                        <p className="text-sm">Signed on {formatDate(viewingAgreement.signed_at || '')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {viewingAgreement.status === 'declined' && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Declined</p>
                        <p className="text-sm">Declined on {formatDate(viewingAgreement.declined_at || '')}</p>
                        {viewingAgreement.decline_reason && (
                          <p className="text-sm mt-2">Reason: {viewingAgreement.decline_reason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAgreementModal(false);
                  setViewingAgreement(null);
                  setDeclineReason('');
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

