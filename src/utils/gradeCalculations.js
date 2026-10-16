/**
 * Centralized Academic Grading Engine
 * 
 * Standard Institutional Weighting:
 * - Continuous Assessment (CASS / Predicate): 60% of Module Final Mark
 * - Final Summative Examination: 40% of Module Final Mark
 * - Exam Admission (DP Sub-minimum): 40% CASS required to sit for Final Exam
 * - Distinction Threshold: >= 75%
 * - Pass Threshold: >= 50%
 */

export const ACADEMIC_CONSTANTS = {
  CASS_WEIGHT: 0.60,      // 60% to final mark
  EXAM_WEIGHT: 0.40,      // 40% to final mark
  DP_SUBMINIMUM: 40,      // 40% CASS required for Exam Admission
  PASS_THRESHOLD: 50,     // 50% to pass
  DISTINCTION_THRESHOLD: 75 // 75% for distinction
};

export const MONTH_NAMES_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calculates dynamic academic period based on date or month of registration / enrolment.
 * If registered in March, the 12-month annual period is MAR-FEB.
 */
export function getAcademicPeriod({ registrationDate = null, enrollmentDate = null, referenceYear = null } = {}) {
  const dateStr = enrollmentDate || registrationDate;
  let d = null;
  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  }

  const now = new Date();
  const year = d ? d.getFullYear() : (referenceYear || now.getFullYear());
  const startMonthIdx = d ? d.getMonth() : 0; // 0 = JAN
  const endMonthIdx = (startMonthIdx + 11) % 12; // 12-month period ends month before in following year

  const startShort = MONTH_NAMES_SHORT[startMonthIdx];
  const endShort = MONTH_NAMES_SHORT[endMonthIdx];
  const startFull = MONTH_NAMES_FULL[startMonthIdx];
  const endFull = MONTH_NAMES_FULL[endMonthIdx];

  const endYear = startMonthIdx === 0 ? year : year + 1;

  return {
    start_month_index: startMonthIdx,
    start_month_short: startShort,
    end_month_short: endShort,
    start_month_full: startFull,
    end_month_full: endFull,
    start_year: year,
    end_year: endYear,
    period_code: `0: YEAR (${startShort}-${endShort})`,
    period_full: `${startFull} ${year} – ${endFull} ${endYear}`,
    formatted_reg_date: d ? d.toISOString().split('T')[0] : null
  };
}

/**
 * Calculates the CASS, Exam, and Final Composite Mark for a single module.
 */
