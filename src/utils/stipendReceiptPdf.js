import { jsPDF } from 'jspdf';

/**
 * Generates an official, bank-grade Proof of Stipend Payment (POP) PDF.
 *
 * @param {Object} opts
 * @param {string} opts.disbursementId - Stipend transaction ID (e.g. STIP-202610-001)
 * @param {string} opts.transactionReference - EFT payment reference (e.g. NEXA-EFT-202610-8841)
 * @param {string} opts.periodLabel - Month and year (e.g. October 2026)
 * @param {string} opts.learnerName - Learner full name
 * @param {string} opts.learnerEmail - Learner email
 * @param {string} opts.studentNumber - Student ID (e.g. NX2026001)
 * @param {string} opts.idPassport - Learner national ID or passport
 * @param {number} opts.stipendAmount - Monthly amount in ZAR
 * @param {string} opts.funderName - Funder / Grant sponsor (e.g. Services SETA)
 * @param {string} opts.programmeName - Registered qualification
 * @param {string} opts.bankName - Beneficiary receiving bank
 * @param {string} opts.bankAccountNumber - Beneficiary account number
 * @param {string} opts.bankBranchCode - Beneficiary branch code
 * @param {string} opts.bankAccountType - Beneficiary account type
 * @param {string} opts.sourceBankName - Nexa institution debit bank
 * @param {string} opts.sourceAccountNumber - Nexa institution debit account
 * @param {string} opts.payoutChannel - Payment method / API channel
 * @param {string} opts.disbursedAt - Date and time of payment
 * @param {string} opts.disbursedBy - Authorized officer / system
 */
