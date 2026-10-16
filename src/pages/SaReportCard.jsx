import React from 'react';

/**
 * SaReportCard — Authentic SA CAPS Multi-Term Report Card
 * Matches the real Eastern Cape / Gauteng DBE report card format.
 * Props:
 *   student        — school_students record
 *   allMarks       — full term_marks array (all terms)
 *   allSummaries   — student_term_summaries array (all terms)
 *   school         — { name, address, tel, fax, email, emis }
 *   academicYear   — e.g. "2026"
 */
export const SaReportCard = ({ student, allMarks, allSummaries, school, academicYear }) => {
  const TERMS = [1, 2, 3];

  // Unique subjects ordered consistently
  const subjects = [
    ...new Map(
      allMarks.map(m => [m.subject_code, { code: m.subject_code, name: m.subject_name }])
    ).values()
  ];

  // Helper: get marks for a student/term/subject
  const getMark = (termNum, subjectCode) =>
    allMarks.find(m => m.term_number === termNum && m.subject_code === subjectCode);

  // Helper: get term summary
  const getSummary = (termNum) =>
    allSummaries.find(s => s.term_number === termNum) || null;

  // Helper: compute per-term average from marks for that term
  const getTermAvg = (termNum) => {
    const marks = allMarks.filter(m => m.term_number === termNum);
    if (!marks.length) return '–';
    const avg = marks.reduce((sum, m) => sum + m.final_percentage, 0) / marks.length;
    return avg.toFixed(1);
  };

  // CAPS level text
  const levelText = (lvl) => {
    if (!lvl) return '–';
    const map = { 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2', 1: '1' };
    return map[lvl] || lvl;
  };

  // Term summary convenience
  const t1 = getSummary(1);
  const t2 = getSummary(2);
  const t3 = getSummary(3);

  const schoolInfo = school || {
    name: 'Pinecrest High School',
    address: 'Pinecrest Road, Johannesburg North, 2055',
    tel: '+27 11 555 4321',
    fax: '+27 11 555 4322',
    email: 'principal@pinecrest.edu.za',
    emis: '700400123'
  };

  return (
    <div className="sp-report-card">
      <div className="sp-rc-watermark">OFFICIAL REPORT</div>

      {/* ── HEADER ───────────────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <tbody>
          <tr>
            {/* School info — left */}
            <td style={{ verticalAlign: 'top', width: '60%' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0B132B', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                {schoolInfo.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem', lineHeight: 1.5 }}>
                {schoolInfo.address}<br />
                <strong>Tel:</strong> {schoolInfo.tel} &nbsp;|&nbsp; <strong>Fax:</strong> {schoolInfo.fax}<br />
                <strong>Email:</strong> {schoolInfo.email}
              </div>
            </td>
            {/* School crest / logo — right */}
            <td style={{ verticalAlign: 'top', textAlign: 'right', width: '40%' }}>
              <img src="/logo.svg" alt="School Crest" style={{ height: '64px', width: 'auto', filter: 'invert(1) sepia(1) saturate(3) hue-rotate(180deg)', opacity: 0.85 }} />
              <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.2rem' }}>EMIS NO: {schoolInfo.emis}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Divider */}
      <div style={{ borderTop: '3px double #0B132B', marginBottom: '0.85rem' }} />

      {/* ── LEARNER INFO BLOCK ────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.85rem', fontSize: '0.8rem' }}>
        <tbody>
          <tr>
            <td style={{ width: '55%', verticalAlign: 'top', paddingRight: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Learner', student?.full_name || '—'],
                    ['Admission No.', student?.student_number || '—'],
                    ['Date of Birth', student?.dob || '—'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ color: '#64748B', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', width: '38%', paddingBottom: '0.25rem' }}>{label}</td>
                      <td style={{ fontWeight: 700, color: '#0F172A', paddingBottom: '0.25rem' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
            <td style={{ width: '45%', verticalAlign: 'top' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Grade', `Grade ${student?.grade_level || '—'}`],
                    ['Class', student?.class_name || '—'],
                    ['Academic Year', academicYear || '2026'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ color: '#64748B', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', width: '38%', paddingBottom: '0.25rem' }}>{label}</td>
                      <td style={{ fontWeight: 700, color: '#0F172A', paddingBottom: '0.25rem' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── MULTI-TERM MARKS MATRIX ───────────────────────── */}
      <div className="sp-rc-matrix-wrapper">
        <table className="sp-rc-matrix">
          <thead>
            {/* Row 1 — term group headings */}
            <tr>
              <th className="sp-rc-subj-col" rowSpan={2}>Subject</th>
              <th colSpan={3}>Term 1</th>
              <th colSpan={3}>Term 2</th>
              <th colSpan={3}>Term 3</th>
              <th colSpan={2}>Final for Year</th>
            </tr>
            {/* Row 2 — sub-column headings */}
            <tr>
              {/* Term 1 sub-cols */}
              <th>Final %</th><th>Level</th><th>Days Abs%</th>
              {/* Term 2 sub-cols */}
              <th>Final %</th><th>Level</th><th>Days Abs%</th>
              {/* Term 3 sub-cols */}
              <th>Final %</th><th>Level</th><th>Days Abs%</th>
              {/* Final */}
              <th>Final Mark%</th><th>Level</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj) => {
              const m1 = getMark(1, subj.code);
              const m2 = getMark(2, subj.code);
              const m3 = getMark(3, subj.code);
              // Year final = average of all 3 terms
              const termMarksArr = [m1, m2, m3].filter(Boolean);
              const yearFinal = termMarksArr.length
                ? (termMarksArr.reduce((s, m) => s + m.final_percentage, 0) / termMarksArr.length).toFixed(1)
                : '–';
              const yearLevel = termMarksArr.length
                ? Math.round(termMarksArr.reduce((s, m) => s + m.caps_level, 0) / termMarksArr.length)
                : null;

              const cell = (m) => m
                ? (<>
                    <td className="sp-rc-final-pct">{m.final_percentage}%</td>
                    <td className={`sp-rc-level sp-rc-level-${m.caps_level}`}>{levelText(m.caps_level)}</td>
                    <td>{m.days_absent_pct != null ? `${m.days_absent_pct}%` : '–'}</td>
                  </>)
                : (<><td>–</td><td>–</td><td>–</td></>);

              return (
                <tr key={subj.code}>
                  <td className="sp-rc-subj-name">{subj.name}</td>
                  {cell(m1)}
                  {cell(m2)}
                  {cell(m3)}
                  <td className="sp-rc-final-pct">{yearFinal}{yearFinal !== '–' ? '%' : ''}</td>
                  <td className={yearLevel ? `sp-rc-level sp-rc-level-${yearLevel}` : ''}>{yearLevel || '–'}</td>
                </tr>
              );
            })}

            {/* Learner Total / Average row */}
            <tr className="sp-rc-avg-row">
              <td className="sp-rc-subj-name" style={{ color: '#FFFFFF', fontWeight: 800 }}>Learner Total / Average</td>
              <td>{getTermAvg(1)}%</td><td>–</td><td>{t1 ? `${t1.days_absent}d` : '–'}</td>
              <td>{getTermAvg(2)}%</td><td>–</td><td>{t2 ? `${t2.days_absent}d` : '–'}</td>
              <td>{getTermAvg(3)}%</td><td>–</td><td>{t3 ? `${t3.days_absent}d` : '–'}</td>
              <td colSpan={2}>
                {[t1, t2, t3].filter(Boolean).length
                  ? (([t1, t2, t3].filter(Boolean).reduce((s, t) => s + t.average_percentage, 0) / [t1, t2, t3].filter(Boolean).length).toFixed(1) + '%')
                  : '–'}
              </td>
            </tr>

            {/* Result row */}
            <tr className="sp-rc-result-row">
              <td className="sp-rc-subj-name" style={{ color: '#FFFFFF', fontWeight: 800 }}>Result</td>
              <td colSpan={3}>{t1?.result || '–'}</td>
              <td colSpan={3}>{t2?.result || '–'}</td>
              <td colSpan={3}>{t3?.result || '–'}</td>
              <td colSpan={2}>
                {t3?.result === 'PROMOTED' ? 'PROMOTED' : t1?.result === 'PROMOTED' ? 'PROMOTED' : '–'}
              </td>
            </tr>

            {/* Days Absent row */}
            <tr className="sp-rc-absent-row">
              <td className="sp-rc-subj-name" style={{ color: '#FFFFFF', fontWeight: 800 }}>Days Absent</td>
              <td colSpan={3}>{t1 ? t1.days_absent : '–'}</td>
              <td colSpan={3}>{t2 ? t2.days_absent : '–'}</td>
              <td colSpan={3}>{t3 ? t3.days_absent : '–'}</td>
              <td colSpan={2}>
                {[t1, t2, t3].filter(Boolean).reduce((s, t) => s + (t.days_absent || 0), 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── GENERAL REMARKS ───────────────────────────────── */}
      <div className="sp-rc-general-remarks" style={{ marginTop: '0.75rem' }}>
        <label>General Remarks (Class Educator)</label>
        <p>{(t3 || t2 || t1)?.class_teacher_remark || 'No remarks recorded.'}</p>
      </div>

      {/* ── OFFICIAL STAMP AREA ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
        <div style={{
          border: '2px solid #0284C7',
          borderRadius: '50%',
          width: '90px',
          height: '90px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6rem',
          fontWeight: 800,
          color: '#0284C7',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.3
        }}>
          <div>NexaTransform</div>
          <div style={{ fontSize: '0.55rem', color: '#475569', marginTop: '0.2rem' }}>School LMIS</div>
          <div>OFFICIAL</div>
          <div>STAMP</div>
        </div>
      </div>

      {/* ── SIGNATURES ────────────────────────────────────── */}
      <div className="sp-rc-signatures" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', borderTop: '1px solid #CBD5E1', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
        {[
          { label: 'Class Educator', name: 'L. Molefe' },
          { label: 'Deputy Principal', name: 'N. Sithole' },
          { label: 'Principal', name: 'Dr. J. Khumalo' },
          { label: 'Parent / Guardian', name: '' },
        ].map(({ label, name }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              height: '36px',
              borderBottom: '1px solid #0F172A',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              marginBottom: '0.25rem',
              fontFamily: '"Brush Script MT", cursive',
              fontSize: '1.1rem',
              color: '#0369A1',
            }}>{name}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── CAPS LEVEL KEY ────────────────────────────────── */}
      <div className="sp-rc-caps-key" style={{ marginTop: '0.85rem' }}>
        <strong>Achievement Level Scale (CAPS):</strong>&nbsp;
        Level 1: 0–29% (Not Achieved) &nbsp;|&nbsp;
        Level 2: 30–39% (Elementary) &nbsp;|&nbsp;
        Level 3: 40–49% (Moderate) &nbsp;|&nbsp;
        Level 4: 50–59% (Adequate) &nbsp;|&nbsp;
        Level 5: 60–69% (Substantial) &nbsp;|&nbsp;
        Level 6: 70–79% (Meritorious) &nbsp;|&nbsp;
        Level 7: 80–100% (Outstanding)
      </div>
    </div>
  );
};

export default SaReportCard;