export function calculateModuleAcademicRecord({
  course = null,
  courseCode,
  learnerEmail,
  submissions = [],
  quizAttempts = [],
  assignments = [],
  quizzes = [],
  courseWeighting = null,
  registrationDate = null,
  enrollmentDate = null
}) {
  const cleanEmail = (learnerEmail || '').toLowerCase().trim();
  const cleanCode = (courseCode || course?.code || '').toUpperCase().trim();

  const cassWeight = courseWeighting?.cass_weight ?? ACADEMIC_CONSTANTS.CASS_WEIGHT;
  const examWeight = courseWeighting?.exam_weight ?? ACADEMIC_CONSTANTS.EXAM_WEIGHT;
  const dpSubminimum = courseWeighting?.dp_subminimum ?? ACADEMIC_CONSTANTS.DP_SUBMINIMUM;

  // 1. Resolve relevant assessments for this module
  const moduleAssignments = (assignments || []).filter(a =>
    (a.course_code || '').toUpperCase().trim() === cleanCode
  );
  const moduleQuizzes = (quizzes || []).filter(q =>
    (q.course_code || '').toUpperCase().trim() === cleanCode
  );

  // 2. Resolve learner submissions for this module
  const learnerSubmissions = (submissions || []).filter(s =>
    (s.course_code || '').toUpperCase().trim() === cleanCode &&
    (s.learner_email || '').toLowerCase().trim() === cleanEmail
  );

  // 3. Resolve completed quiz attempts for this module (best score per quiz)
  const learnerQuizAttempts = (quizAttempts || []).filter(a =>
    (a.course_code || '').toUpperCase().trim() === cleanCode &&
    (a.learner_email || '').toLowerCase().trim() === cleanEmail &&
    (a.status === 'Completed' || a.status === 'completed' || !a.status) &&
    a.score !== null &&
    a.score !== undefined
  );

  // 4. Partition items into Formative (CASS) vs Final Exam
  const isExamItem = (itemTitle = '', isExamFlag = false) => {
    if (isExamFlag) return true;
    const lower = (itemTitle || '').toLowerCase();
    return lower.includes('final exam') || lower.includes('summative exam') || lower.includes('examination');
  };

  const examSubmission = learnerSubmissions.find(s =>
    isExamItem(s.assignment_title, s.is_exam || s.assessment_type === 'FINAL_EXAM') &&
    s.grade !== null && s.grade !== undefined && s.grade !== ''
  );

  const formativeSubmissions = learnerSubmissions.filter(s =>
    !isExamItem(s.assignment_title, s.is_exam || s.assessment_type === 'FINAL_EXAM') &&
    s.grade !== null && s.grade !== undefined && s.grade !== ''
  );

  // Compile formative assessment items
  const formativeItems = [];

  // 1. Deduplicate formative assignments by title, keeping the highest mark
  const deduplicatedAssigns = new Map();
  formativeSubmissions.forEach(sub => {
    // Check if this submission is actually an online quiz submission
    const isQuiz = moduleQuizzes.some(q => q.title?.trim().toLowerCase() === sub.assignment_title?.trim().toLowerCase()) ||
                   (typeof sub.content === 'string' && sub.content.includes('quiz_id'));
    if (isQuiz) return; // handled via quiz attempts / module quizzes below

    const key = (sub.assignment_title || '').trim().toLowerCase();
    const existing = deduplicatedAssigns.get(key);
    if (!existing || Number(sub.grade ?? -1) > Number(existing.grade ?? -1)) {
      deduplicatedAssigns.set(key, sub);
    }
  });

  // Add deduplicated formative assignments
  deduplicatedAssigns.forEach(sub => {
    const parentAssign = moduleAssignments.find(a =>
      a.title?.trim().toLowerCase() === sub.assignment_title?.trim().toLowerCase()
    );
    const configuredWeight = parentAssign?.weight_percentage
      ? Number(parentAssign.weight_percentage)
      : (sub.weight_percentage ? Number(sub.weight_percentage) : null);

    const subTitle = (sub.assignment_title || '').toLowerCase();
    const isWrittenTest = sub.assessment_type === 'WRITTEN_TEST' ||
      sub.assessment_type === 'WR' ||
      parentAssign?.assessment_type === 'WRITTEN_TEST' ||
      subTitle.includes('written test') ||
      subTitle.includes('class test') ||
      subTitle.includes('module test') ||
      subTitle.includes('theory test');

    formativeItems.push({
      id: sub.id,
      title: sub.assignment_title,
      type: isWrittenTest ? 'Written Test' : 'Assignment',
      score: Number(sub.grade),
      weight: configuredWeight,
      submitted_date: sub.submitted_date,
      feedback: sub.feedback
    });
  });

  // 2. Add quizzes (using single highest score achieved across attempts and submissions)
  moduleQuizzes.forEach(quiz => {
    const attempts = learnerQuizAttempts.filter(a => String(a.quiz_id) === String(quiz.id));
    const bestAttemptScore = attempts.length > 0 ? Math.max(...attempts.map(a => Number(a.score || 0))) : null;

    // Check if any submission record exists for this quiz with a grade
    const quizSub = learnerSubmissions.find(s => 
      s.assignment_title?.trim().toLowerCase() === quiz.title?.trim().toLowerCase() ||
      (typeof s.content === 'string' && s.content.includes(String(quiz.id)))
    );
    const subScore = (quizSub && quizSub.grade !== null && quizSub.grade !== undefined && quizSub.grade !== '') 
      ? Number(quizSub.grade) 
      : null;

    const bestScore = (bestAttemptScore !== null && subScore !== null)
      ? Math.max(bestAttemptScore, subScore)
      : (bestAttemptScore ?? subScore);

    if (bestScore !== null) {
      const configuredWeight = quiz.weight_percentage ? Number(quiz.weight_percentage) : null;

      formativeItems.push({
        id: `quiz-${quiz.id}`,
        title: quiz.title,
        type: 'Quiz / Online Test',
        score: bestScore,
        weight: configuredWeight,
        attempts_used: attempts.length || (quizSub ? 1 : 0),
        max_attempts: quiz.max_attempts || 1
      });
    }
  });

  // 5. Calculate CASS / Predicate Mark
  let calculatedCassMark = null;
  if (formativeItems.length > 0) {
    const hasConfiguredWeights = formativeItems.some(i => i.weight !== null && i.weight > 0);

    if (hasConfiguredWeights) {
      // Calculate normalized weights
      const totalConfiguredWeight = formativeItems.reduce((sum, i) => sum + (i.weight || 10), 0);
      let weightedSum = 0;
      formativeItems.forEach(i => {
        const itemWeight = (i.weight || 10) / totalConfiguredWeight;
        i.normalized_weight_pct = Math.round(itemWeight * 100);
        i.cass_contribution = Number((i.score * itemWeight).toFixed(1));
        weightedSum += (i.score * itemWeight);
      });
      calculatedCassMark = Math.min(100, Math.round(weightedSum));
    } else {
      // Simple equal average across completed formative tasks
      const avg = formativeItems.reduce((sum, i) => sum + i.score, 0) / formativeItems.length;
      formativeItems.forEach(i => {
        i.normalized_weight_pct = Math.round(100 / formativeItems.length);
        i.cass_contribution = Number((i.score / formativeItems.length).toFixed(1));
      });
      calculatedCassMark = Math.min(100, Math.round(avg));
    }
  }

  // 6. DP / Exam Admission Evaluation
  const hasCass = calculatedCassMark !== null;
  const isExamAdmitted = hasCass && calculatedCassMark >= dpSubminimum;
  const dpStatus = !hasCass
    ? 'Pending CASS'
    : isExamAdmitted
      ? 'Exam Admission Granted (DP Achieved)'
      : 'Exam Admission Denied (Sub-minimum Not Met)';

  // 7. Exam Mark & Final Composite Calculation (60% CASS + 40% Exam)
  const examScore = examSubmission ? Number(examSubmission.grade) : null;
  let finalCompositeMark = null;
  let academicOutcome = 'In Progress';

  if (calculatedCassMark !== null && examScore !== null) {
    // Both CASS and Exam are completed
    finalCompositeMark = Math.round(
      (calculatedCassMark * cassWeight) + (examScore * examWeight)
    );

    if (finalCompositeMark >= ACADEMIC_CONSTANTS.DISTINCTION_THRESHOLD) {
      academicOutcome = 'Passed with Distinction';
    } else if (finalCompositeMark >= ACADEMIC_CONSTANTS.PASS_THRESHOLD) {
      academicOutcome = 'Passed';
    } else {
      academicOutcome = 'Failed (Did Not Meet Pass Requirement)';
    }
  } else if (calculatedCassMark !== null) {
    // Only CASS completed, exam pending
    academicOutcome = isExamAdmitted ? 'Exam Pending' : 'Sub-minimum Not Met';
  }

  const academicPeriod = getAcademicPeriod({ registrationDate, enrollmentDate });

  return {
    course_code: cleanCode,
    learner_email: cleanEmail,
    academic_period: academicPeriod,
    cass_mark: calculatedCassMark,
    cass_weight_pct: Math.round(cassWeight * 100),
    exam_mark: examScore,
    exam_weight_pct: Math.round(examWeight * 100),
    final_composite_mark: finalCompositeMark,
    dp_subminimum: dpSubminimum,
    is_exam_admitted: isExamAdmitted,
    dp_status: dpStatus,
    academic_outcome: academicOutcome,
    is_distinction: finalCompositeMark !== null && finalCompositeMark >= ACADEMIC_CONSTANTS.DISTINCTION_THRESHOLD,
    is_passed: finalCompositeMark !== null && finalCompositeMark >= ACADEMIC_CONSTANTS.PASS_THRESHOLD,
    formative_items: formativeItems,
    assignment_items: formativeItems.filter(i => i.type === 'Assignment'),
    quiz_items: formativeItems.filter(i => i.type === 'Written Test' || i.type.includes('Quiz')),
    assignment_average: (() => {
      const aItems = formativeItems.filter(i => i.type === 'Assignment');
      return aItems.length > 0 ? Math.round(aItems.reduce((s, i) => s + i.score, 0) / aItems.length) : null;
    })(),
    quiz_average: (() => {
      const qItems = formativeItems.filter(i => i.type === 'Written Test' || i.type.includes('Quiz'));
      return qItems.length > 0 ? Math.round(qItems.reduce((s, i) => s + i.score, 0) / qItems.length) : null;
    })(),
    half_period_mark: calculatedCassMark ?? (formativeItems.length > 0 ? Math.round(formativeItems.reduce((s, i) => s + i.score, 0) / formativeItems.length) : null),
    full_period_mark: finalCompositeMark ?? calculatedCassMark ?? (formativeItems.length > 0 ? Math.round(formativeItems.reduce((s, i) => s + i.score, 0) / formativeItems.length) : null),
    exam_admission_flag: (calculatedCassMark === null || isExamAdmitted) ? 'Y' : 'N',
    exam_item: examSubmission ? {
      title: examSubmission.assignment_title,
      score: examScore,
      weight_pct: Math.round(examWeight * 100),
      submitted_date: examSubmission.submitted_date,
      feedback: examSubmission.feedback
    } : null
  };
}