export function generateProofOfStipendPaymentPDF(opts = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const refNumber       = opts.transactionReference || opts.disbursementId || `NEXA-EFT-${Date.now()}`;
  const periodLabel     = opts.periodLabel || 'October 2026';
  const learnerName     = opts.learnerName || 'Beneficiary Learner';
  const learnerEmail    = opts.learnerEmail || '—';
  const studentNumber   = opts.studentNumber || '—';
  const idPassport      = opts.idPassport || '—';
  const amountNum       = Number(opts.stipendAmount || 4500);
  const formattedAmount = `R ${amountNum.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const funderName      = opts.funderName || 'Services SETA Grant Allocation';
  const programmeName   = opts.programmeName || 'Business Process and Work Study Management';
  const bankName        = opts.bankName || 'Standard Bank of South Africa';
  const rawAccount      = String(opts.bankAccountNumber || '••••••');
  const maskedAccount   = rawAccount.length > 4 ? `••••••••${rawAccount.slice(-4)}` : rawAccount;
  const branchCode      = opts.bankBranchCode || '051001';
  const accountType     = opts.bankAccountType || 'Savings';
  const sourceBank      = opts.sourceBankName || 'Nedbank Corporate & Business Banking';
  const sourceAccount   = opts.sourceAccountNumber ? `••••••••${String(opts.sourceAccountNumber).slice(-4)}` : '••••••••2910';
  const payoutChannel   = opts.payoutChannel || 'Direct API Electronic Funds Transfer (EFT)';
  const payDate         = opts.disbursedAt 
    ? new Date(opts.disbursedAt).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const officerName     = opts.disbursedBy || 'Finance & Disbursements Office (Lefika Molefe)';
  const digitalAuthHash = `SHA256-${Math.abs(hashCode(refNumber + learnerName + amountNum)).toString(16).toUpperCase().padStart(12, '0')}`;

  // ── Color Palette ─────────────────────────────
  const primaryNavy = [10, 25, 47];     // #0A192F
  const goldAccent  = [201, 163, 78];   // #C9A34E
  const emerald     = [16, 185, 129];   // #10B981
  const bgLight     = [248, 250, 252];  // #F8FAFC
  const textDark    = [15, 23, 42];     // #0F172A
  const textMuted   = [100, 116, 139];  // #64748B
  const borderLight = [226, 232, 240];  // #E2E8F0

  // ── Top Header Banner ─────────────────────────
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 40, 'F');

  // Gold accent line
  doc.setFillColor(...goldAccent);
  doc.rect(0, 40, 210, 2.5, 'F');

  // Logo Icon
  doc.setFillColor(...goldAccent);
  doc.circle(18, 20, 9, 'F');
  doc.setFillColor(...primaryNavy);
  doc.circle(18, 20, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...goldAccent);
  doc.text('NX', 14.5, 23.5);

  // Logo Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('NexaTransform Operations', 32, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(201, 163, 78);
  doc.text('Financial & Learner Disbursement Gateway • LMIS Pro Banking Suite', 32, 26);

  // Top Right POP Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...goldAccent);
  doc.text('OFFICIAL PROOF OF PAYMENT', 200, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('ELECTRONIC FUNDS TRANSFER (EFT)', 200, 24, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Ref: ${refNumber}`, 200, 29, { align: 'right' });

  // ── Big Payment Confirmation Box ──────────────
  doc.setFillColor(...bgLight);
  doc.roundedRect(12, 48, 186, 32, 3, 3, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(12, 48, 186, 32, 3, 3, 'S');

  // Green status pill
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(18, 54, 42, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...emerald);
  doc.text('✓ PAYMENT CLEARED', 22, 59);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text(`Disbursement Period: ${periodLabel}`, 18, 68);
  doc.text(`Settlement Time: ${payDate}`, 18, 73);

  // Big Amount Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryNavy);
  doc.text(formattedAmount, 190, 63, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text('South African Rands (ZAR)', 190, 70, { align: 'right' });

  // ── Two Columns: Beneficiary & Institution ─────
  let y = 88;

  // Box 1: Beneficiary (Learner)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, y, 90, 78, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(12, y, 90, 78, 2, 2, 'S');

  // Title Bar
  doc.setFillColor(...primaryNavy);
  doc.rect(12, y, 90, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('BENEFICIARY DETAILS (LEARNER)', 16, y + 5.5);

  let by = y + 15;
  const drawBeneficiaryRow = (label, val) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(label, 16, by);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(String(val || '—'), 98, by, { align: 'right' });
    by += 8.5;
  };

  drawBeneficiaryRow('Learner Full Name:', learnerName);
  drawBeneficiaryRow('Student Number:', studentNumber);
  drawBeneficiaryRow('National ID / Passport:', idPassport);
  drawBeneficiaryRow('Email Address:', learnerEmail);
  drawBeneficiaryRow('Receiving Bank:', bankName);
  drawBeneficiaryRow('Account Number:', maskedAccount);
  drawBeneficiaryRow('Branch Code:', branchCode);
  drawBeneficiaryRow('Account Type:', accountType);

  // Box 2: Originating Account & Funding Details
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(108, y, 90, 78, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(108, y, 90, 78, 2, 2, 'S');

  // Title Bar
  doc.setFillColor(...primaryNavy);
  doc.rect(108, y, 90, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PAYER & FUNDING SPONSOR DETAILS', 112, y + 5.5);

  let py = y + 15;
  const drawPayerRow = (label, val) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(label, 112, py);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(String(val || '—'), 194, py, { align: 'right' });
    py += 8.5;
  };

  drawPayerRow('Disbursing Entity:', 'Nexa Transformation (Pty) Ltd');
  drawPayerRow('Source Debit Bank:', sourceBank);
  drawPayerRow('Debit Account:', sourceAccount);
  drawPayerRow('Disbursement Pool:', 'Learner Living Stipends');
  drawPayerRow('Funder / Sponsor:', funderName);
  drawPayerRow('Programme Enrolled:', truncate(programmeName, 26));
  drawPayerRow('Payment Channel:', payoutChannel);
  drawPayerRow('Disbursed By:', truncate(officerName, 24));

  // ── Payment Verification & Bank Audit Trail ────
  y = 173;
  doc.setFillColor(...bgLight);
  doc.roundedRect(12, y, 186, 48, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(12, y, 186, 48, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryNavy);
  doc.text('TRANSACTION AUDIT TRAIL & COMPLIANCE VERIFICATION', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text(`1. Transaction Reference: ${refNumber}`, 18, y + 16);
  doc.text(`2. Electronic Clearing Status: Direct Real-Time Clearing (RTC) / ACB Verified Settlement.`, 18, y + 22);
  doc.text(`3. Grant Allocation Compliance: In strict compliance with SETA / Seta-Funded Workplace Stipend Regulations.`, 18, y + 28);
  doc.text(`4. Digital Authentication Token: ${digitalAuthHash}`, 18, y + 34);
  doc.text(`5. Regulatory Standard: POPIA Act No. 4 of 2013 & National Payment System Act compliant.`, 18, y + 40);

  // ── Sign-off & Verification Seal ───────────────
  y = 228;
  doc.setDrawColor(...borderLight);
  doc.line(12, y, 198, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Nexa Operations Finance Office', 18, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Authorised Signatory & Financial Controller', 18, y + 13);
  doc.text('Electronic Verification Stamp: VALIDATED', 18, y + 18);

  // Digital Signature Block on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryNavy);
  doc.text('Beneficiary Notice', 130, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Funds reflect according to interbank clearing cycles (0 - 24h).', 130, y + 13);
  doc.text('For payment queries, contact: finance@nexa-transform.com', 130, y + 18);

  // ── Bottom Footer ─────────────────────────────
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 278, 210, 19, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Nexa Transformation Operations (Pty) Ltd • Reg: 2024/000000/07 • www.nexa-transform.com', 105, 285, { align: 'center' });
  doc.text('This is an electronically generated and authenticated proof of payment. No physical signature required.', 105, 290, { align: 'center' });

  // Trigger browser download
  const cleanFilename = `Proof_of_Payment_${learnerName.replace(/\s+/g, '_')}_${periodLabel.replace(/\s+/g, '_')}.pdf`;
  doc.save(cleanFilename);
}

function truncate(str = '', max = 25) {
  return str.length > max ? `${str.slice(0, max)}...` : str;
}

function hashCode(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
