import { useQuery } from "@tanstack/react-query";
import { getTeams, Team } from "src/services/api";

export function useTeams() {
  return useQuery<Team[], Error>({
    queryKey: ["teams"],
    queryFn: () => getTeams(),
    staleTime: 5 * 60 * 1000,
  });
}


