import React, { useState, useEffect } from 'react';
import { useForm, usePage, router, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Trash2, Upload, X, Plus, FileText, AlertTriangle } from 'lucide-react';
import type { BreadcrumbItem, SharedData } from '@/types';

interface Case {
  id: number;
  title: string;
  description: string;
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

interface Props {
  cases: Case[];
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
  const { cases: initialCases = [], flash } = props;
  const { auth } = usePage<SharedData>().props;
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ case: Case | null }>({ case: null });
  const [deleteDocumentConfirmation, setDeleteDocumentConfirmation] = useState<{ document: CaseDocument | null; caseId: number | null }>({ document: null, caseId: null });
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const fileInputRefs = React.useRef<{ [key: number]: HTMLInputElement | null }>({});

  const caseForm = useForm({
    title: '',
    description: '',
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
    caseForm.reset();
    setShowCaseModal(true);
  };

  const handleEditCase = (c: Case) => {
    setEditingCase(c);
    caseForm.setData({
      title: c.title,
      description: c.description,
    });
    setShowCaseModal(true);
  };

  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCase) {
      caseForm.put(`/client/cases/${editingCase.id}`, {
        onSuccess: () => {
          setShowCaseModal(false);
          caseForm.reset();
          setEditingCase(null);
          setSuccessMessage('Case updated successfully!');
          // Update local state
          setCases(cases.map(c => c.id === editingCase.id ? { ...c, ...caseForm.data } : c));
        },
      });
    } else {
      caseForm.post('/client/cases', {
        onSuccess: () => {
          setShowCaseModal(false);
          caseForm.reset();
          setSuccessMessage('Case created successfully!');
          // Refresh cases from server
          router.get('/client/cases', {}, { only: ['cases'] });
        },
      });
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
    formData.append('_token', csrfToken);

    try {
      const response = await fetch(`/client/cases/${c.id}/documents`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
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

        {/* Case Modal */}
        <Dialog open={showCaseModal} onOpenChange={setShowCaseModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCase ? 'Edit Case' : 'Create New Case'}</DialogTitle>
              <DialogDescription>
                {editingCase ? 'Update your case details' : 'Submit a new legal case or concern'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveCase} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Case Title
                </label>
                <Input
                  value={caseForm.data.title}
                  onChange={(e) => caseForm.setData('title', e.target.value)}
                  placeholder="e.g., Property Dispute"
                  required
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
                {caseForm.errors.title && <p className="text-red-600 text-sm mt-1">{caseForm.errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={caseForm.data.description}
                  onChange={(e) => caseForm.setData('description', e.target.value)}
                  placeholder="Describe your case details..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {caseForm.errors.description && <p className="text-red-600 text-sm mt-1">{caseForm.errors.description}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCaseModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={caseForm.processing} className="bg-blue-600 hover:bg-blue-700">
                  {caseForm.processing ? 'Saving...' : editingCase ? 'Update Case' : 'Create Case'}
                </Button>
              </DialogFooter>
            </form>
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
      </div>
    </AppLayout>
  );
}

