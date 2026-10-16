import { Cpu, Settings, Users, GraduationCap, BarChart2 } from 'lucide-react';

/**
 * Returns South African format "7 Jul 2026" using en-ZA locale.
 * Returns "—" for null/undefined/empty.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return '—';
  }
};

/**
 * Calculates whole days between today and the target date (zeroed hours).
 * Negative = past date.
 */
export const daysUntil = (dateStr) => {
  if (!dateStr) return 0;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

/**
 * Percentage of Present + Late records vs total.
 * Returns 0 for empty lists.
 */
export const attendanceRate = (records = []) => {
  if (!records || records.length === 0) return 0;
  const presentOrLate = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
  return Math.round((presentOrLate / records.length) * 100);
};

/**
 * Average of graded submission grades (integer).
 * Returns null if no graded submissions exist.
 */
export const avgGrade = (submissions = []) => {
  if (!submissions || submissions.length === 0) return 0;
  const graded = submissions.filter(s => s.grade !== null && s.grade !== undefined);
  if (graded.length === 0) return 0;
  
  // Calculate average percentage of scores
  const sumPercent = graded.reduce((sum, s) => {
    // If the submission doesn't specify total_marks, default to 100
    const total = s.total_marks || 100;
    return sum + ((s.grade / total) * 100);
  }, 0);
  
  return Math.round(sumPercent / graded.length);
};

/**
 * ZAR formatting "R15,500" using en-ZA number format.
 * Returns "R0" for null/NaN.
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'R0';
  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  } catch (e) {
    return `R${amount}`;
  }
};

// Maps course categories to Lucide icons
export const CATEGORY_ICONS = {
  'AI & Digital Solutions': Cpu,
  'Business Process Management': Settings,
  'Organizational Development': Users,
  'Skills Development & Training': GraduationCap,
  'Data & Intelligence Solutions': BarChart2
};

// Maps course categories to text color utility states
export const CATEGORY_COLORS = {
  'AI & Digital Solutions': 'text-gold border-gold',
  'Business Process Management': 'text-electric-blue border-electric-blue',
  'Organizational Development': 'text-emerald border-emerald',
  'Skills Development & Training': 'text-turquoise border-turquoise',
  'Data & Intelligence Solutions': 'text-gold border-gold'
};
