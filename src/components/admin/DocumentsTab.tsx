/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../dbMock';
import { ElectionDocument } from '../../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Lock, 
  Globe, 
  FileCheck, 
  Upload, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const DocumentsTab: React.FC = () => {
  const { currentInstitution, triggerRefresh } = useApp();
  
  // Selection
  const elections = db.getElections(currentInstitution?.id || '');
  const [selectedElectionId, setSelectedElectionId] = useState(elections[0]?.id || '');

  // Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'Admin Only' | 'Visible to Voters'>('Visible to Voters');

  if (!currentInstitution) return null;

  const docs = selectedElectionId ? db.getDocuments(selectedElectionId) : [];

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElectionId) {
      alert('Please select an election.');
      return;
    }
    if (!title.trim() || !fileName.trim()) {
      alert('Document Title and simulated filename are required.');
      return;
    }

    db.addDocument({
      electionId: selectedElectionId,
      title,
      fileName,
      fileSize: fileSize || '240 KB',
      content,
      visibility
    });

    db.addLog(
      currentInstitution.id,
      'admin-system-action',
      'System Admin',
      'Document Uploaded',
      `Uploaded regulatory document '${title}' with visibility setting '${visibility}'.`,
      selectedElectionId
    );

    // Reset
    setTitle('');
    setFileName('');
    setFileSize('');
    setContent('');
    setVisibility('Visible to Voters');
    setShowAddForm(false);
    triggerRefresh();
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document from the portal?')) {
      db.deleteDocument(id);
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 font-sans" id="admin-documents-panel">
      
      {/* Selector and Plus button */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-800">
            <FileText className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Select Election Partition:</span>
          </div>
          <select 
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">-- Choose Campaign --</option>
            {elections.map(el => (
              <option key={el.id} value={el.id}>{el.name}</option>
            ))}
          </select>
        </div>

        {selectedElectionId && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Regulatory Guidelines</span>
          </button>
        )}
      </div>

      {/* FORM: ADD DOCUMENT */}
      {showAddForm && selectedElectionId && (
        <form onSubmit={handleAddDocument} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Upload Regulatory Document (Simulation)</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Title</label>
              <input 
                type="text" 
                placeholder="e.g. Code of Conduct Policy 2026" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulated Filename</label>
              <input 
                type="text" 
                placeholder="e.g. Conduct_Guidelines.pdf" 
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">File Size Label (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. 420 KB" 
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ballot Visibility Level</label>
              <select 
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'Admin Only' | 'Visible to Voters')}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="Visible to Voters">Visible to Voters (Publicly viewable on Ballot screens)</option>
                <option value="Admin Only">Admin Only (Confidential / Observer Checklists)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Summary / Excerpt Content</label>
            <textarea 
              rows={4}
              placeholder="Provide a text outline explaining regulatory guidelines or audit checklist items..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-150">
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95 cursor-pointer"
            >
              Upload Guidelines & Rules
            </button>
          </div>
        </form>
      )}

      {/* DOCUMENTS LIST */}
      {selectedElectionId ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
          {docs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 text-xs">
              <AlertCircle className="h-8 w-8 text-slate-200 mx-auto" />
              <p>No guidelines or notifications uploaded for this election partition.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {docs.map(doc => (
                <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4.5 w-4.5 text-indigo-500" />
                        <h4 className="font-extrabold text-slate-900 leading-snug">{doc.title}</h4>
                      </div>
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-slate-400">File: {doc.fileName} ({doc.fileSize})</p>
                    
                    {doc.content && (
                      <p className="text-slate-600 border-t border-slate-200/60 pt-2 leading-relaxed italic line-clamp-3">
                        "{doc.content}"
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200/60 pt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      {doc.visibility === 'Visible to Voters' ? (
                        <>
                          <Globe className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-800">Public: Visible to Students</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 text-amber-600" />
                          <span className="text-amber-800">Private: Admin Eyes Only</span>
                        </>
                      )}
                    </div>
                    <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400 text-xs shadow-sm">
          Please select or configure an election partition above to manage campaign guidelines.
        </div>
      )}

    </div>
  );
};
