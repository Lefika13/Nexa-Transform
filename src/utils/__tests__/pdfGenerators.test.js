import { describe, it, expect } from 'vitest';
import { generateProofOfRegistrationPDF } from '../registrationPdf';
import { generatePoePDF } from '../poePdf';
import { generateAcademicTranscriptPDF } from '../transcriptPdf';
import { generateCompletionCertificatePDF } from '../completionCertificatePdf';

describe('LMIS Official PDF Document Engines', () => {
  it('generates an official Proof of Registration PDF without errors', () => {
    const doc = generateProofOfRegistrationPDF({
      name: 'Lefika Molefe',
      email: 'lfk6613@gmail.com',
      number: 'NX2026733',
      role: 'Learner',
      idPassport: '9802034678890',
      phone: '+279825030483',
      qualification: 'Applied Digital Skills and Enterprise Web Management',
      regDate: '2026-09-01'
    });

    expect(doc).toBeDefined();
    expect(typeof doc.output).toBe('function');
    const pdfDataUri = doc.output('datauristring');
    expect(pdfDataUri).toContain('data:application/pdf');
  });

  it('generates a full institutional PoE (Portfolio of Evidence) PDF without errors', async () => {
    const student = {
      learner_name: 'Lefika Molefe',
      learner_email: 'lfk6613@gmail.com',
      student_number: 'NX2026733',
      id_passport: '9802034678890',
      phone: '+279825030483',
      city: 'Johannesburg',
      province: 'Gauteng',
      programme_enrolled: 'Applied Digital Skills and Enterprise Web Management'
    };

    const course = {
      code: 'WEB101',
      title: 'Applied Digital Skills and Enterprise Web Management',
      lecturer_name: 'Mr. Lefika Molefe'
    };

    const submissions = [
      {
        assignment_id: 'a1',
        title: 'Formative Assessment 1: HTML & CSS Architecture',
        type: 'FORMATIVE',
        marks: 85,
        max_marks: 100,
        status: 'Graded',
        assessor_feedback: 'Outstanding component layout and responsive CSS.'
      },
      {
        assignment_id: 'a2',
        title: 'Summative Assessment: Full Stack Web Deployment',
        type: 'SUMMATIVE',
        marks: 90,
        max_marks: 100,
        status: 'Graded',
        assessor_feedback: 'Demonstrated high competency in deployment pipelines.'
      }
    ];

    const doc = await generatePoePDF({
      student,
      course,
      submissions,
      attendance: [{ date: '2026-09-10', status: 'Present' }],
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    });

    expect(doc).toBeDefined();
    expect(typeof doc.output).toBe('function');
    const pdfDataUri = doc.output('datauristring');
    expect(pdfDataUri).toContain('data:application/pdf');
  });

  it('generates an Academic Transcript PDF without errors', () => {
    const student = {
      learner_name: 'Lefika Molefe',
      learner_email: 'lfk6613@gmail.com',
      student_number: 'NX2026733',
      id_passport: '9802034678890',
      programme_enrolled: 'Applied Digital Skills and Enterprise Web Management'
    };

    const modules = [
      {
        code: 'WEB101',
        title: 'Applied Digital Skills and Enterprise Web Management',
        credits: 20,
        final_mark: 88,
        status: 'Pass'
      }
    ];

    const doc = generateAcademicTranscriptPDF({
      student,
      modules,
      issueDate: '2026-09-26'
    });

    expect(doc).toBeDefined();
    expect(typeof doc.output).toBe('function');
    const pdfDataUri = doc.output('datauristring');
    expect(pdfDataUri).toContain('data:application/pdf');
  });

  it('generates an official Certificate of Completion for self-paying learners without errors', () => {
    const doc = generateCompletionCertificatePDF({
      learnerName: 'Lefika Molefe',
      studentNumber: 'NX-2026-0842',
      idPassport: '9802034678890',
      programmeTitle: 'Applied Enterprise Process Automation & BPMN 2.0',
      grade: '88% (Practical Distinction)',
      isSelfPaying: true
    });

    expect(doc).toBeDefined();
    expect(typeof doc.output).toBe('function');
    const pdfDataUri = doc.output('datauristring');
    expect(pdfDataUri).toContain('data:application/pdf');
  });
});
