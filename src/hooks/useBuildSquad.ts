import { useMutation } from '@tanstack/react-query';
import { buildInitialSquad, InitialSquadBuildRequest } from '../services/api';

export const useBuildSquad = () => {
  return useMutation({
    mutationFn: (request: InitialSquadBuildRequest) => buildInitialSquad(request),
    onSuccess: (data) => {
      // console.log('[useBuildSquad] Squad built successfully:', data);
    },
    onError: (error) => {
      // console.error('[useBuildSquad] Failed to build squad:', error);
    },
  });
};
