import { jsPDF } from 'jspdf';
import { ACADEMIC_CONSTANTS } from './gradeCalculations';

/**
 * Generates an official Academic Transcript / Statement of Results PDF.
 *
 * @param {Object} opts
 * @param {string} opts.name - Learner full name
 * @param {string} opts.email - Learner email
 * @param {string} opts.studentNumber - Student Number
 * @param {string} opts.idPassport - ID / Passport Number
 * @param {string} opts.programme - Enrolled programme title
 * @param {Array}  opts.moduleRecords - Array of calculated module records
 * @param {number} opts.programmeAggregate - Overall aggregate score percentage
 * @param {string} opts.qualificationOutcome - 'Passed with Distinction' | 'Passed' | 'In Progress'
 * @param {boolean} opts.isDistinction - True if overall aggregate >= 75%
 */
export function generateAcademicTranscriptPDF(opts) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const name = opts.name || 'Learner';
  const email = opts.email || '—';
  const studentNumber = opts.studentNumber || 'NX-PENDING';
  const idPassport = opts.idPassport || '—';
  const programme = opts.programme || 'Business Process and Work Study Management';
  const moduleRecords = opts.moduleRecords || [];
  const programmeAggregate = opts.programmeAggregate !== null ? `${opts.programmeAggregate}%` : 'In Progress';
  const outcome = opts.qualificationOutcome || 'In Progress';
  const isDistinction = opts.isDistinction || false;
  const issueDate = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Colors ─────────────────────────────────────
  const navy = [10, 25, 47];       // #0A192F
  const gold = [201, 163, 78];     // #C9A34E
  const dark = [15, 23, 42];       // #0F172A
  const muted = [100, 116, 139];   // #64748B
  const emerald = [16, 185, 129];  // #10B981

  // ── Header Banner ──────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFillColor(...gold);
  doc.rect(0, 40, 210, 2.5, 'F');

  // Logo Icon
  doc.setFillColor(...gold);
  doc.circle(20, 20, 9, 'F');
  doc.setFillColor(...navy);
  doc.circle(20, 20, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...gold);
  doc.text('NX', 16.5, 23.5);

  // Institution Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('NEXA TRANSFORM HUB', 34, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 215, 235);
  doc.text('STATEMENT OF RESULTS & ACADEMIC TRANSCRIPT', 34, 25);
  doc.setFontSize(7.5);
  doc.setTextColor(160, 180, 205);
  doc.text('Continuous Assessment (CASS 60%) · Final Examination (40%) Framework', 34, 31);

  // Issue Date badge
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Issued: ${issueDate}`, 160, 18);

  // ── Student Details Box ────────────────────────
  let y = 52;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 34, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 34, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...gold);
  doc.text('LEARNER & PROGRAMME INFORMATION', 20, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...dark);
  doc.text('Full Name:', 20, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(name, 50, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Student No:', 115, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(studentNumber, 142, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('ID / Passport:', 20, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(idPassport, 50, y + 21);

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 115, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(email, 142, y + 21);

  doc.setFont('helvetica', 'bold');
  doc.text('Programme:', 20, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(programme, 50, y + 28);

  const primaryPeriod = moduleRecords[0]?.academic_period?.period_code || '0: YEAR (JAN-DEC)';
  doc.setFont('helvetica', 'bold');
  doc.text('Academic Period:', 115, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(primaryPeriod, 142, y + 28);

  // ── Programme Standing Banner ──────────────────
  y += 42;
  const isPassOrDist = outcome.toLowerCase().includes('pass');
  doc.setFillColor(isDistinction ? 254 : 240, isDistinction ? 249 : 253, isDistinction ? 195 : 244);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'F');
  doc.setDrawColor(isDistinction ? 202 : 16, isDistinction ? 138 : 185, isDistinction ? 4 : 129);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(isDistinction ? 133 : 6, isDistinction ? 77 : 95, isDistinction ? 14 : 70);
  const awardText = isDistinction
    ? 'PROGRAMME STATUS: PASSED WITH DISTINCTION 🏆'
    : `PROGRAMME STATUS: ${outcome.toUpperCase()}`;
  doc.text(awardText, 20, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Cumulative Aggregate: ${programmeAggregate}`, 135, y + 10.5);

  // ── Enrolled Modules Table ─────────────────────
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...navy);
  doc.text('ENROLLED MODULES & WEIGHTED RESULTS BREAKDOWN', 14, y);

  y += 5;
  // Table Header
  doc.setFillColor(...navy);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Module Code & Title', 18, y + 5.5);
  doc.text('Half Period Mark', 92, y + 5.5);
  doc.text('Exam Adm.', 122, y + 5.5);
  doc.text('Exam Mark', 145, y + 5.5);
  doc.text('Full Period Mark', 168, y + 5.5);

  y += 8;
  // Table Rows
  if (moduleRecords.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text('No enrolled modules found.', 20, y + 8);
    y += 14;
  } else {
    moduleRecords.forEach((m, idx) => {
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 10, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 10, 196, y + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...dark);
      const titleDisplay = `${m.course_code} - ${(m.course_title || '').substring(0, 32)}`;
      doc.text(titleDisplay, 18, y + 6.5);

      // Half Period Mark
      doc.setFont('helvetica', 'normal');
      doc.text(m.half_period_mark !== null && m.half_period_mark !== undefined ? `${m.half_period_mark}%` : (m.cass_mark !== null ? `${m.cass_mark}%` : '—'), 95, y + 6.5);

      // Exam Admission Flag (Y/N)
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(m.is_exam_admitted ? 16 : 180, m.is_exam_admitted ? 120 : 50, m.is_exam_admitted ? 80 : 50);
      doc.text(m.exam_admission_flag || (m.is_exam_admitted ? 'Y' : 'N'), 125, y + 6.5);

      // Exam Mark
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...dark);
      doc.text(m.exam_mark !== null ? `${m.exam_mark}%` : '—', 148, y + 6.5);

      // Full Period Mark
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(m.is_distinction ? 180 : 15, m.is_distinction ? 120 : 23, m.is_distinction ? 10 : 42);
      doc.text(m.full_period_mark !== null && m.full_period_mark !== undefined ? `${m.full_period_mark}%` : (m.final_composite_mark !== null ? `${m.final_composite_mark}%` : '—'), 172, y + 6.5);

      y += 10;
    });
  }

  // ── Document Notice ────────
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 14, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...gold);
  doc.text('OFFICIAL RECORD OF RESULTS', 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text('This progress report reflects verified marks recorded in the Nexa Transform academic management system.', 18, y + 9.5);

  // ── Official Sign-off & Verification ───────────
  y += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text('Academic Registrar', 25, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text('Office of the Registrar', 25, y + 4.5);
  doc.line(25, y - 2, 75, y - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text('Academic Assessment Team', 135, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text('Nexa Transform Assessment Authority', 135, y + 4.5);
  doc.line(135, y - 2, 185, y - 2);

  // Footer Watermark
  doc.setFontSize(7);
  doc.setTextColor(160, 175, 195);
  doc.text('Nexa Transform LMIS · Academic Performance Record · https://nexa-transform.com', 55, 285);

  // Trigger Save
  const cleanName = (name || 'learner').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Academic_Statement_${cleanName}_${new Date().getFullYear()}.pdf`);
  return doc;
}
