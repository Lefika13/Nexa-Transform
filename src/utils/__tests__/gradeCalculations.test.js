import { describe, it, expect } from 'vitest';
import {
  getAcademicPeriod,
  calculateModuleAcademicRecord,
  calculateProgrammeAcademicStanding,
  ACADEMIC_CONSTANTS
} from '../gradeCalculations';

describe('Academic Period Engine', () => {
  it('calculates MAR-FEB period for a March registration', () => {
    const period = getAcademicPeriod({ registrationDate: '2026-03-15' });
    expect(period.period_code).toBe('0: YEAR (MAR-FEB)');
    expect(period.start_month_short).toBe('MAR');
    expect(period.end_month_short).toBe('FEB');
    expect(period.start_year).toBe(2026);
    expect(period.end_year).toBe(2027);
  });

  it('calculates JUL-JUN period for a July registration', () => {
    const period = getAcademicPeriod({ registrationDate: '2026-07-01' });
    expect(period.period_code).toBe('0: YEAR (JUL-JUN)');
    expect(period.start_month_short).toBe('JUL');
    expect(period.end_month_short).toBe('JUN');
  });

  it('calculates JAN-DEC period for January registration or default', () => {
    const period = getAcademicPeriod({ registrationDate: '2026-01-10' });
    expect(period.period_code).toBe('0: YEAR (JAN-DEC)');
    expect(period.start_year).toBe(2026);
    expect(period.end_year).toBe(2026);
  });

  it('calculates OCT-SEP period for an October registration', () => {
    const period = getAcademicPeriod({ registrationDate: '2026-10-20' });
    expect(period.period_code).toBe('0: YEAR (OCT-SEP)');
    expect(period.start_month_short).toBe('OCT');
    expect(period.end_month_short).toBe('SEP');
  });
});

describe('Highest-Mark Deduplication and Grade Synthesis', () => {
  it('deduplicates multiple quiz attempts to retain the single highest score', () => {
    const learnerEmail = 'learner@nexatransform.com';
    const courseCode = 'BPW-01';

    const quizAttempts = [
      { id: 1, quiz_id: 'q1', quiz_title: 'Process Basics', learner_email: learnerEmail, course_code: courseCode, score: 55, status: 'Completed' },
      { id: 2, quiz_id: 'q1', quiz_title: 'Process Basics', learner_email: learnerEmail, course_code: courseCode, score: 85, status: 'Completed' },
      { id: 3, quiz_id: 'q1', quiz_title: 'Process Basics', learner_email: learnerEmail, course_code: courseCode, score: 68, status: 'Completed' },
    ];

    const record = calculateModuleAcademicRecord({
      course: { code: courseCode, title: 'Process Mapping' },
      courseCode,
      learnerEmail,
      submissions: [],
      quizzes: [{ id: 'q1', title: 'Process Basics', course_code: courseCode }],
      quizAttempts
    });

    // Highest score 85 must be retained, not 55 or 68
    expect(record.quiz_average).toBe(85);
    expect(record.quiz_items).toHaveLength(1);
    expect(record.quiz_items[0].score).toBe(85);
  });

  it('deduplicates multiple assignment submissions to retain the highest mark', () => {
    const learnerEmail = 'learner@nexatransform.com';
    const courseCode = 'BPW-01';

    const submissions = [
      { id: 10, assignment_title: 'Assignment 1', course_code: courseCode, learner_email: learnerEmail, grade: 60 },
      { id: 11, assignment_title: 'Assignment 1', course_code: courseCode, learner_email: learnerEmail, grade: 90 },
      { id: 12, assignment_title: 'Assignment 1', course_code: courseCode, learner_email: learnerEmail, grade: 75 },
    ];

    const record = calculateModuleAcademicRecord({
      course: { code: courseCode, title: 'Process Mapping' },
      courseCode,
      learnerEmail,
      submissions,
      quizzes: [],
      quizAttempts: []
    });

    expect(record.assignment_average).toBe(90);
    expect(record.assignment_items).toHaveLength(1);
    expect(record.assignment_items[0].score).toBe(90);
  });

  it('determines Exam Admission based on DP sub-minimum threshold (40%)', () => {
    const learnerEmail = 'student@test.com';
    const course = { code: 'TEST-101', title: 'Test Course' };

    // At 35% CASS -> Exam Admission: 'N'
    const lowRecord = calculateModuleAcademicRecord({
      course,
      courseCode: 'TEST-101',
      learnerEmail,
      submissions: [{ assignment_title: 'A1', course_code: 'TEST-101', learner_email: learnerEmail, grade: 35 }],
      quizzes: [],
      quizAttempts: []
    });
    expect(lowRecord.cass_mark).toBe(35);
    expect(lowRecord.exam_admission_flag).toBe('N');
    expect(lowRecord.is_exam_admitted).toBe(false);

    // At 45% CASS -> Exam Admission: 'Y'
    const passRecord = calculateModuleAcademicRecord({
      course,
      courseCode: 'TEST-101',
      learnerEmail,
      submissions: [{ assignment_title: 'A1', course_code: 'TEST-101', learner_email: learnerEmail, grade: 45 }],
      quizzes: [],
      quizAttempts: []
    });
    expect(passRecord.cass_mark).toBe(45);
    expect(passRecord.exam_admission_flag).toBe('Y');
    expect(passRecord.is_exam_admitted).toBe(true);
  });

  it('correctly calculates Full Period Mark: 60% CASS + 40% Exam', () => {
    const learnerEmail = 'student@test.com';
    const course = { code: 'TEST-101', title: 'Test Course' };

    // CASS: 80% (60% weight = 48)
    // Exam: 70% (40% weight = 28)
    // Expected Full Period Mark = 48 + 28 = 76% (Pass with Distinction >= 75%)
    const record = calculateModuleAcademicRecord({
      course,
      courseCode: 'TEST-101',
      learnerEmail,
      submissions: [
        { assignment_title: 'Coursework Project', course_code: 'TEST-101', learner_email: learnerEmail, grade: 80 },
        { assignment_title: 'Final Examination', course_code: 'TEST-101', learner_email: learnerEmail, grade: 70 }
      ],
      quizzes: [],
      quizAttempts: []
    });

    expect(record.cass_mark).toBe(80);
    expect(record.exam_mark).toBe(70);
    expect(record.full_period_mark).toBe(76);
    expect(record.is_distinction).toBe(true);
    expect(record.academic_outcome).toBe('Passed with Distinction');
  });
});
