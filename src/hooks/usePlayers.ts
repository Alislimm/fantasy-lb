import { useQuery } from "@tanstack/react-query";
import { getPlayers, PlayersQuery, Player, getTeamPlayers } from "src/services/api";

export function usePlayers(params: PlayersQuery = {}) {
  return useQuery<Player[], Error>({
    queryKey: ["players", params],
    queryFn: () => {
      if (params.teamId) return getTeamPlayers(params.teamId);
      return getPlayers(params);
    },
  });
}