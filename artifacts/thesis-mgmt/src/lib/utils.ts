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
    department_head: 'Ръководител катедра',
    admin: 'Администратор'
  };
  return map[role] || role;
};

export const formatStatus = (status?: string) => {
  if (!status) return '';
  const map: Record<string, string> = {
    draft: 'Чернова',
    submitted: 'Подадена',
    pending_supervisor_approval: 'Изчаква одобрение',
    returned_for_revision: 'Върната за корекции',
    approved_by_supervisor: 'Одобрена от ръководител',
    under_review: 'В рецензия',
    reviewed: 'Рецензирана',
    approved_for_defense: 'Допусната до защита',
    scheduled_for_defense: 'Насрочена защита',
    defended: 'Защитена',
    approved: 'Одобрена',
    rejected: 'Отхвърлена',
  };
  return map[status] || status;
};

export const getStatusColor = (status?: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending_supervisor_approval': return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'returned_for_revision': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'approved_by_supervisor': return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'under_review': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'reviewed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved_for_defense': return 'bg-green-100 text-green-800 border-green-200';
    case 'scheduled_for_defense': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'defended': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};
