import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { 
  sendInstitutionalEmail, 
  generateContactEnquiryAdminEmailHtml, 
  generateContactEnquiryClientConfirmationHtml 
} from '../utils/emailNotifier';
import { isDeliverableEmail } from '../utils/emailValidator';
import './Contact.css';

export const Contact = () => {
  const { addLead } = useData();
  const location = useLocation();
  const [formStatus, setFormStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    organisation: '',
    industry_sector: 'Manufacturing & Heavy Industry (Smelting, Plants, Foundries)',
    email: '',
    phone: '',
    audience_type: 'Organisation',
    enquiry_type: 'Operational Turnaround & Performance Alignment',
    service_interest: 'Not Sure Yet',
    message: ''
  });

  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const prog = params.get('programme');
      const role = params.get('role');
      const enqType = params.get('enquiry_type');
      const ind = params.get('industry');
      const serv = params.get('service');
      const challenge = params.get('challenge');

      setFormData(prev => ({
        ...prev,
        enquiry_type: enqType || (prog ? 'Training Enquiry' : prev.enquiry_type),
        service_interest: serv || prog || prev.service_interest,
        industry_sector: ind || prev.industry_sector,
        message: challenge === 'smelting_turnaround'
          ? 'We are an organisation in the smelting/manufacturing industry facing missed KPI targets, recurring safety issues, zero tracking systems, and communication silos. We would like to enquire about an operational turnaround intervention to align our people, processes, and technology, establish Lean methodologies, and build custom digital tracking systems.'
          : role 
            ? `I am enquiring about the "${prog || 'Transformation'}" programme with specific interest in the "${role}" role pathway.` 
            : (prog ? `I would like to enquire about enrolling in the "${prog}" programme.` : (challenge ? `We would like to consult on our operational challenges: ${challenge}` : prev.message))
      }));
    }
  }, [location.search]);

  const enquiryTypes = [
    'Operational Turnaround & Performance Alignment',
    'Custom Digital System / App / Website Build',
    'Lean 5S & Work Standardisation Implementation',
    'Safety & Root Cause (CAPA) Systems',
    'Schedule Strategic Consultation',
    'Request Proposal',
    'Training Enquiry',
    'Support Request',
    'Partnership Request'
  ];

  const industrySectors = [
    'Manufacturing & Heavy Industry (Smelting, Plants, Foundries)',
    'Mining & Natural Resources',
    'Hospitals & Clinics / Healthcare',
    'Banks & Financial Institutions',
    'Government & Public Sector / Municipalities',
    'Private Sector & Corporate Enterprises',
    'Small & Medium Enterprises (SMEs)',
    'Other / Cross-Sector'
  ];

  const audiences = ['Organisation', 'Individual / Learner'];

  const services = [
    'Not Sure Yet',
    'Operational Turnaround (Smelting & Heavy Industry)',
    'Custom Digital Systems & Operational Web Apps',
    'Mobile Field & Safety Incident Apps',
    'High-Performance Websites & Cloud Edge Infrastructure',
    'Performance Management Systems (KPI Dashboards & Tier Reviews)',
    'Lean 5S & Work Standardisation (SOP Kiosks)',
    'Root Cause Analysis (Safety & Incident CAPA)',
    'Business Process Management (BPMN 2.0)',
    'Digital Transformation & Automation',
    'Organisational Development & Change Management',
    'Skills Development / Training'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFormStatus('sending');

    try {
      // 1. Record lead in application context & local state
      addLead(formData);

      // 2. Dispatch notification email directly through institutional Resend API
      const adminHtml = generateContactEnquiryAdminEmailHtml(formData);
      await sendInstitutionalEmail({
        to: 'enquiries@nexa-transform.com',
        subject: `[Website ${formData.enquiry_type}] from ${formData.name} (${formData.organisation || 'Individual'})`,
        html: adminHtml,
        from: 'NexaTransform Hub <admissions@nexa-transform.com>',
        reply_to: formData.email
      });

      // 3. Send automated confirmation email back to submitter
      if (isDeliverableEmail(formData.email)) {
        const clientHtml = generateContactEnquiryClientConfirmationHtml(formData);
        sendInstitutionalEmail({
          to: formData.email,
          subject: `Thank you for contacting NexaTransform Hub (${formData.enquiry_type})`,
          html: clientHtml,
          from: 'NexaTransform Hub <admissions@nexa-transform.com>',
          reply_to: 'enquiries@nexa-transform.com'
        }).catch(() => {});
      }

      setFormStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setFormData({
        name: '',
        organisation: '',
        industry_sector: 'Manufacturing & Heavy Industry (Smelting, Plants, Foundries)',
        email: '',
        phone: '',
        audience_type: 'Organisation',
        enquiry_type: 'Operational Turnaround & Performance Alignment',
        service_interest: 'Not Sure Yet',
        message: ''
      });
    } catch (err) {
      console.error('Contact submission error:', err);
      setErrorMessage('We could not deliver your message. Please email us directly at admissions@nexa-transform.com.');
      setFormStatus('error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="contact-root bg-glacial min-h-screen pb-20">
      <section className="bg-navy text-white py-20 px-4">
        <div className="container text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-300">
            Start your transformation journey today. Our team of experts is ready to assist you.
          </p>
        </div>
      </section>

      <section className="container max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue">
              <h3 className="text-2xl font-bold text-navy mb-6">Contact Details</h3>
              <ul className="space-y-6">
                 <li className="flex items-start gap-4">
                  <div className="bg-blue/10 p-3 rounded-full text-blue">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Email Us</p>
                    <a href="mailto:enquiries@nexa-transform.com" className="text-navy font-medium hover:text-blue transition-colors">enquiries@nexa-transform.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-turquoise/10 p-3 rounded-full text-turquoise">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Coverage</p>
                    <span className="text-navy font-medium">Nationwide and International</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-[#0A66C2]/10 p-3 rounded-full text-[#0A66C2]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">LinkedIn Company Profile</p>
                    <a 
                      href="https://www.linkedin.com/company/145239426/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-navy font-medium hover:text-blue transition-colors inline-flex items-center gap-1"
                    >
                      Nexa-Transform Group
                      <span className="text-xs text-gray-400">↗</span>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-card bg-white p-8 md:p-12 rounded-2xl shadow-lg">
              {formStatus === 'success' ? (
                <div className="text-center py-16">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block mb-6">
                    <CheckCircle size={80} className="text-emerald mx-auto" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-navy mb-4">Message Sent Successfully!</h2>
                  <p className="text-xl text-gray-600 mb-8">Thank you for reaching out. One of our consultants will contact you within 24 hours.</p>
                  <button onClick={() => setFormStatus('')} className="btn btn-outline border-gray-300 text-gray-600 hover:bg-gray-50">
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-navy mb-8 border-b border-gray-100 pb-4">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="audience_type" className="block text-sm font-bold text-gray-700 mb-2">I am a(n) <span className="text-red-500">*</span></label>
                        <select 
                          id="audience_type"
                          name="audience_type" 
                          value={formData.audience_type} 
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                          required
                        >
                          {audiences.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="enquiry_type" className="block text-sm font-bold text-gray-700 mb-2">Enquiry Type <span className="text-red-500">*</span></label>
                        <select 
                          id="enquiry_type"
                          name="enquiry_type" 
                          value={formData.enquiry_type} 
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                          required
                        >
                          {enquiryTypes.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                        <input 
                          id="name"
                          type="text" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="organisation" className="block text-sm font-bold text-gray-700 mb-2">Organisation {formData.audience_type !== 'Individual / Learner' && <span className="text-red-500">*</span>}</label>
                        <input 
                          id="organisation"
                          type="text" 
                          name="organisation" 
                          value={formData.organisation} 
                          onChange={handleChange}
                          placeholder="Your organisation name"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                          required={formData.audience_type !== 'Individual / Learner'}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Work Email <span className="text-red-500">*</span></label>
                        <input 
                          id="email"
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange}
                          placeholder="you@organisation.com"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                        <input 
                          id="phone"
                          type="tel" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange}
                          placeholder="+27 82 000 0000"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="industry_sector" className="block text-sm font-bold text-gray-700 mb-2">Industry Sector</label>
                        <select 
                          id="industry_sector"
                          name="industry_sector" 
                          value={formData.industry_sector} 
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                        >
                          {industrySectors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="service_interest" className="block text-sm font-bold text-gray-700 mb-2">Service of Interest</label>
                        <select 
                          id="service_interest"
                          name="service_interest" 
                          value={formData.service_interest} 
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                        >
                          {services.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">How can we help you?</label>
                      <textarea 
                        id="message"
                        name="message" 
                        value={formData.message} 
                        onChange={handleChange}
                        rows="4"
                        placeholder="Tell us about your goals or requirements..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent resize-none"
                      ></textarea>
                    </div>

                    {formStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                        {errorMessage || 'Failed to submit enquiry. Please try again or email us directly at admissions@nexa-transform.com.'}
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <button 
                        type="submit" 
                        disabled={formStatus === 'sending'} 
                        className={`btn bg-blue hover:bg-blue-700 text-white w-full py-4 text-lg font-bold flex items-center justify-center gap-2 ${formStatus === 'sending' ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {formStatus === 'sending' ? 'Submitting Enquiry...' : 'Submit Enquiry'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
