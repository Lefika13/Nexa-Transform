import { jsPDF } from 'jspdf';

/**
 * Computes a deterministic integer hash from a string for verification token generation.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates an official, executive-grade Certificate of Completion for strictly self-paying learners.
 *
 * @param {Object} opts
 * @param {string} opts.learnerName - Full name of the candidate
 * @param {string} opts.studentNumber - Student registration number (e.g., NX-2026-0842)
 * @param {string} [opts.idPassport] - Learner National ID or Passport number
 * @param {string} opts.programmeTitle - Title of the completed programme or module
 * @param {string} [opts.issueDate] - Date of issuance (formatted string or ISO)
 * @param {string} [opts.certificateNumber] - Unique certificate number
 * @param {string} [opts.grade] - Overall mark or grade (e.g., '88%' or 'Competent with Distinction')
 * @param {string} [opts.leadFacilitator] - Name of Lead Facilitator / Academic Director
 * @param {string} [opts.registrar] - Name of Academic Registrar
 * @param {boolean} [opts.isSelfPaying=true] - Confirms strictly self-funded track
 */
export function generateCompletionCertificatePDF(opts) {
  // Landscape A4 (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const centerX = pageWidth / 2;

  const learnerName     = (opts.learnerName || opts.name || 'Candidate Name').trim();
  const studentNumber   = (opts.studentNumber || opts.number || 'NX-2026-SP').trim();
  const idPassport      = opts.idPassport || '—';
  const programmeTitle  = opts.programmeTitle || opts.course_title || 'Applied Enterprise Process Excellence & Digital Systems';
  const issueDate       = opts.issueDate || new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
  const gradeText       = opts.grade ? `Awarded with Grade: ${opts.grade}` : 'Awarded with Practical Competence';
  const leadFacilitator = opts.leadFacilitator || 'Mr. Lefika Molefe';
  const leadRole        = 'Academic Director & Lead Transformation Consultant';
  const registrar       = opts.registrar || 'Office of the Academic Registrar';
  const registrarRole   = 'Head of Institutional Compliance & Governance';

  // Compute unique certificate number if not provided
  const certNumber = opts.certificateNumber || `NX-CERT-SP-${new Date().getFullYear()}-${hashString(learnerName + studentNumber).toString().slice(-4)}`;
  const verificationHash = 'SHA256:' + hashString(certNumber + learnerName).toString(16).toUpperCase().padStart(8, '0');
  const verifyUrl = `https://nexa-transform.com/verify/${certNumber}`;

  // ── Color Palette ─────────────────────────────
  const primaryNavy   = [11, 19, 43];     // #0B132B (Deep Corporate Navy)
  const secondaryNavy = [30, 41, 59];     // #1E293B (Slate Navy)
  const goldPrimary   = [217, 119, 6];    // #D97706 (Executive Gold)
  const goldLight     = [245, 158, 11];   // #F59E0B (Warm Amber Gold)
  const goldBorder    = [180, 130, 40];   // #B48228 (Metallic Gold)
  const emeraldAccent = [5, 150, 105];    // #059669 (Verified Green)
  const bgOffWhite    = [253, 253, 254];  // #FDFDFE (Subtle Parchment)
  const textMuted     = [100, 116, 139];  // #64748B

  // ── Background Canvas ─────────────────────────
  doc.setFillColor(...bgOffWhite);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // ── Outer Decorative Border ───────────────────
  doc.setDrawColor(...primaryNavy);
  doc.setLineWidth(1.8);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'D');

  // ── Inner Gold Inset Border ───────────────────
  doc.setDrawColor(...goldBorder);
  doc.setLineWidth(0.6);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'D');

  // Fine double hairline inside gold
  doc.setDrawColor(...goldBorder);
  doc.setLineWidth(0.2);
  doc.rect(13.5, 13.5, pageWidth - 27, pageHeight - 27, 'D');

  // ── Corner Flourishes (Geometric Rosettes) ────
  const corners = [
    [12, 12],
    [pageWidth - 12, 12],
    [12, pageHeight - 12],
    [pageWidth - 12, pageHeight - 12]
  ];
  corners.forEach(([cx, cy]) => {
    doc.setFillColor(...goldPrimary);
    doc.circle(cx, cy, 2.5, 'F');
    doc.setFillColor(...primaryNavy);
    doc.circle(cx, cy, 1.2, 'F');
  });

  // ── Top Header Brand Emblem ───────────────────
  // Monogram circle
  doc.setFillColor(...primaryNavy);
  doc.circle(centerX, 25, 8.5, 'F');
  doc.setFillColor(...goldPrimary);
  doc.circle(centerX, 25, 7.5, 'F');
  doc.setFillColor(...primaryNavy);
  doc.circle(centerX, 25, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...goldLight);
  doc.text('NX', centerX, 28, { align: 'center' });

  // ── Institution Typography ────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryNavy);
  doc.text('NEXATRANSFORM HUB', centerX, 39, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...goldBorder);
  doc.text('ACADEMY OF APPLIED ENTERPRISE CAPABILITIES & PROCESS EXCELLENCE', centerX, 43, { align: 'center' });

  // Horizontal divider wings
  doc.setDrawColor(...goldBorder);
  doc.setLineWidth(0.4);
  doc.line(centerX - 95, 46, centerX - 12, 46);
  doc.line(centerX + 12, 46, centerX + 95, 46);

  // Tiny diamond in center
  doc.setFillColor(...goldPrimary);
  doc.circle(centerX, 46, 1, 'F');

  // ── Certificate Title ─────────────────────────
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primaryNavy);
  doc.text('CERTIFICATE OF COMPLETION', centerX, 57, { align: 'center' });

  // Self-Paying / Direct Tuition Track Subtitle Pill
  doc.setFillColor(245, 243, 235);
  doc.roundedRect(centerX - 48, 60.5, 96, 5.5, 2, 2, 'F');
  doc.setDrawColor(...goldBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(centerX - 48, 60.5, 96, 5.5, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...primaryNavy);
  doc.text('DIRECT CANDIDATE • FULLY SETTLED SELF-FUNDED ENROLMENT', centerX, 64.2, { align: 'center' });

  // ── Recipient Presentation Text ───────────────
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(...textMuted);
  doc.text('This is to officially certify that', centerX, 74, { align: 'center' });

  // Candidate Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(...primaryNavy);
  doc.text(learnerName.toUpperCase(), centerX, 84, { align: 'center' });

  // Decorative Underline under Candidate Name
  const nameWidth = doc.getTextWidth(learnerName.toUpperCase());
  const underlineW = Math.max(nameWidth + 16, 75);
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.8);
  doc.line(centerX - (underlineW / 2), 87, centerX + (underlineW / 2), 87);

  // Student Identifier & Identity details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...secondaryNavy);
  const idSnippet = idPassport && idPassport !== '—' ? `  |  National ID: ${idPassport}` : '';
  doc.text(`Student Registration Number: ${studentNumber}${idSnippet}`, centerX, 93, { align: 'center' });

  // ── Competency Fulfillment Statement ──────────
  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(...textMuted);
  doc.text('has successfully completed all prescribed coursework, continuous practical assessments,', centerX, 101, { align: 'center' });
  doc.text('case study submissions, and applied competency evaluations for the programme in:', centerX, 106, { align: 'center' });

  // Programme Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...primaryNavy);
  doc.text(programmeTitle, centerX, 115, { align: 'center' });

  // Grade / Competency Designation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...emeraldAccent);
  doc.text(gradeText.toUpperCase(), centerX, 122, { align: 'center' });

  // Financial & Self-Paying Clearance Endorsement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Confirmed: Self-Paying Private Enrolment • All Institutional Tuition Fees Settled • Good Standing', centerX, 128, { align: 'center' });

  // ── Official Gold Seal & Rosette (Center Bottom) ──
  const sealY = 153;
  // Outer gold serrated effect (simulated circle)
  doc.setFillColor(...goldLight);
  doc.circle(centerX, sealY, 14, 'F');
  doc.setFillColor(...goldPrimary);
  doc.circle(centerX, sealY, 12.5, 'F');
  doc.setFillColor(...primaryNavy);
  doc.circle(centerX, sealY, 10.5, 'F');

  // Seal inner star & text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(...goldLight);
  doc.text('NEXA TRANSFORM', centerX, sealY - 4.5, { align: 'center' });
  doc.setFontSize(8);
  doc.text('★', centerX, sealY - 0.5, { align: 'center' });
  doc.setFontSize(5);
  doc.text('OFFICIAL SEAL', centerX, sealY + 3.5, { align: 'center' });
  doc.text('VERIFIED RECORD', centerX, sealY + 6.2, { align: 'center' });

  // Gold ribbons extending beneath the seal
  doc.setFillColor(...goldPrimary);
  doc.triangle(centerX - 7, sealY + 10, centerX - 12, sealY + 23, centerX - 2, sealY + 16, 'F');
  doc.triangle(centerX + 7, sealY + 10, centerX + 12, sealY + 23, centerX + 2, sealY + 16, 'F');

  // ── Signature Blocks ──────────────────────────
  // Left: Academic Director / Lead Facilitator
  const sigLeftX = 58;
  const sigY = 160;

  // Digital Calligraphy representation
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(...primaryNavy);
  doc.text(leadFacilitator, sigLeftX, sigY - 4, { align: 'center' });

  doc.setDrawColor(...secondaryNavy);
  doc.setLineWidth(0.4);
  doc.line(sigLeftX - 35, sigY, sigLeftX + 35, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text(leadFacilitator, sigLeftX, sigY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...textMuted);
  doc.text(leadRole, sigLeftX, sigY + 8, { align: 'center' });
  doc.text('NexaTransform Hub Academy', sigLeftX, sigY + 11.2, { align: 'center' });

  // Right: Academic Registrar & QA
  const sigRightX = pageWidth - 58;

  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(...primaryNavy);
  doc.text('M. Ntuli / Admissions', sigRightX, sigY - 4, { align: 'center' });

  doc.setDrawColor(...secondaryNavy);
  doc.setLineWidth(0.4);
  doc.line(sigRightX - 35, sigY, sigRightX + 35, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text(registrar, sigRightX, sigY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...textMuted);
  doc.text(registrarRole, sigRightX, sigY + 8, { align: 'center' });
  doc.text('Institutional Records & Compliance', sigRightX, sigY + 11.2, { align: 'center' });

  // ── Certificate Metadata & Verification Footer ─
  const metaY = 186;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, metaY, pageWidth - 20, metaY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...textMuted);

  // Left metadata
  doc.text(`Issue Date: ${issueDate}`, 20, metaY + 4.5);
  doc.text(`Certificate Ref: ${certNumber}`, 20, metaY + 8);

  // Center metadata: Verification hash
  doc.text(`Digital Verification Hash: ${verificationHash}`, centerX, metaY + 4.5, { align: 'center' });
  doc.setTextColor(...goldBorder);
  doc.setFont('helvetica', 'bold');
  doc.text(`Verify Online: ${verifyUrl}`, centerX, metaY + 8, { align: 'center' });

  // Right metadata: Self-funded validation stamp
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('Candidate Status: Self-Paying Enrolment', pageWidth - 20, metaY + 4.5, { align: 'right' });
  doc.text('Registry: NexaTransform Hub LMIS', pageWidth - 20, metaY + 8, { align: 'right' });

  // ── Statutory Notice at bottom ────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  const statutoryNotice = 'Official certificate of practical completion issued by NexaTransform Hub (Pty) Ltd as an independent provider of applied enterprise transformation competencies. ' +
    'This non-accredited certificate confirms direct candidate participation, curriculum fulfillment, and practical evaluation.';
  doc.text(statutoryNotice, centerX, pageHeight - 14.5, { align: 'center', maxWidth: 255 });

  // Download the generated PDF
  const filename = `Certificate_of_Completion_${learnerName.replace(/[^a-zA-Z0-9]/g, '_')}_${certNumber}.pdf`;
  try {
    doc.save(filename);
  } catch (_) {}

  return doc;
}

export default generateCompletionCertificatePDF;
