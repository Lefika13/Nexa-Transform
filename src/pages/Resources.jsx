import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, Filter, Download, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Resources.css';

export const Resources = () => {
  const { resources, addLead } = useData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [downloadForm, setDownloadForm] = useState({ name: '', email: '' });
  const [downloadStatus, setDownloadStatus] = useState('');

  const categories = ['All', 'BPM', 'Digital Transformation', 'AI', 'Organisational Development', 'Operations', 'General'];

  // Ensure we have 12 resources for display even if DataContext has fewer
  const displayResources = resources.length >= 12 ? resources : [
    ...resources,
    { id: 3, title: 'AI Strategy Framework', type: 'AI Guide', description: 'A step-by-step framework for adopting AI securely.', category: 'AI', is_free: true },
    { id: 4, title: 'Enterprise Compliance Matrix', type: 'Checklist', description: 'Ensure regulatory alignment during organizational transformation.', category: 'Operations', is_free: true },
    { id: 5, title: 'Org Design Template', type: 'Template', description: 'Structuring your teams for digital agility.', category: 'Organisational Development', is_free: true },
    { id: 6, title: 'Change Management Playbook', type: 'Guide', description: 'Overcoming resistance to new technology adoption.', category: 'Organisational Development', is_free: true },
    { id: 7, title: 'Digital Maturity Assessment', type: 'Business Analysis Tool', description: 'Score your current digital capabilities.', category: 'Digital Transformation', is_free: true },
    { id: 8, title: 'Lean Six Sigma Quick Guide', type: 'Process Map', description: 'Core principles of process optimization.', category: 'BPM', is_free: true },
    { id: 9, title: 'Cloud Migration ROI Calculator', type: 'Template', description: 'Estimate the financial impact of moving to the cloud.', category: 'Digital Transformation', is_free: true },
    { id: 10, title: 'Institutional Service Delivery Blueprint', type: 'Case Study', description: 'How digitisation improved customer service workflows.', category: 'Operations', is_free: true },
    { id: 11, title: 'Machine Learning Readiness Survey', type: 'Business Analysis Tool', description: 'Is your data ready for ML models?', category: 'AI', is_free: true },
    { id: 12, title: 'Future of Work Trends 2026', type: 'Whitepaper', description: 'Key trends shaping the modern workplace in Africa.', category: 'General', is_free: true }
  ];

  const filteredResources = displayResources.filter(r => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownloadSubmit = (e) => {
    e.preventDefault();
    addLead({
      ...downloadForm,
      enquiry_type: 'Resource Download',
      service_interest: selectedResource.category,
      message: `Downloaded resource: ${selectedResource.title}`,
      audience_type: 'Organisation' // Defaulting to org for resource capture
    });
    setDownloadStatus('success');
    
    // Simulate file download trigger
    setTimeout(() => {
      setDownloadStatus('');
      setSelectedResource(null);
      setDownloadForm({ name: '', email: '' });
    }, 2500);
  };

  return (
    <div className="resources-root bg-glacial min-h-screen">
      <section className="bg-navy text-white py-20 px-4">
        <div className="container text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Resource Library</h1>
          <p className="text-xl text-gray-300">
            Free tools, templates, and insights to accelerate your transformation journey.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 border-b border-gray-200 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-turquoise bg-glacial"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              <Filter className="text-gray-500 flex-shrink-0 mr-2" size={20} />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    activeCategory === cat ? 'bg-navy text-white' : 'bg-glacial text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource, i) => (
              <div key={i} className="glass-card bg-white p-6 flex flex-col h-full hover:shadow-lg transition-shadow border-t-4 border-turquoise">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-turquoise/10 p-3 rounded-xl text-turquoise">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{resource.type}</span>
                </div>
                
                <h3 className="text-lg font-bold text-navy mb-2 line-clamp-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">{resource.description}</p>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium bg-glacial px-2 py-1 rounded text-gray-600">{resource.category}</span>
                  <button 
                    onClick={() => setSelectedResource(resource)}
                    className="text-blue hover:text-turquoise transition-colors flex items-center gap-1 text-sm font-bold"
                  >
                    Download <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Gate Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-navy/80 backdrop-blur-sm" onClick={() => setSelectedResource(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden">
              <div className="bg-navy p-6 text-white relative">
                <button onClick={() => setSelectedResource(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button>
                <span className="text-turquoise text-xs font-bold uppercase tracking-wider block mb-2">{selectedResource.type}</span>
                <h3 className="text-xl font-bold">{selectedResource.title}</h3>
              </div>
              
              <div className="p-8">
                {downloadStatus === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-navy mb-2">Downloading...</h4>
                    <p className="text-gray-600">Your resource will begin downloading shortly. Check your email for a backup link.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-6 text-sm">Enter your details below to access this free resource instantly.</p>
                    <form onSubmit={handleDownloadSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" required value={downloadForm.name} onChange={e => setDownloadForm({...downloadForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-turquoise focus:border-transparent bg-glacial" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                        <input type="email" required value={downloadForm.email} onChange={e => setDownloadForm({...downloadForm, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-turquoise focus:border-transparent bg-glacial" />
                      </div>
                      <button type="submit" className="btn btn-primary w-full py-3 mt-4 text-lg">Access Resource</button>
                    </form>
                    <p className="text-xs text-gray-400 mt-4 text-center">We respect your privacy. Unsubscribe at any time.</p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