/**
 * Calculates the overall qualification / programme academic standing across all registered modules for a learner.
 */
export function calculateProgrammeAcademicStanding({
  learnerEmail,
  enrolledCourseCodes = [],
  courses = [],
  submissions = [],
  quizAttempts = [],
  assignments = [],
  quizzes = [],
  registrationDate = null,
  enrollments = []
}) {
  const cleanEmail = (learnerEmail || '').toLowerCase().trim();
  const cleanCodes = (enrolledCourseCodes || []).map(c => (c || '').toUpperCase().trim()).filter(Boolean);

  if (cleanCodes.length === 0) {
    return {
      learner_email: cleanEmail,
      registered_modules_count: 0,
      completed_modules_count: 0,
      programme_aggregate: null,
      qualification_outcome: 'Not Enrolled',
      is_distinction: false,
      module_records: []
    };
  }

  const moduleRecords = cleanCodes.map(code => {
    const courseObj = (courses || []).find(c => (c.code || '').toUpperCase().trim() === code);
    const enr = (enrollments || []).find(e =>
      (e.course_code || '').toUpperCase().trim() === code &&
      (e.learner_email || '').toLowerCase().trim() === cleanEmail
    );
    const modEnrollmentDate = enr?.enrollment_date || enr?.created_at || null;

    const record = calculateModuleAcademicRecord({
      courseCode: code,
      learnerEmail: cleanEmail,
      submissions,
      quizAttempts,
      assignments,
      quizzes,
      registrationDate,
      enrollmentDate: modEnrollmentDate
    });

    return {
      ...record,
      course_title: courseObj?.title || code,
      credits: courseObj?.credits || 12,
      enrollment_date: modEnrollmentDate
    };
  });

  const completedRecords = moduleRecords.filter(m => m.final_composite_mark !== null);
  const cassOnlyRecords = moduleRecords.filter(m => m.final_composite_mark === null && m.cass_mark !== null);

  let programmeAggregate = null;
  let qualificationOutcome = 'In Progress';
  let isDistinction = false;

  if (completedRecords.length === moduleRecords.length && moduleRecords.length > 0) {
    // All modules finalized
    const sum = completedRecords.reduce((acc, m) => acc + m.final_composite_mark, 0);
    programmeAggregate = Math.round(sum / completedRecords.length);

    if (programmeAggregate >= ACADEMIC_CONSTANTS.DISTINCTION_THRESHOLD) {
      qualificationOutcome = 'Passed with Distinction';
      isDistinction = true;
    } else if (programmeAggregate >= ACADEMIC_CONSTANTS.PASS_THRESHOLD) {
      qualificationOutcome = 'Passed';
    } else {
      qualificationOutcome = 'Failed';
    }
  } else if (completedRecords.length > 0 || cassOnlyRecords.length > 0) {
    // Rolling aggregate of active and completed modules
    const allEvaluatedMarks = moduleRecords.map(m => m.final_composite_mark ?? m.cass_mark).filter(m => m !== null);
    if (allEvaluatedMarks.length > 0) {
      const sum = allEvaluatedMarks.reduce((acc, val) => acc + val, 0);
      programmeAggregate = Math.round(sum / allEvaluatedMarks.length);
    }
    qualificationOutcome = `In Progress (${completedRecords.length}/${moduleRecords.length} Finalized)`;
    if (programmeAggregate !== null && programmeAggregate >= ACADEMIC_CONSTANTS.DISTINCTION_THRESHOLD) {
      isDistinction = true;
    }
  }

  return {
    learner_email: cleanEmail,
    registered_modules_count: moduleRecords.length,
    completed_modules_count: completedRecords.length,
    programme_aggregate: programmeAggregate,
    qualification_outcome: qualificationOutcome,
    is_distinction: isDistinction,
    module_records: moduleRecords
  };
}
