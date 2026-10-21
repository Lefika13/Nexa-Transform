import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Scale, ArrowLeft, Mail, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Refund & Cancellation Policy | Nexa Transform Group';
  }, []);

  return (
    <div className="refund-policy-root bg-gray-50 min-h-screen py-16">
      {/* Top Header */}
      <div className="container mx-auto px-4 max-w-4xl mb-12">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-navy transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-turquoise/10 text-turquoise text-xs font-bold uppercase tracking-wider mb-4 border border-turquoise/20">
            <Scale size={14} />
            <span>Statutory Compliance &amp; Consumer Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-navy tracking-tight mb-4">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            This Policy sets out the terms, statutory consumer rights, and conditions governing cancellations, refunds, and adjustments for professional services, custom software engineering, and enterprise training provided by <strong>Nexa Transform Group (Pty) Ltd</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100">
            <span><strong>Effective Date:</strong> 18 October 2026</span>
            <span>&bull;</span>
            <span><strong>Jurisdiction:</strong> Republic of South Africa</span>
            <span>&bull;</span>
            <span><strong>Governing Legislation:</strong> CPA (Act 68 of 2008) &amp; ECTA (Act 25 of 2002)</span>
          </div>
        </div>
      </div>

      {/* Main Policy Content */}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-12 text-gray-700 leading-relaxed text-sm sm:text-base">

          {/* Section 1: Legislative Framework */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-turquoise flex items-center justify-center font-black text-sm shrink-0">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Legislative &amp; Statutory Framework
              </h2>
            </div>
            <p className="mb-4">
              Nexa Transform Group operates in strict accordance with the laws and statutes of the Republic of South Africa. This Refund &amp; Cancellation Policy is drafted and administered pursuant to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>
                <strong>The Consumer Protection Act, No. 68 of 2008 ("CPA"):</strong> Specifically Section 16 (cooling-off period for direct marketing), Section 17 (consumer’s right to cancel advance reservations, bookings, or orders), and Section 54 (consumer’s right to demand quality service and statutory remedy).
              </li>
              <li>
                <strong>The Electronic Communications and Transactions Act, No. 25 of 2002 ("ECTA"):</strong> Specifically Section 44 (statutory cooling-off period for electronic transactions) and Section 42(2) (statutory exclusions relating to bespoke, customized, or commenced digital services).
              </li>
              <li>
                <strong>The Protection of Personal Information Act, No. 4 of 2013 ("POPIA"):</strong> Safeguarding all financial, banking, and customer identity information during refund processing.
              </li>
            </ul>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs sm:text-sm text-gray-600">
              <strong>Note on Juristic Persons (B2B Engagements):</strong> Under Section 5(2)(b) of the CPA, certain statutory protections do not apply to juristic persons whose asset value or annual turnover equals or exceeds the statutory threshold (currently R2,000,000.00). In such cases, the specific provisions of the signed Master Services Agreement (MSA) or Statement of Work (SOW) prevail.
            </div>
          </section>

          {/* Section 2: Scope of Services */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-turquoise flex items-center justify-center font-black text-sm shrink-0">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Scope &amp; Classification of Services
              </h2>
            </div>
            <p className="mb-3">Our refund policy applies differently across our three core service categories:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-navy text-sm mb-1">A. Strategic Advisory</h3>
                <p className="text-xs text-gray-600">Diagnostic Discovery Sessions, Operational Audits, and Process Engineering Blueprints.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-navy text-sm mb-1">B. Custom Software</h3>
                <p className="text-xs text-gray-600">Bespoke Portal Engineering, LMIS Software, API Integrations, and Custom Workflow Systems.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-navy text-sm mb-1">C. Enterprise Training</h3>
                <p className="text-xs text-gray-600">Practical Operational Masterclasses, Tool Bootcamps, and Hands-on Enablement.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Diagnostic Sessions & Advisory */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-turquoise flex items-center justify-center font-black text-sm shrink-0">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Advisory &amp; Diagnostic Discovery Sessions
              </h2>
            </div>
            <p className="mb-3">
              For scheduled advisory sessions, discovery workshops, and preliminary diagnostic consultations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>
                <strong>Cancellations with More than 48 Hours’ Notice:</strong> Eligible for a 100% refund of fees paid, or an unconditional rescheduling credit valid for 12 months.
              </li>
              <li>
                <strong>Cancellations with Less than 48 Hours’ Notice:</strong> In accordance with Section 17(3)(b) of the CPA, Nexa reserves the right to retain a reasonable cancellation charge of up to 30% of the booking value to cover consultant allocation and diary reservation costs.
              </li>
              <li>
                <strong>Failure to Attend (No-Show):</strong> If a client fails to attend a confirmed advisory session without prior written notice, the session fee is non-refundable. Clients may request one complimentary rescheduling within 14 business days.
              </li>
            </ul>
          </section>

          {/* Section 4: Custom Software & Portal Engagements */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-turquoise flex items-center justify-center font-black text-sm shrink-0">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Custom Software &amp; Portal Development (Milestone Delivery)
              </h2>
            </div>
            <p className="mb-3">
              Custom business software, bespoke operational portals, and system integrations are delivered under a structured <strong>Milestone Acceptance Model</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>
                <strong>Completed &amp; Signed-Off Milestones:</strong> Once a development phase or milestone (e.g., Discovery Architecture, Wireframe Prototype, Alpha System Release) has been reviewed, tested, and signed off in writing by the Client, fees paid for that milestone are <strong>strictly non-refundable</strong>.
              </li>
              <li>
                <strong>Early Termination of Active Engagements:</strong> Either party may terminate a project in accordance with the Statement of Work (SOW). In the event of early termination by the Client:
                <ul className="list-circle pl-6 mt-1 space-y-1">
                  <li>Nexa shall calculate actual engineering and advisory hours completed up to the termination date.</li>
                  <li>Any unearned advance deposits held for future, uncommenced milestones will be <strong>refunded in full within 14 business days</strong>.</li>
                  <li>All developed artifacts, code commits, database schemas, and documentation produced up to the settlement date shall be transferred immediately to the Client.</li>
                </ul>
              </li>
              <li>
                <strong>Statutory ECTA Section 42(2) Exemption:</strong> In terms of Section 42(2)(f) of the ECTA, the statutory 7-day cooling-off right does not apply to transactions where software or bespoke development is made to the consumer’s unique specifications or where performance has commenced with the consumer’s express consent.
              </li>
            </ul>
          </section>

          {/* Section 5: Enterprise Training & Masterclasses */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-turquoise flex items-center justify-center font-black text-sm shrink-0">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Enterprise Training &amp; Operational Masterclasses
              </h2>
            </div>
            <p className="mb-3">
              To guarantee facilitator allocation, custom curriculum prep, and portal access:
            </p>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-gray-200 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 text-navy font-bold">
                    <th className="border border-gray-200 p-3 text-left">Notice Period (Prior to Start)</th>
                    <th className="border border-gray-200 p-3 text-left">Refund Entitlement</th>
                    <th className="border border-gray-200 p-3 text-left">Rescheduling / Credit Option</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 p-3 font-semibold">15 or more calendar days</td>
                    <td className="border border-gray-200 p-3 text-emerald-600 font-bold">100% Refund (less 5% bank admin fee)</td>
                    <td className="border border-gray-200 p-3">100% Credit towards future cohort</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border border-gray-200 p-3 font-semibold">7 to 14 calendar days</td>
                    <td className="border border-gray-200 p-3 text-amber-600 font-bold">50% Refund</td>
                    <td className="border border-gray-200 p-3">100% Transfer to alternate team member</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-3 font-semibold">Fewer than 7 calendar days</td>
                    <td className="border border-gray-200 p-3 text-rose-600 font-bold">No Cash Refund</td>
                    <td className="border border-gray-200 p-3">Substitute attendees permitted at no charge</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Defective Performance & CPA Remedies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-turquoise flex items-center justify-center font-black text-sm shrink-0">
                6
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Statutory Remedy for Substandard Service (CPA Section 54)
              </h2>
            </div>
            <p className="mb-3">
              In accordance with Section 54 of the Consumer Protection Act, consumers are entitled to services delivered with reasonable care, skill, and in compliance with agreed specifications. If Nexa fails to perform a service to the agreed standard:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-600 mb-4">
              <li>The Client must notify Nexa in writing within 14 calendar days of identifying the defect or non-conformity.</li>
              <li>Nexa shall have a reasonable opportunity (not exceeding 14 business days) to <strong>remedy the defect or re-perform the service</strong> at no additional charge.</li>
              <li>If the defect cannot be reasonably remedied, the Client is entitled to a <strong>fair and reasonable refund</strong> proportional to the affected portion of the service.</li>
            </ol>
          </section>

          {/* Section 7: Refund Procedure */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-turquoise flex items-center justify-center font-black text-sm shrink-0">
                7
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Refund Application &amp; Processing Procedure
              </h2>
            </div>
            <p className="mb-3">To request a cancellation or refund:</p>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-3 mb-4 text-xs sm:text-sm">
              <p><strong>Step 1:</strong> Submit a formal written request via email to <a href="mailto:enquiries@nexa-transform.com" className="text-turquoise font-semibold underline">enquiries@nexa-transform.com</a> with the subject line: <code>[Refund Request] - [Organisation / Invoice Number]</code>.</p>
              <p><strong>Step 2:</strong> Include: (a) Invoice / Order number, (b) Date of engagement, (c) Detailed reason for request, and (d) Verified South African banking details (with stamped bank confirmation letter for company accounts).</p>
              <p><strong>Step 3:</strong> Review &amp; Assessment: Nexa’s finance and legal directorate will assess the application and issue a written determination within <strong>7 business days</strong>.</p>
              <p><strong>Step 4:</strong> Payout: Approved refunds are processed via Electronic Funds Transfer (EFT) within <strong>7 business days</strong> of approval.</p>
            </div>
          </section>

          {/* Section 8: Dispute Resolution */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-navy text-turquoise flex items-center justify-center font-black text-sm shrink-0">
                8
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy">
                Dispute Resolution &amp; Statutory Recourse
              </h2>
            </div>
            <p className="mb-3">
              If a dispute arises regarding any refund, cancellation, or service delivery:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>
                <strong>Informal Good-Faith Negotiation:</strong> Both parties agree to negotiate in good faith through senior executive representatives for a period of not less than 14 calendar days.
              </li>
              <li>
                <strong>Alternative Dispute Resolution:</strong> If the dispute is not resolved informally, consumers may exercise their statutory rights under the CPA to refer the matter to the <strong>Consumer Goods and Services Ombud (CGSO)</strong>, the <strong>National Consumer Commission (NCC)</strong>, or a competent tribunal.
              </li>
              <li>
                <strong>Arbitration:</strong> B2B commercial disputes not subject to the CPA shall be referred to expedited commercial arbitration administered by the <strong>Arbitration Foundation of Southern Africa (AFSA)</strong> in Johannesburg, South Africa.
              </li>
            </ul>
          </section>

          {/* Section 9: Contact Details */}
          <section className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-navy text-lg mb-3">Enquiries &amp; Legal Notices</h3>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
              <p><strong>Nexa Transform Group (Pty) Ltd</strong></p>
              <p>Attn: Legal, Compliance &amp; Finance Directorate</p>
              <p>Email: <a href="mailto:enquiries@nexa-transform.com" className="text-turquoise underline font-medium">enquiries@nexa-transform.com</a></p>
              <p>Website: <a href="https://nexa-transform.com" className="text-navy underline font-medium">https://nexa-transform.com</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
