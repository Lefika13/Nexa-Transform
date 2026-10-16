import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { FileAttachmentZone } from './LmisAttachment';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { generateProofOfRegistrationPDF } from '../utils/registrationPdf';
import { isDeliverableEmail } from '../utils/emailValidator';
import { getPortalSession } from '../utils/sessionManager';
import './LmisCommon.css';

export const LecturerRegistration = () => {
  const navigate = useNavigate();
  const { system_lecturers, createRecord, logAuditAction } = useData();

  // Admin Authorization Check for Security
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return getPortalSession('admin').authenticated;
    } catch {
      return false;
    }
  });

  const [formData, setFormData] = useState({
    title: 'Mr.',
    first_name: '',
    surname: '',
    email: '',
    phone: '',
    id_passport: '',
    gender: 'Male',
    date_of_birth: '',
    nationality: 'South African',
    physical_address: '',
    city: 'Johannesburg',
    province: 'Gauteng',
    postal_code: '',
    
    // Academic & Professional
    highest_qualification: "Master's Degree",
    qualification_title: '',
    institution_obtained: '',
    graduation_year: '2020',
    department: 'BPM & Operations',
    academic_role: 'Lead Facilitator',
    years_experience: '5',
    subject_expertise: 'Process Modeling, Workflow Optimization, Work Study',
    professional_body_reg: '',
    
    // Password
    password: 'NexaLec#' + Math.floor(1000 + Math.random() * 9000),
    confirm_password: '',

    // Declarations
    declaration_truthful: true,
    declaration_code_of_conduct: true,
    declaration_popia: true,

    // File attachments
    id_copy_attachments: [],
    qualification_proof_attachments: [],
    cv_attachments: [],
    bank_proof_attachments: [],
    professional_body_attachments: []
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // If NOT Admin, render secure Access Restricted screen
  if (!isAdminAuthenticated) {
    return (
      <div className="lp-root" style={{ minHeight: '100vh', padding: '3rem 1rem', background: '#0a192f', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="lp-grid-bg" />
        <div style={{ maxWidth: '560px', width: '100%', background: '#0f172a', border: '1px solid rgba(202,138,4,0.4)', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(202,138,4,0.15)', border: '1px solid #ca8a04', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontSize: '1.75rem' }}>
            🔒
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Administrator Authorization Required
          </h2>
          <span className="badge badge-gold" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            Security &amp; Institutional Governance Policy
          </span>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            To safeguard institutional records, learner portfolios, and confidential assessment information, registration of Academic Facilitators and Lecturers is strictly performed by authorized Administrators.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/lmis/admin"
              className="btn btn-gold"
              style={{ padding: '0.75rem 1.5rem', background: '#ca8a04', color: '#0f172a', fontWeight: 800, textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem' }}
            >
              Sign In as Administrator to Onboard Faculty →
            </Link>
            <Link
              to="/lmis"
              style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem', marginTop: '0.5rem' }}
            >
              ← Return to LMIS Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.first_name.trim() || !formData.surname.trim()) {
      setErrorMsg('Please enter the facilitator full legal first name and surname.');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!isDeliverableEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid, deliverable email address.');
      return;
    }

    const cleanId = formData.id_passport.trim();
    if (!cleanId) {
      setErrorMsg('Please provide the National Identity or Passport Number.');
      return;
    }

    const existingLecEmail = (system_lecturers || []).find(l => l.email?.toLowerCase() === cleanEmail);
    if (existingLecEmail) {
      setErrorMsg(`A lecturer with email "${cleanEmail}" is already registered.`);
      return;
    }

    const existingLecId = (system_lecturers || []).find(l => l.id_passport && l.id_passport.trim() === cleanId);
    if (existingLecId) {
      setErrorMsg(`A faculty member with ID / Passport "${cleanId}" is already registered.`);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Please create a secure password of at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.title} ${formData.first_name.trim()} ${formData.surname.trim()}`;
      const staffNumber = `NX-FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newLecturerRecord = {
        id: 'LEC-' + Date.now(),
        staff_number: staffNumber,
        name: fullName,
        title: formData.title,
        first_name: formData.first_name.trim(),
        surname: formData.surname.trim(),
        email: cleanEmail,
        phone: formData.phone.trim() || '+27 82 000 0000',
        id_passport: cleanId,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        nationality: formData.nationality,
        physical_address: formData.physical_address,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postal_code,

        highest_qualification: formData.highest_qualification,
        qualification_title: formData.qualification_title,
        institution_obtained: formData.institution_obtained,
        graduation_year: formData.graduation_year,
        department: formData.department,
        academic_role: formData.academic_role,
        years_experience: formData.years_experience,
        subject_expertise: formData.subject_expertise,
        professional_body_reg: formData.professional_body_reg,

        id_copy_attachments: formData.id_copy_attachments,
        qualification_proof_attachments: formData.qualification_proof_attachments,
        cv_attachments: formData.cv_attachments,
        bank_proof_attachments: formData.bank_proof_attachments,
        professional_body_attachments: formData.professional_body_attachments,

        password: formData.password,
        status: 'Active',
        created_at: new Date().toISOString()
      };

      await createRecord('system_lecturers', newLecturerRecord);

      logAuditAction({
        action_type: 'REGISTER',
        performed_by: 'Administrator',
        role: 'Super Admin',
        target_entity: 'Faculty Registration',
        details: `Administrator registered and verified new Academic Facilitator ${fullName} (${cleanEmail}) with statutory document attachments.`
      });

      try {
        generateProofOfRegistrationPDF({
          name: fullName,
          email: cleanEmail,
          number: staffNumber,
          role: 'Lecturer',
          idPassport: cleanId,
          phone: formData.phone,
          qualification: `${formData.department} — ${formData.academic_role}`
        });
      } catch (pdfErr) {
        console.warn('PDF generation note:', pdfErr);
      }

      setSuccessData(newLecturerRecord);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Failed to complete faculty registration: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="lp-root" style={{ minHeight: '100vh', padding: '2rem 1rem', background: '#0a192f', color: '#f8fafc' }}>
      <div className="lp-grid-bg" />

      {/* Header */}
      <header className="lp-header" style={{ maxWidth: '960px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="lp-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.svg" alt="NexaTransform" className="lp-brand-logo" style={{ height: '36px' }} />
          <span className="lp-brand-name" style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
            NEXA<span style={{ color: '#ca8a04' }}>TRANSFORM</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ThemeToggle />
          <Link to="/lmis/admin" className="lp-back-link" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>
            ← Back to Admin Portal
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        
        {successData ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(22,163,74,0.2)', border: '2px solid #16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2rem', color: '#22c55e' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Faculty Member Successfully Registered!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
              Administrator onboarding completed for <strong>{successData.name}</strong>. The profile, statutory credentials, and compliance documents are permanently synced. The official <strong>Faculty Appointment &amp; Registration PDF</strong> has been downloaded.
            </p>

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem', maxWidth: '480px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Staff Identifier:</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ca8a04', marginBottom: '0.75rem' }}>{successData.staff_number}</div>

              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Module &amp; Role:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>{successData.department} — {successData.academic_role}</div>

              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Login Email &amp; Password:</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{successData.email} (Password: <code style={{ color: '#ca8a04' }}>{successData.password}</code>)</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  generateProofOfRegistrationPDF({
                    name: successData.name,
                    email: successData.email,
                    number: successData.staff_number,
                    role: 'Lecturer',
                    idPassport: successData.id_passport,
                    phone: successData.phone,
                    qualification: `${successData.department} — ${successData.academic_role}`
                  });
                }}
                className="btn btn-outline"
                style={{ borderColor: '#ca8a04', color: '#ca8a04', padding: '0.6rem 1.25rem' }}
              >
                📥 Download Appointment PDF
              </button>
              <Link
                to="/lmis/admin"
                className="btn btn-gold"
                style={{ padding: '0.6rem 1.5rem', background: '#ca8a04', color: '#0f172a', fontWeight: 700, textDecoration: 'none', borderRadius: '6px' }}
              >
                Return to Admin Portal →
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>
                Admin Faculty Onboarding System
              </span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Register Lecturer / Academic Facilitator
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0.4rem 0 0 0' }}>
                Capture faculty demographics, academic credentials, and statutory compliance documents.
              </p>
            </div>

            {errorMsg && (
              <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fecaca', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>1.</span> Personal Demographics &amp; Contact Details
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Title</label>
                    <select className="lmis-select" value={formData.title} onChange={e => updateField('title', e.target.value)} style={{ width: '100%', background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
                      <option>Dr.</option>
                      <option>Prof.</option>
                      <option>Mr.</option>
                      <option>Ms.</option>
                      <option>Mrs.</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>First Name(s) *</label>
                    <input className="lmis-input" value={formData.first_name} onChange={e => updateField('first_name', e.target.value)} required placeholder="e.g. Sipho David" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Surname *</label>
                    <input className="lmis-input" value={formData.surname} onChange={e => updateField('surname', e.target.value)} required placeholder="e.g. Mthembu" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>National ID / Passport Number *</label>
                    <input className="lmis-input" value={formData.id_passport} onChange={e => updateField('id_passport', e.target.value)} required placeholder="13-digit ID or Passport" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Date of Birth</label>
                    <input type="date" className="lmis-input" value={formData.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Gender</label>
                    <select className="lmis-select" value={formData.gender} onChange={e => updateField('gender', e.target.value)} style={{ width: '100%', background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other / Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Institutional Email Address *</label>
                    <input type="email" className="lmis-input" value={formData.email} onChange={e => updateField('email', e.target.value)} required placeholder="e.g. lecturer@nexatransform.co.za" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Contact Phone Number *</label>
                    <input className="lmis-input" value={formData.phone} onChange={e => updateField('phone', e.target.value)} required placeholder="+27 82 123 4567" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ACADEMIC QUALIFICATIONS & SPECIALIZATION */}
              <div style={{ marginBottom: '2rem', borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>2.</span> Academic Credentials &amp; Module Specialization
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Highest Qualification Level *</label>
                    <select className="lmis-select" value={formData.highest_qualification} onChange={e => updateField('highest_qualification', e.target.value)} style={{ width: '100%', background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
                      <option>Doctorate / PhD</option>
                      <option>Master's Degree</option>
                      <option>Honours Degree</option>
                      <option>Postgraduate Diploma</option>
                      <option>Bachelor's Degree</option>
                      <option>National Diploma</option>
                      <option>Advanced Certificate</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Qualification Title *</label>
                    <input className="lmis-input" value={formData.qualification_title} onChange={e => updateField('qualification_title', e.target.value)} required placeholder="e.g. MCom in Business Process Management" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Awarding University / Institution *</label>
                    <input className="lmis-input" value={formData.institution_obtained} onChange={e => updateField('institution_obtained', e.target.value)} required placeholder="e.g. University of Johannesburg" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Graduation Year</label>
                    <input type="number" className="lmis-input" value={formData.graduation_year} onChange={e => updateField('graduation_year', e.target.value)} placeholder="2020" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Assigned Module</label>
                    <select className="lmis-select" value={formData.department} onChange={e => updateField('department', e.target.value)} style={{ width: '100%', background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
                      <option>BPM &amp; Operations</option>
                      <option>Digital Transformation</option>
                      <option>AI &amp; Data Solutions</option>
                      <option>Skills Development</option>
                      <option>Organisational Development</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Academic Role / Position</label>
                    <select className="lmis-select" value={formData.academic_role} onChange={e => updateField('academic_role', e.target.value)} style={{ width: '100%', background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
                      <option>Lead Facilitator</option>
                      <option>Senior Lecturer</option>
                      <option>Lecturer</option>
                      <option>Academic Evaluator</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Years of Experience</label>
                    <input type="number" className="lmis-input" value={formData.years_experience} onChange={e => updateField('years_experience', e.target.value)} placeholder="5" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>Assigned Login Password</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input className="lmis-input" value={formData.password} onChange={e => updateField('password', e.target.value)} required style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} />
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => updateField('password', 'NexaLec#' + Math.floor(1000 + Math.random() * 9000))}>
                        🎲
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: STATUTORY & LEGAL DOCUMENT UPLOADS */}
              <div style={{ marginBottom: '2rem', borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>3.</span> Statutory Compliance Document Uploads
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                  Attach certified copies of ID, degree certificates, CV, and banking verification.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* 1. ID Copy */}
                  <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                      📄 Certified ID / Passport Copy
                    </label>
                    <FileAttachmentZone
                      bucket="lecturer-documents"
                      folder={`id-copies/${formData.email || 'admin-upload'}`}
                      onUploadComplete={(files) => updateField('id_copy_attachments', files)}
                      existingFiles={formData.id_copy_attachments}
                      maxFiles={2}
                      label="Upload Certified ID (PDF/PNG)"
                    />
                  </div>

                  {/* 2. Qualification Proof */}
                  <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                      🎓 Degree / Qualification Certificates
                    </label>
                    <FileAttachmentZone
                      bucket="lecturer-documents"
                      folder={`qualifications/${formData.email || 'admin-upload'}`}
                      onUploadComplete={(files) => updateField('qualification_proof_attachments', files)}
                      existingFiles={formData.qualification_proof_attachments}
                      maxFiles={5}
                      label="Upload Degree Certificates"
                    />
                  </div>

                  {/* 3. Detailed CV */}
                  <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                      💼 Comprehensive CV / Resume
                    </label>
                    <FileAttachmentZone
                      bucket="lecturer-documents"
                      folder={`resumes/${formData.email || 'admin-upload'}`}
                      onUploadComplete={(files) => updateField('cv_attachments', files)}
                      existingFiles={formData.cv_attachments}
                      maxFiles={2}
                      label="Upload Academic CV (PDF)"
                    />
                  </div>

                  {/* 4. Bank / Tax Proof */}
                  <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                      🏦 Proof of Banking / SARS Tax Document
                    </label>
                    <FileAttachmentZone
                      bucket="lecturer-documents"
                      folder={`banking/${formData.email || 'admin-upload'}`}
                      onUploadComplete={(files) => updateField('bank_proof_attachments', files)}
                      existingFiles={formData.bank_proof_attachments}
                      maxFiles={2}
                      label="Upload Bank Confirmation / SARS"
                    />
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to="/lmis/admin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Cancel &amp; Return to Admin Portal
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-gold"
                  style={{ background: '#ca8a04', color: '#0f172a', fontWeight: 800, padding: '0.75rem 2rem', fontSize: '0.95rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {loading ? 'Registering Faculty Member...' : '✓ Complete Registration & Issue Appointment PDF'}
                </button>
              </div>

            </form>
          </div>
        )}
      </main>
    </div>
  );
};
