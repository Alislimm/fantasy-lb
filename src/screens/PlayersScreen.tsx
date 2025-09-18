import React, { useMemo, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, ActivityIndicator, List, SegmentedButtons, Button, Menu, Divider } from "react-native-paper";
import { usePlayers } from "src/hooks/usePlayers";
import type { Player } from "src/services/api";
import { useTeams } from "src/hooks/useTeams";

type SortMode = "price" | "team";

export default function PlayersScreen() {
  const [sortMode, setSortMode] = useState<SortMode>("price");
  const [priceAsc, setPriceAsc] = useState<boolean>(true);
  const [teamMenuVisible, setTeamMenuVisible] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);

  const { data: teams } = useTeams();
  const { data, isLoading, isError, error, refetch, isFetching } = usePlayers(
    selectedTeamId ? { teamId: selectedTeamId } : {}
  );

  const sorted: Player[] = useMemo(() => {
    const list = (data ?? []) as Player[];
    if (sortMode === "price") {
      return [...list].sort((a, b) => (priceAsc ? a.price - b.price : b.price - a.price));
    }
    // sort by team name for visual grouping when in team mode
    return [...list].sort((a, b) => {
      const teamA = a.teamName || '';
      const teamB = b.teamName || '';
      return teamA.localeCompare(teamB);
    });
  }, [data, sortMode, priceAsc]);

  if (isLoading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}> 
        <Text>{error?.message || "Failed to load players"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <SegmentedButtons
          value={sortMode}
          onValueChange={(v) => {
            setSortMode(v as SortMode);
            // Clear team selection when switching to price mode
            if (v === "price") {
              setSelectedTeamId(undefined);
            }
          }}
          buttons={[
            { value: "price", label: "By Price" },
            { value: "team", label: "By Team" },
          ]}
          style={styles.segment}
        />

        {sortMode === "price" ? (
          <Button mode="contained-tonal" onPress={() => setPriceAsc((p) => !p)} style={styles.inlineButton}>
            {priceAsc ? "Price ↑" : "Price ↓"}
          </Button>
        ) : (
          <Menu
            visible={teamMenuVisible}
            onDismiss={() => setTeamMenuVisible(false)}
            anchor={<Button mode="contained" onPress={() => setTeamMenuVisible(true)}>{
              selectedTeamId ? (teams?.find((t) => t.id === selectedTeamId)?.name ?? "Select Team") : "Select Team"
            }</Button>}
          >
            <Menu.Item onPress={() => { setSelectedTeamId(undefined); setTeamMenuVisible(false); }} title="All Teams" />
            <Divider />
            {(teams ?? []).map((team) => (
              <Menu.Item key={team.id} onPress={() => { setSelectedTeamId(team.id); setTeamMenuVisible(false); }} title={team.name} />
            ))}
          </Menu>
        )}

        <Button mode="text" onPress={() => refetch()} loading={isFetching} style={styles.inlineButton}>Refresh</Button>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.firstName} ${item.lastName}`}
            description={`${item.teamName} • ${item.position}`}
            style={styles.card}
            right={() => (
              <Text style={styles.price}>${item.price.toLocaleString()}</Text>
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  controls: { 
    paddingHorizontal: 8, 
    paddingTop: 8, 
    paddingBottom: 2, 
    gap: 4, 
    backgroundColor: "rgba(255, 255, 255, 0.9)", 
    marginTop: 20,
    borderRadius: 12,
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  segment: { marginBottom: 0 },
  inlineButton: { alignSelf: "flex-start", marginVertical: 2 },
  list: { paddingVertical: 2, paddingBottom: 8 },
  card: { backgroundColor: "white", marginHorizontal: 8, marginVertical: 4, borderRadius: 12, elevation: 1 },
  price: { alignSelf: "center", fontWeight: "700" },
});


