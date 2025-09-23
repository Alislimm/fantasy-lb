import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Modal, Alert } from "react-native";
import { Text, Card, Button, IconButton, ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useUserTeam } from "../hooks/useUserTeam";
import { usePlayers } from "../hooks/usePlayers";
import { useTeams } from "../hooks/useTeams";
import type { Player, Team } from "../services/api";

const { width, height } = Dimensions.get("window");

// Helper function to get team jersey URL by teamId (more reliable)
const getTeamJerseyById = (teamId: number, teams: Team[] | undefined, playerName?: string) => {
  if (!teams || !teamId) return undefined;
  
  const team = teams.find(t => t.id === teamId);
  console.log(`[MyTeam][getTeamJerseyById] Player: ${playerName || 'Unknown'}, Looking for teamId: ${teamId}, Found:`, team ? { id: team.id, name: team.name, jerseyUrl: team.jerseyUrl } : 'No match');
  
  return team?.jerseyUrl;
};

// Helper function to get team jersey URL by teamName (fallback)
const getTeamJersey = (teamName: string, teams: Team[] | undefined) => {
  if (!teams || !teamName) return undefined;
  
  console.log(`[MyTeam][getTeamJersey] Looking for team: "${teamName}"`);
  console.log(`[MyTeam][getTeamJersey] Available teams:`, teams.map(t => ({ id: t.id, name: t.name, shortName: t.shortName, jerseyUrl: t.jerseyUrl })));
  
  // Try exact match first
  let team = teams.find(t => t.name === teamName);
  
  // Try short name match
  if (!team) {
    team = teams.find(t => t.shortName === teamName);
  }
  
  // Try partial match
  if (!team) {
    team = teams.find(t =>
      t.name && teamName && (
        t.name.toLowerCase().includes(teamName.toLowerCase()) ||
        teamName.toLowerCase().includes(t.name.toLowerCase())
      )
    );
  }
  
  console.log(`[MyTeam][getTeamJersey] Found team:`, team ? { id: team.id, name: team.name, jerseyUrl: team.jerseyUrl } : 'No match');
  
  return team?.jerseyUrl;
};

// Mock player data with diverse team colors
const mockPlayers = {
  starting: [
    { id: 1, name: "Wael Arakji", position: "PG", team: "RIY", price: 11.8, points: 45.2, jersey: "30", color: "#1D428A" },
    { id: 2, name: "Ali Mahmoud", position: "SG", team: "BEI", price: 9.5, points: 38.7, jersey: "1", color: "#E56020" },
    { id: 3, name: "Ali MansoUr", position: "SF", team: "RIY", price: 12.5, points: 52.1, jersey: "23", color: "#552583" },
    { id: 4, name: "Hayk", position: "PF", team: "SAG", price: 13.2, points: 58.9, jersey: "34", color: "#00471B" },
    { id: 5, name: "Yoyo khatib", position: "C", team: "SAG", price: 12.3, points: 49.3, jersey: "15", color: "#0E2240" },
  ],
  bench: [
    { id: 6, name: "Ismael Ahmad", position: "SF", team: "BE", price: 10.8, points: 42.1, jersey: "0", color: "#007A33" },
    { id: 7, name: "Fadi Al Khateeb", position: "PG", team: "RIY", price: 11.0, points: 40.5, jersey: "0", color: "#E03A3E" },
    { id: 8, name: "Luka Dončić", position: "PG", team: "SAG", price: 12.0, points: 47.8, jersey: "77", color: "#00538C" },
  ],
};

// Basketball Court Component - Half Court Design
const BasketballCourt = () => (
  <View style={styles.courtLines}>
    {/* Court outline */}
    <View style={styles.courtOutline} />
    
    {/* Center circle at bottom */}
    <View style={styles.centerCircle} />
    
    {/* Center line (half-court line) */}
    <View style={styles.centerLine} />
    
    {/* Three-point arc */}
    <View style={styles.threePointArc} />
    
    {/* Free throw circle */}
    <View style={styles.freeThrowCircle} />
    
    {/* The key/paint area */}
    <View style={styles.keyArea} />
    
    {/* Free throw line */}
    <View style={styles.freeThrowLine} />
    
    {/* Basket and backboard */}
    <View style={styles.backboard} />
    <View style={styles.basket} />
    <View style={styles.rim} />
  </View>
);

