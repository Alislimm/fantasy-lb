import { useMutation } from "@tanstack/react-query";
import { createLineup, CreateLineupRequest, Lineup } from "src/services/api";

export function useCreateLineup() {
  return useMutation<Lineup, Error, CreateLineupRequest>({
    mutationFn: createLineup,
    onSuccess: (data) => {
      // console.log("[useCreateLineup] Lineup created successfully:", data);
    },
    onError: (error) => {
      // console.error("[useCreateLineup] Failed to create lineup:", error);
    },
  });
}
