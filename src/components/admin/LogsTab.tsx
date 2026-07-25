/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../dbMock';
import { 
  ShieldAlert, 
  Search, 
  Calendar, 
  RefreshCw, 
  Trash2,
  FileText
} from 'lucide-react';

export const LogsTab: React.FC = () => {
  const { currentInstitution, refreshTrigger, triggerRefresh } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentInstitution) return null;

  const logs = db.getLogs(currentInstitution.id);

  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q)
    );
  });

  const formatDateTime = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="space-y-6 font-sans" id="admin-logs-panel">
      
      {/* Top Search bar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Security Audit & Activity Logs</h2>
          <p className="text-xs text-slate-500">Immutable chronological record of administrator operations, voter list mapping, and election status triggers.</p>
        </div>

        <button 
          onClick={triggerRefresh}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search audit trail..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Logs Listing */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No administrative log alerts found matching your queries.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs border border-slate-150 rounded-2xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-4">Log Timestamp</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Triggered By</th>
                  <th className="p-4">Audit Details</th>
                  <th className="p-4 text-right">Reference Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-500 font-mono font-medium whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="p-4">
                      <span className="font-bold bg-slate-100 border border-slate-250 px-2 py-0.5 rounded-lg text-slate-800 text-[9px] uppercase font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-950">
                      {log.adminName}
                    </td>
                    <td className="p-4 text-slate-600 leading-snug">
                      {log.description}
                    </td>
                    <td className="p-4 text-right font-mono text-[9px] text-slate-400 select-all">
                      {log.id.substring(0, 13).toUpperCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