// Basketball Jersey Component - Simplified Design
const BasketballJersey = ({ player, isStarting, isCaptain, isViceCaptain, onPlayerPress, teams }: any) => {
  console.log(`[BasketballJersey] Player: ${player.firstName} ${player.lastName}, teamId: ${player.teamId}, teamName: "${player.teamName}"`);
  const jerseyUrl = getTeamJerseyById(player.teamId, teams, `${player.firstName} ${player.lastName}`) || getTeamJersey(player.teamName, teams);
  
  return (
    <TouchableOpacity 
      style={[styles.playerContainer, { width: isStarting ? 85 : 70 }]}
      onPress={() => onPlayerPress(player)}
      activeOpacity={0.8}
    >
      {/* Captain/Vice-Captain Badge */}
      {(isCaptain || isViceCaptain) && (
        <View style={styles.captainBadge}>
          <Text style={styles.captainText}>{isCaptain ? "C" : "V"}</Text>
        </View>
      )}
      
      {/* Real Team Jersey or Fallback */}
      {jerseyUrl ? (
        <View style={styles.jerseyContainer}>
          <Image 
            source={{ uri: jerseyUrl }} 
            style={styles.teamJersey}
            resizeMode="contain"
            onError={() => console.log(`[MyTeam] Failed to load jersey for ${player.teamName}: ${jerseyUrl}`)}
            onLoad={() => console.log(`[MyTeam] Successfully loaded jersey for ${player.teamName}`)}
          />
          <View style={styles.jerseyOverlay}>
            <Text style={styles.jerseyNumber}>{player.id}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.jerseyShape, { backgroundColor: '#666666' }]}>
          {/* Jersey outline/border */}
          <View style={styles.jerseyOutline} />
          
          {/* V-neck design */}
          <View style={styles.vNeck} />
          
          {/* Side panels */}
          <View style={[styles.sidePanel, styles.leftPanel]} />
          <View style={[styles.sidePanel, styles.rightPanel]} />
          
          {/* Jersey number */}
          <View style={styles.numberContainer}>
            <Text style={styles.jerseyNumber}>{player.id}</Text>
          </View>
          
          {/* Jersey bottom curve */}
          <View style={styles.jerseyBottom} />
        </View>
      )}
      
      {/* Player Info Below Jersey */}
      <View style={styles.playerInfo}>
        <Text style={styles.playerName} numberOfLines={1}>{player.firstName} {player.lastName}</Text>
        <Text style={styles.playerPrice}>${player.price}M</Text>
        <Text style={styles.playerPoints}>{player.teamName}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Player Details Modal
