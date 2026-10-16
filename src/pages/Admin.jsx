import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Inbox, CheckCircle, Clock, X, ArrowLeft, Mail, Phone, Building, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Admin = () => {
  const { leads, updateLeadStatus } = useData();
  const [filter, setFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter(l => l.status === 'New').length,
      inProgress: leads.filter(l => l.status === 'In Progress').length,
      closed: leads.filter(l => l.status === 'Closed').length
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (filter === 'All') return leads;
    return leads.filter(l => l.status === filter);
  }, [leads, filter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue/10 text-blue border-blue/20';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Closed': return 'bg-emerald/10 text-emerald border-emerald/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="admin-root min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex flex-col fixed h-full z-20">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold font-heading tracking-tight">Nexa<span className="text-turquoise">Admin</span></span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link to="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-turquoise rounded-lg font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors">
            <Users size={20} /> Users
          </Link>
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors">
              <ArrowLeft size={20} /> Back to Site
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-navy">Lead Management</h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue text-white rounded-full flex items-center justify-center font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><Inbox size={24} /></div>
            <div><p className="text-sm text-gray-500 font-medium">Total Leads</p><p className="text-2xl font-bold">{stats.total}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-blue/20 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue/10 text-blue rounded-lg"><CheckCircle size={24} /></div>
            <div><p className="text-sm text-blue font-medium">New</p><p className="text-2xl font-bold">{stats.new}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Clock size={24} /></div>
            <div><p className="text-sm text-yellow-600 font-medium">In Progress</p><p className="text-2xl font-bold">{stats.inProgress}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-emerald/20 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald/10 text-emerald rounded-lg"><CheckCircle size={24} /></div>
            <div><p className="text-sm text-emerald font-medium">Closed</p><p className="text-2xl font-bold">{stats.closed}</p></div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            {['All', 'New', 'In Progress', 'Closed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Enquiry Type</th>
                  <th className="p-4 font-medium">Service Interest</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length > 0 ? filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500">{new Date(lead.id).toLocaleDateString()}</td>
                    <td className="p-4">
                      <p className="font-medium text-navy">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.organisation || lead.audience_type}</p>
                    </td>
                    <td className="p-4 text-sm"><span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{lead.enquiry_type}</span></td>
                    <td className="p-4 text-sm text-gray-600">{lead.service_interest}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => setSelectedLead(lead)} className="text-blue hover:text-turquoise text-sm font-medium">View Details</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No leads found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Slide-over Detail Panel */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-navy">Lead Details</h2>
                <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedLead.status)}`}>{selectedLead.status}</span>
                  <span className="text-sm text-gray-500">{new Date(selectedLead.id).toLocaleString()}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="text-gray-400 mt-1" size={18} />
                    <div><p className="text-sm font-bold text-navy">{selectedLead.name}</p><p className="text-xs text-gray-500">{selectedLead.audience_type}</p></div>
                  </div>
                  {selectedLead.organisation && (
                    <div className="flex items-start gap-3">
                      <Building className="text-gray-400 mt-1" size={18} />
                      <div><p className="text-sm text-gray-700">{selectedLead.organisation}</p></div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Mail className="text-gray-400 mt-1" size={18} />
                    <a href={`mailto:${selectedLead.email}`} className="text-sm text-blue hover:underline">{selectedLead.email}</a>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="text-gray-400 mt-1" size={18} />
                      <a href={`tel:${selectedLead.phone}`} className="text-sm text-blue hover:underline">{selectedLead.phone}</a>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Enquiry Details</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 mb-1">Type</p><p className="text-sm font-medium text-navy">{selectedLead.enquiry_type}</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 mb-1">Interest</p><p className="text-sm font-medium text-navy">{selectedLead.service_interest}</p></div>
                  </div>
                  <div className="bg-blue/5 border border-blue/10 p-4 rounded-xl">
                    <p className="text-sm font-medium text-navy flex items-center gap-2 mb-2"><MessageSquare size={16} className="text-blue" /> Message</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedLead.message || 'No message provided.'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Update Status</h4>
                  <div className="flex gap-2">
                    {['New', 'In Progress', 'Closed'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateLeadStatus(selectedLead.id, status)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedLead.status === status ? getStatusColor(status) : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <a href={`mailto:${selectedLead.email}`} className="btn bg-blue hover:bg-blue-700 text-white w-full flex justify-center items-center gap-2 py-3">
                  <Mail size={18} /> Quick Reply
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
