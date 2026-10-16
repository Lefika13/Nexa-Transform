import { jsPDF } from 'jspdf';

/**
 * Generates an official, downloadable Proof of Registration PDF.
 *
 * @param {Object} opts
 * @param {string} opts.name - Learner / Lecturer full name
 * @param {string} opts.email - Target email delivered to
 * @param {string} opts.number - Student Number or Staff ID
 * @param {string} [opts.role='Learner'] - Role ('Learner' | 'Lecturer' | 'Admin')
 * @param {string} [opts.idPassport='—'] - ID / Passport Number
 * @param {string} [opts.phone='—'] - Phone number
 * @param {string} [opts.regDate] - ISO date or formatted date string
 * @param {string} [opts.qualification] - Enrolled module / qualification
 */
export function generateProofOfRegistrationPDF(opts) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const name          = opts.name || 'Registered User';
  const email         = opts.email || '—';
  const refNumber     = opts.number || 'NX-2026-PENDING';
  const role          = opts.role || 'Learner';
  const idPassport    = opts.idPassport || '—';
  const phone         = opts.phone || '—';
  const moduleEnrolled= opts.qualification || opts.programme || 'Business Process and Work Study Management';
  const regDate       = opts.regDate || new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  const yr = new Date().getFullYear();
  const academicYear  = `${yr} / ${yr + 1} Academic Period`;

  // ── Color Palette ─────────────────────────────
  const primaryNavy = [10, 25, 47];     // #0A192F
  const goldAccent  = [201, 163, 78];   // #C9A34E
  const tealAccent  = [6, 182, 212];    // #06B6D4
  const bgLight     = [248, 250, 252];  // #F8FAFC
  const textDark    = [15, 23, 42];     // #0F172A
  const textMuted   = [100, 116, 139];  // #64748B

  // ── Header Background Banner ──────────────────
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 38, 'F');

  // Gold accent bar under banner
  doc.setFillColor(...goldAccent);
  doc.rect(0, 38, 210, 2.5, 'F');

  // ── Top Left Logo Representation ──────────────
  // Hexagon/Logo Badge
  doc.setFillColor(...goldAccent);
  doc.circle(18, 19, 9, 'F');
  doc.setFillColor(...primaryNavy);
  doc.circle(18, 19, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...goldAccent);
  doc.text('NX', 14.5, 22.5);

  // Logo Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('NexaTransform Hub', 32, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...tealAccent);
  doc.text('Learning Management Information System (LMIS)', 32, 25);

  // Top Right Document Title Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...goldAccent);
  doc.text('PROOF OF REGISTRATION', 200, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Official Document • ${regDate}`, 200, 24, { align: 'right' });

  // ── Section 1: Highlight Box ──────────────────
  let y = 48;
  doc.setFillColor(...bgLight);
  doc.roundedRect(12, y, 186, 32, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, y, 186, 32, 3, 3, 'D');

  // Student / Staff ID Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text(role === 'Lecturer' ? 'STAFF / LECTURER ID' : 'STUDENT NUMBER', 18, y + 9);
  doc.setFontSize(13);
  doc.setTextColor(...primaryNavy);
  doc.text(refNumber, 18, y + 17);

  // Email Delivered To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text('DELIVERED EMAIL ADDRESS', 90, y + 9);
  doc.setFontSize(10.5);
  doc.setTextColor(...textDark);
  doc.text(email, 90, y + 17);

  // Registration Date & Period
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text('REGISTRATION PERIOD', 150, y + 9);
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryNavy);
  doc.text(regDate, 150, y + 17);
  doc.setFontSize(8);
  doc.setTextColor(...goldAccent);
  doc.text(academicYear, 150, y + 23);

  // ── Section 2: Programme Information ──────────
  y += 40;
  doc.setFillColor(...primaryNavy);
  doc.rect(12, y, 186, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('1. OVERARCHING ACADEMIC PROGRAMME DETAILS', 16, y + 5);

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textMuted);
  doc.text('Overarching Programme Name:', 16, y);
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text('Business Process and Work Study Management', 72, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...textMuted);
  doc.text('Enrolled Module / Specialization:', 16, y);
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text(moduleEnrolled, 72, y);

  y += 7;
  // Programme structure notice box
  doc.setFillColor(238, 242, 255); // soft lavender/blue bg
  doc.roundedRect(16, y, 178, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(55, 48, 163);
  doc.text(
    'Note: All academic courses and specialized modules offered within the NexaTransform Hub LMIS fall directly',
    20, y + 5
  );
  doc.text(
    'under the training programme curriculum of "Business Process and Work Study Management".',
    20, y + 10
  );

  // ── Section 3: Learner / Lecturer Information ─
  y += 22;
  doc.setFillColor(...primaryNavy);
  doc.rect(12, y, 186, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`2. REGISTERED ${role.toUpperCase()} PERSONAL PARTICULARS`, 16, y + 5);

  y += 11;
  const col1X = 16, col2X = 110;
  
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...textMuted);
  doc.text('Full Name:', col1X, y);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...textDark);
  doc.text(name, col1X + 35, y);

  doc.setFont('helvetica', 'bold'); doc.setTextColor(...textMuted);
  doc.text('ID / Passport No:', col2X, y);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...textDark);
  doc.text(idPassport, col2X + 35, y);

  y += 7;
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...textMuted);
  doc.text('Email Address:', col1X, y);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...textDark);
  doc.text(email, col1X + 35, y);

  doc.setFont('helvetica', 'bold'); doc.setTextColor(...textMuted);
  doc.text('Phone Contact:', col2X, y);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...textDark);
  doc.text(phone, col2X + 35, y);

  y += 7;
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...textMuted);
  doc.text('Account Role:', col1X, y);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...goldAccent);
  doc.text(role, col1X + 35, y);

  doc.setFont('helvetica', 'bold'); doc.setTextColor(...textMuted);
  doc.text('Registration Status:', col2X, y);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(34, 197, 94);
  doc.text('CONFIRMED / ACTIVE', col2X + 35, y);

  // ── Section 4: How Online Registration is Completed ─
  y += 15;
  doc.setFillColor(...primaryNavy);
  doc.rect(12, y, 186, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('3. HOW TO COMPLETE YOUR ONLINE REGISTRATION & PORTAL ONBOARDING', 16, y + 5);

  y += 12;
  const steps = [
    { title: 'Step 1: Access Portal', text: 'Visit https://nexa-transform.com/lmis and select your portal (Learner or Lecturer).' },
    { title: 'Step 2: Sign In Credentials', text: `Use your registered email (${email}) and Student Number / Password (${refNumber}).` },
    { title: 'Step 3: Password Setup', text: 'Click "Forgot Password? Send Reset Email" to set a custom secure password via your inbox link.' },
    { title: 'Step 4: Module Activation', text: 'Once logged in, verify your personal details, access course materials, quizzes, and assignments.' }
  ];

  steps.forEach((step, idx) => {
    // Step Number Badge
    doc.setFillColor(...goldAccent);
    doc.circle(18, y - 1, 3.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryNavy);
    doc.text(String(idx + 1), 16.8, y + 1.5);

    // Step text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryNavy);
    doc.text(step.title, 24, y + 1);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text(step.text, 62, y + 1);

    y += 8;
  });

  // ── Footer / Authentication Stamp ─────────────
  const footerY = 262;
  doc.setDrawColor(226, 232, 240);
  doc.line(12, footerY, 198, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryNavy);
  doc.text('NexaTransform Hub Registrations Office', 12, footerY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Website: https://nexa-transform.com  |  Support: support@nexa-transform.com  |  Tel: +27 (0)11 500 1000', 12, footerY + 9);
  doc.text('This document serves as official confirmation of registration in the NexaTransform Hub LMIS database.', 12, footerY + 13);

  // Digital stamp badge right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(34, 197, 94);
  doc.text('✓ DIGITALLY VERIFIED', 198, footerY + 5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...textMuted);
  doc.text(`Doc ID: ${refNumber}-${Date.now().toString().slice(-6)}`, 198, footerY + 9, { align: 'right' });

  // ── Download Trigger ──────────────────────────
  const cleanName = String(name).replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Proof_of_Registration_${refNumber}_${cleanName}.pdf`;
  doc.save(filename);
  return doc;
}
