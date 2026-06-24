import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatRole = (role?: string) => {
  if (!role) return '';
  const map: Record<string, string> = {
    student: 'Студент',
    supervisor: 'Научен ръководител',
    reviewer: 'Рецензент',
    committee_member: 'Член на комисия',
    admin: 'Администратор'
  };
  return map[role] || role;
};

export const formatStatus = (status?: string) => {
  if (!status) return '';
  const map: Record<string, string> = {
    draft: 'Чернова',
    submitted: 'Подадена',
    under_review: 'В рецензия',
    approved: 'Одобрена',
    rejected: 'Отхвърлена',
    defended: 'Защитена'
  };
  return map[status] || status;
};

export const getStatusColor = (status?: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'under_review': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'defended': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};
