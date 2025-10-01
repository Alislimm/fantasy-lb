import { useMutation } from "@tanstack/react-query";
import { createTeam, CreateTeamRequest, FantasyTeam } from "src/services/api";

export function useCreateTeam() {
  return useMutation<FantasyTeam, Error, CreateTeamRequest>({
    mutationFn: createTeam,
    onSuccess: (data) => {
      // console.log("[useCreateTeam] Team created successfully:", data);
    },
    onError: (error) => {
      // console.error("[useCreateTeam] Failed to create team:", error);
    },
  });
}
