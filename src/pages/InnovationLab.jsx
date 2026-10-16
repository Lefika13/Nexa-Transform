import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { X, ArrowRight, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './InnovationLab.css';

export const InnovationLab = () => {
  const { projects, addLead } = useData();
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', organisation: '' });
  const [formStatus, setFormStatus] = useState('');

  // Fallback projects if DataContext doesn't have 6
  const displayProjects = projects.length >= 6 ? projects : [
    ...projects,
    { id: 3, title: 'AI-Powered Customer Service Desk', category: 'AI Solutions', description: 'Implementing an intelligent triage system for customer queries.', results: 'Dramatically improved response times and enhanced customer satisfaction.', image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80', client_type: 'Enterprise Client' },
    { id: 4, title: 'Enterprise Resource Planning Overhaul', category: 'Systems Development', description: 'Replacing legacy silos with a unified digital ecosystem.', results: 'Created a single source of truth, enabling real-time strategic decision making.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', client_type: 'Large Enterprise' },
    { id: 5, title: 'Enterprise Competency Framework', category: 'Workforce Development', description: 'Designing a standardized skills matrix for corporate personnel.', results: 'Aligned workforce capabilities with future service delivery mandates.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80', client_type: 'Corporate Sector' },
    { id: 6, title: 'Automated Procurement Workflow', category: 'Process Automation', description: 'Digitising the end-to-end supply chain approval process.', results: 'Eliminated paper trails, enhanced auditability, and accelerated vendor onboarding.', image: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=800&q=80', client_type: 'Large Enterprise' }
  ].slice(0, 6);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    addLead({
      ...demoForm,
      enquiry_type: 'Demo Request',
      service_interest: selectedProject ? selectedProject.title : 'General Demo',
      message: 'Requested demo from Innovation Lab',
      audience_type: 'Organisation'
    });
    setFormStatus('success');
    setTimeout(() => {
      setFormStatus('');
      setIsDemoModalOpen(false);
      setDemoForm({ name: '', email: '', organisation: '' });
    }, 2000);
  };

  return (
    <div className="lab-root bg-[#050B14] min-h-screen text-white">
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-turquoise/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="container text-center max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Innovation <span className="text-turquoise">Lab</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Explore our showcase of digital transformation projects, process automations, and AI implementations that are redefining operational excellence.
          </p>
        </div>
      </section>

      <section className="pb-20 px-4 relative z-10">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((project) => (
              <div 
                key={project.id} 
                className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="absolute inset-0 bg-navy/80 group-hover:bg-navy/60 transition-colors z-10"></div>
                <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                  <span className="text-turquoise text-xs font-bold uppercase tracking-wider mb-2">{project.category}</span>
                  <h3 className="text-2xl font-bold mb-2 text-white">{project.title}</h3>
                  <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide-over Detail Panel */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-navy border-l border-white/10 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="relative h-64">
                <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent"></div>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8">
                <span className="text-turquoise text-sm font-bold uppercase tracking-wider mb-2 block">{selectedProject.category}</span>
                <h2 className="text-3xl font-bold mb-6">{selectedProject.title}</h2>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-2">The Challenge</h4>
                    <p className="text-gray-200">{selectedProject.description}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-2">The Impact</h4>
                    <p className="text-emerald font-medium bg-emerald/10 p-4 rounded-lg border border-emerald/20">{selectedProject.results}</p>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <button 
                      onClick={() => setIsDemoModalOpen(true)}
                      className="btn bg-turquoise hover:bg-cyan-400 text-navy w-full flex items-center justify-center gap-2 py-4 text-lg"
                    >
                      <PlayCircle size={24} /> Request Demo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Demo Request Modal */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDemoModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-navy border border-white/10 p-8 rounded-2xl w-full max-w-lg relative z-10 shadow-2xl">
              <button onClick={() => setIsDemoModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
              <h3 className="text-2xl font-bold mb-2">Request a Demo</h3>
              <p className="text-gray-400 mb-6">See how this solution could work for your organisation.</p>
              
              {formStatus === 'success' ? (
                <div className="bg-emerald/10 text-emerald border border-emerald/20 p-6 rounded-xl text-center">
                  <p className="font-bold text-lg mb-2">Request Sent Successfully</p>
                  <p>Our lab team will contact you shortly to schedule your demo.</p>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input type="text" required value={demoForm.name} onChange={e => setDemoForm({...demoForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Work Email</label>
                    <input type="email" required value={demoForm.email} onChange={e => setDemoForm({...demoForm, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Organisation</label>
                    <input type="text" required value={demoForm.organisation} onChange={e => setDemoForm({...demoForm, organisation: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise" />
                  </div>
                  <button type="submit" className="btn bg-turquoise text-navy w-full py-4 mt-4 font-bold text-lg">Submit Request</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
