import React, { useMemo, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, ActivityIndicator, List, SegmentedButtons, Button, Menu, Divider, TextInput, Card } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlayers } from "src/hooks/usePlayers";
import type { Player, Team } from "src/services/api";
import { useTeams } from "src/hooks/useTeams";

type SortMode = "price" | "team";

export default function PlayersScreen() {
  const insets = useSafeAreaInsets();
  const [sortMode, setSortMode] = useState<SortMode>("price");
  const [priceAsc, setPriceAsc] = useState<boolean>(true);
  const [teamMenuVisible, setTeamMenuVisible] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const { data: teams, isLoading: teamsLoading, isError: teamsError, error: teamsErrorDetails, refetch: refetchTeams } = useTeams();
  
  // Build query parameters
  const queryParams = {
    ...(selectedTeamId && { teamId: selectedTeamId }),
    ...(minPrice !== undefined && { minPrice }),
    ...(maxPrice !== undefined && { maxPrice }),
  };
  
  const { data, isLoading, isError, error, refetch, isFetching } = usePlayers(queryParams);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
          <View style={styles.priceControls}>
            <Button mode="contained-tonal" onPress={() => setPriceAsc((p) => !p)} style={styles.inlineButton}>
              {priceAsc ? "Price ↑" : "Price ↓"}
            </Button>
            <View style={styles.priceInputs}>
              <TextInput
                mode="outlined"
                label="Min Price"
                value={minPrice?.toString() || ""}
                onChangeText={(text) => setMinPrice(text ? parseFloat(text) : undefined)}
                keyboardType="numeric"
                style={styles.priceInput}
                dense
              />
              <TextInput
                mode="outlined"
                label="Max Price"
                value={maxPrice?.toString() || ""}
                onChangeText={(text) => setMaxPrice(text ? parseFloat(text) : undefined)}
                keyboardType="numeric"
                style={styles.priceInput}
                dense
              />
            </View>
          </View>
        ) : (
          <Menu
            visible={teamMenuVisible}
            onDismiss={() => setTeamMenuVisible(false)}
            anchor={
              <Button 
                mode="contained" 
                onPress={() => {
                  console.log("Team button pressed, current selectedTeamId:", selectedTeamId);
                  setTeamMenuVisible(true);
                }}
                loading={teamsLoading}
                disabled={teamsLoading || teamsError}
              >
                {teamsLoading 
                  ? "Loading Teams..." 
                  : teamsError 
                    ? "Error Loading Teams" 
                    : selectedTeamId && teams
                      ? (teams.find((t: Team) => t.id === selectedTeamId)?.name ?? "Select Team") 
                      : "Select Team"
                }
              </Button>
            }
          >
            <Menu.Item 
              onPress={() => { 
                console.log("All Teams selected, clearing selectedTeamId");
                setSelectedTeamId(undefined); 
                setTeamMenuVisible(false); 
              }} 
              title="All Teams" 
            />
            <Divider />
            {teamsError ? (
              <>
                <Menu.Item 
                  onPress={() => {}} 
                  title={`Error: ${teamsErrorDetails?.message || 'Failed to load teams'}`} 
                  disabled 
                />
                <Menu.Item 
                  onPress={() => refetchTeams()} 
                  title="Retry Loading Teams" 
                />
              </>
            ) : teamsLoading ? (
              <Menu.Item 
                onPress={() => {}} 
                title="Loading teams..." 
                disabled 
              />
            ) : !teams || (teams as Team[]).length === 0 ? (
              <Menu.Item 
                onPress={() => refetchTeams()} 
                title="No teams found - Retry" 
              />
            ) : (
              (teams as Team[] ?? []).map((team: Team) => (
                <Menu.Item 
                  key={team.id} 
                  onPress={() => { 
                    setSelectedTeamId(team.id); 
                    setTeamMenuVisible(false); 
                  }} 
                  title={team.name} 
                />
              ))
            )}
          </Menu>
        )}

        <View style={styles.actionButtons}>
          <Button 
            mode="text" 
            onPress={() => {
              setSelectedTeamId(undefined);
              setMinPrice(undefined);
              setMaxPrice(undefined);
            }} 
            style={styles.inlineButton}
          >
            Clear Filters
          </Button>
          <Button mode="text" onPress={() => refetch()} loading={isFetching} style={styles.inlineButton}>
            Refresh
          </Button>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
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
    marginTop: 8,
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
  priceControls: { gap: 8 },
  priceInputs: { flexDirection: "row", gap: 8 },
  priceInput: { flex: 1 },
  actionButtons: { flexDirection: "row", gap: 8, marginTop: 4 },
  list: { paddingVertical: 2, paddingBottom: 8 },
  card: { backgroundColor: "white", marginHorizontal: 8, marginVertical: 4, borderRadius: 12, elevation: 1 },
  price: { alignSelf: "center", fontWeight: "700" },
});


