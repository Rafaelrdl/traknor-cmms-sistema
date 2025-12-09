/**
 * React Query hooks para Checklists
 */

import { useQuery } from '@tanstack/react-query';
import { listChecklists } from '@/data/checklistsStore';

export function useChecklists(filters?: any) {
  return useQuery({
    queryKey: ['checklists', filters],
    queryFn: () => Promise.resolve(listChecklists()),
  });
}