const PlayerModal = ({ visible, player, isCaptain, isViceCaptain, onClose, onMakeCaptain, onMakeViceCaptain }: any) => {
  if (!player) return null;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Player Jersey */}
          <View style={[styles.modalJersey, { backgroundColor: player.color }]}>
            <View style={styles.jerseyOutline} />
            <View style={styles.vNeck} />
            <View style={[styles.sidePanel, styles.leftPanel]} />
            <View style={[styles.sidePanel, styles.rightPanel]} />
            <View style={styles.numberContainer}>
              <Text style={styles.jerseyNumber}>{player.jersey}</Text>
            </View>
            <View style={styles.jerseyBottom} />
          </View>
          
          {/* Player Details */}
          <View style={styles.modalPlayerInfo}>
            <Text style={styles.modalPlayerName}>{player.name}</Text>
            <Text style={styles.modalPlayerTeam}>{player.team}</Text>
            <View style={styles.modalStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Price</Text>
                <Text style={styles.statValue}>${player.price}M</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Points</Text>
                <Text style={styles.statValue}>{player.points}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Position</Text>
                <Text style={styles.statValue}>{player.position}</Text>
              </View>
            </View>
          </View>
          
          {/* Captain Options */}
          <View style={styles.modalActions}>
            <Button
              mode={isCaptain ? "contained" : "outlined"}
              onPress={() => onMakeCaptain(player.id)}
              style={[styles.modalButton, isCaptain && styles.activeCaptainButton]}
            >
              {isCaptain ? "Captain" : "Make Captain"}
            </Button>
            <Button
              mode={isViceCaptain ? "contained" : "outlined"}
              onPress={() => onMakeViceCaptain(player.id)}
              style={[styles.modalButton, isViceCaptain && styles.activeCaptainButton]}
            >
              {isViceCaptain ? "Vice Captain" : "Make Vice Captain"}
            </Button>
          </View>
          
          {/* Close Button */}
          <Button mode="text" onPress={onClose} style={styles.closeButton}>
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default function MyTeamScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Fetch user team and player data
  const { data: userTeam, isLoading: teamLoading } = useUserTeam();
  const { data: allPlayers } = usePlayers();
  const { data: teams } = useTeams();
  
  // Get player details by ID
  const getPlayerById = (playerId: number): Player | undefined => {
    return allPlayers?.find(player => player.id === playerId);
  };
  
  // Get team details by name
  const getTeamByName = (teamName: string): Team | undefined => {
    return teams?.find(team => team.name === teamName);
  };
  
  // Process user team data
  const processTeamData = () => {
    if (!userTeam?.lineup || !allPlayers) {
      return { starting: [], bench: [], captain: null, viceCaptain: null };
    }
    
    const lineup = userTeam.lineup;
    const startingPlayers = lineup.starters.map(getPlayerById).filter(Boolean) as Player[];
    const benchPlayers = lineup.bench.map(getPlayerById).filter(Boolean) as Player[];
    
    return {
      starting: startingPlayers,
      bench: benchPlayers,
      captain: lineup.captainPlayerId || null,
      viceCaptain: null, // This would need to be added to the API
    };
  };
  
  const teamData = processTeamData();
  
  // Loading state
  if (teamLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D2691E" />
        <Text style={styles.loadingText}>Loading your team...</Text>
      </View>
    );
  }
  
  // No team state
  if (!userTeam) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>No team found</Text>
        <Text style={styles.errorSubtext}>Please create a team first</Text>
      </View>
    );
  }

  const handlePlayerPress = (player: any) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const handleCaptainSelect = (playerId: number) => {
    // For now, just show an alert since we don't have update functionality
    Alert.alert('Captain Selection', 'Captain selection will be available in future updates');
    setModalVisible(false);
  };

  const handleViceCaptainSelect = (playerId: number) => {
    // For now, just show an alert since we don't have update functionality
    Alert.alert('Vice-Captain Selection', 'Vice-captain selection will be available in future updates');
    setModalVisible(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPlayer(null);
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>Points</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Select captain and vice-captain for your starting lineup
          </Text>
        </View>

        {/* Basketball Court */}
        <View style={styles.courtContainer}>
          <LinearGradient
            colors={['#D2691E', '#B8441F', '#8B0000']}
            style={styles.court}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Court Lines */}
            <BasketballCourt />

            {/* Starting 5 Players - Basketball Formation */}
            <View style={styles.formationContainer}>
              {/* Guards (Bottom) */}
              <View style={styles.guardsRow}>
                {teamData.starting[0] && (
                  <BasketballJersey
                    player={teamData.starting[0]} // PG
                    isStarting={true}
                    isCaptain={teamData.captain === teamData.starting[0].id}
                    isViceCaptain={teamData.viceCaptain === teamData.starting[0].id}
                    onPlayerPress={handlePlayerPress}
                    teams={teams}
                  />
                )}
                {teamData.starting[1] && (
                  <BasketballJersey
                    player={teamData.starting[1]} // SG
                    isStarting={true}
                    isCaptain={teamData.captain === teamData.starting[1].id}
                    isViceCaptain={teamData.viceCaptain === teamData.starting[1].id}
                    onPlayerPress={handlePlayerPress}
                    teams={teams}
                  />
                )}
              </View>

              {/* Center (Middle) */}
              <View style={styles.centerRow}>
                {teamData.starting[4] && (
                  <BasketballJersey
                    player={teamData.starting[4]} // C
                    isStarting={true}
                    isCaptain={teamData.captain === teamData.starting[4].id}
                    isViceCaptain={teamData.viceCaptain === teamData.starting[4].id}
                    onPlayerPress={handlePlayerPress}
                    teams={teams}
                  />
                )}
              </View>

              {/* Forwards (Top) */}
              <View style={styles.forwardsRow}>
                {teamData.starting[2] && (
                  <BasketballJersey
                    player={teamData.starting[2]} // SF
                    isStarting={true}
                    isCaptain={teamData.captain === teamData.starting[2].id}
                    isViceCaptain={teamData.viceCaptain === teamData.starting[2].id}
                    onPlayerPress={handlePlayerPress}
                    teams={teams}
                  />
                )}
                {teamData.starting[3] && (
                  <BasketballJersey
                    player={teamData.starting[3]} // PF
                    isStarting={true}
                    isCaptain={teamData.captain === teamData.starting[3].id}
                    isViceCaptain={teamData.viceCaptain === teamData.starting[3].id}
                    onPlayerPress={handlePlayerPress}
                    teams={teams}
                  />
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Bench Players */}
        <View style={styles.benchSection}>
          <Text variant="titleLarge" style={styles.benchTitle}>Bench</Text>
          <View style={styles.benchPlayers}>
            {teamData.bench.map((player) => (
              <BasketballJersey
                key={player.id}
                player={player}
                isStarting={false}
                isCaptain={teamData.captain === player.id}
                isViceCaptain={teamData.viceCaptain === player.id}
                onPlayerPress={handlePlayerPress}
                teams={teams}
              />
            ))}
          </View>
        </View>

        {/* Team Stats */}
        <View style={styles.statsSection}>
          <Text variant="titleLarge" style={styles.statsTitle}>Team Statistics</Text>
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['#2D2D2D', '#1A1A1A']}
              style={styles.statsCard}
            >
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userTeam?.teamName || 'My Team'}
                  </Text>
                  <Text style={styles.statLabel}>Team Name</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    ${[...teamData.starting, ...teamData.bench].reduce((total, player) => total + player.price, 0).toFixed(1)}M
                  </Text>
                  <Text style={styles.statLabel}>Total Value</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {[...teamData.starting, ...teamData.bench].length}/8
                  </Text>
                  <Text style={styles.statLabel}>Players</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
      
      {/* Player Details Modal */}
      <PlayerModal
        visible={modalVisible}
        player={selectedPlayer}
        isCaptain={selectedPlayer && teamData.captain === selectedPlayer.id}
        isViceCaptain={selectedPlayer && teamData.viceCaptain === selectedPlayer.id}
        onClose={closeModal}
        onMakeCaptain={handleCaptainSelect}
        onMakeViceCaptain={handleViceCaptainSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    color: '#D2691E',
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#CCCCCC',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  courtContainer: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  court: {
    height: height * 0.55,
    position: 'relative',
  },
  courtLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  courtOutline: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 4,
    borderColor: 'white',
    borderRadius: 2,
  },
  centerCircle: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    marginLeft: -50,
  },
  centerLine: {
    position: 'absolute',
    bottom: 70,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: 'white',
  },
  threePointArc: {
    position: 'absolute',
    top: 60,
    left: '50%',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: 'white',
    borderBottomWidth: 0,
    marginLeft: -100,
  },
  freeThrowCircle: {
    position: 'absolute',
    top: 130,
    left: '50%',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    marginLeft: -40,
  },
  keyArea: {
    position: 'absolute',
    top: 20,
    left: '50%',
    width: 120,
    height: 150,
    borderWidth: 3,
    borderColor: 'white',
    borderTopWidth: 0,
    marginLeft: -60,
  },
  freeThrowLine: {
    position: 'absolute',
    top: 170,
    left: '50%',
    width: 80,
    height: 3,
    backgroundColor: 'white',
    marginLeft: -40,
  },
  backboard: {
    position: 'absolute',
    top: 15,
    left: '50%',
    width: 40,
    height: 4,
    backgroundColor: 'white',
    marginLeft: -20,
  },
  basket: {
    position: 'absolute',
    top: 25,
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    marginLeft: -6,
  },
  rim: {
    position: 'absolute',
    top: 19,
    left: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF4500',
    marginLeft: -10,
  },
  formationContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  guardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  centerRow: {
    alignItems: 'center',
  },
  forwardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerContainer: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  jerseyShape: {
    width: 60,
    height: 75,
    position: 'relative',
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  jerseyOutline: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
  },
  vNeck: {
    position: 'absolute',
    top: 2,
    left: '40%',
    right: '40%',
    height: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  sidePanel: {
    position: 'absolute',
    top: 15,
    width: 8,
    height: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  leftPanel: {
    left: 2,
  },
  rightPanel: {
    right: 2,
  },
  numberContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jerseyBottom: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  jerseyNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  captainBadge: {
    position: 'absolute',
    top: -10,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 15,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#FFA500',
    zIndex: 10,
  },
  captainText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
  playerInfo: {
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(210,105,30,0.2)',
    minWidth: 70,
  },
  playerName: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 3,
    color: '#1A1A1A',
  },
  playerPrice: {
    fontSize: 9,
    color: '#22C55E',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  playerPoints: {
    fontSize: 9,
    color: '#D2691E',
    fontWeight: '700',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    minWidth: 280,
    maxWidth: 320,
  },
  modalJersey: {
    width: 80,
    height: 100,
    position: 'relative',
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 20,
  },
  modalPlayerInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalPlayerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalPlayerTeam: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#D2691E',
    fontWeight: '800',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  activeCaptainButton: {
    backgroundColor: '#D2691E',
  },
  closeButton: {
    marginTop: 8,
  },
  benchSection: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
  },
  benchTitle: {
    color: '#D2691E',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  benchPlayers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statsSection: {
    padding: 20,
    marginTop: 16,
  },
  statsTitle: {
    color: '#D2691E',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    marginHorizontal: 16,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,140,66,0.2)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,140,66,0.3)',
  },
  loadingText: {
    color: '#D2691E',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // Real Jersey Styles
  jerseyContainer: {
    width: 60,
    height: 75,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  teamJersey: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  jerseyOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
