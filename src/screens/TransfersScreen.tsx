import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, Modal, Alert } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useUserTeam } from "src/hooks/useUserTeam";
import { useUserFantasyTeam } from "src/hooks/useUserFantasyTeam";
import { useAuth } from "src/hooks/useAuth";
import { usePlayers } from "src/hooks/usePlayers";
import type { FantasyTeamPlayer, Player } from "src/services/api";

const { width, height } = Dimensions.get("window");

// Helper function to get team colors
const getTeamColor = (teamName: string) => {
  const colors: { [key: string]: string } = {
    'RIY': '#1D428A',
    'SAG': '#C8102E',
    'HOM': '#FFD700',
    'BYB': '#228B22',
    'TRI': '#8B0000',
    'ANS': '#FF6347',
    'CHR': '#4169E1',
    'MAN': '#FF1493',
    'BEI': '#32CD32',
    'ZAH': '#FF4500',
    'HAD': '#9370DB',
    'DAM': '#20B2AA',
  };
  return colors[teamName] || '#666666';
};

// Helper function to get position colors
const getPositionColor = (position: string) => {
  const colors: { [key: string]: string } = {
    'PG': '#FF6B6B',
    'SG': '#4ECDC4',
    'SF': '#45B7D1',
    'PF': '#96CEB4',
    'C': '#FFEAA7',
  };
  return colors[position] || '#95A5A6';
};

// Player Card Component
const PlayerCard = ({ player, isCaptain, isViceCaptain, isOnBench, onPress }: FantasyTeamPlayer & { onPress?: () => void }) => {
  const teamColor = getTeamColor(player.team.name);
  const positionColor = getPositionColor(player.position);
  
  return (
    <TouchableOpacity 
      style={[styles.playerCard, { borderLeftColor: teamColor }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.playerHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.firstName} {player.lastName}</Text>
          <View style={styles.playerDetails}>
            <Text style={[styles.position, { backgroundColor: positionColor }]}>
              {player.position}
            </Text>
            <Text style={styles.teamName}>{player.team.name}</Text>
            <Text style={styles.price}>${player.marketValue}M</Text>
          </View>
        </View>
        <View style={styles.captainBadges}>
          {isCaptain && (
            <View style={[styles.captainBadge, { backgroundColor: '#FFD700' }]}>
              <Text style={styles.captainText}>C</Text>
            </View>
          )}
          {isViceCaptain && (
            <View style={[styles.captainBadge, { backgroundColor: '#C0C0C0' }]}>
              <Text style={styles.captainText}>VC</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.playerStats}>
        <Text style={styles.ownershipText}>
          Ownership: {player.ownershipPct}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Player Selection Modal Component
const PlayerSelectionModal = ({ 
  visible, 
  onClose, 
  position, 
  onSelectPlayer, 
  players, 
  selectedPlayer 
}: {
  visible: boolean;
  onClose: () => void;
  position: string;
  onSelectPlayer: (player: Player) => void;
  players: Player[];
  selectedPlayer?: Player;
}) => {
  const filteredPlayers = players.filter(player => player.position === position);
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.playerSelectionModal}>
          <Text style={styles.modalTitle}>Select {position}</Text>
          
          <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
            {filteredPlayers.map((player) => {
              const isSelected = selectedPlayer?.id === player.id;
              const teamColor = getTeamColor(player.team.name);
              const positionColor = getPositionColor(player.position);
              
              return (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerItem,
                    isSelected && styles.selectedPlayerItem
                  ]}
                  onPress={() => {
                    onSelectPlayer(player);
                    onClose();
                  }}
                >
                  <View style={styles.playerItemHeader}>
                    <Text style={styles.playerItemName}>{player.firstName} {player.lastName}</Text>
                    <Text style={[styles.playerItemPosition, { backgroundColor: positionColor }]}>
                      {player.position}
                    </Text>
                  </View>
                  <View style={styles.playerItemDetails}>
                    <Text style={[styles.playerItemTeam, { color: teamColor }]}>{player.team.name}</Text>
                    <Text style={styles.playerItemPrice}>${player.marketValue}M</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function TransfersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: userTeam, isLoading: userTeamLoading, error: userTeamError } = useUserTeam();
  const { data: fantasyTeam, isLoading: fantasyTeamLoading, error: fantasyTeamError } = useUserFantasyTeam();
  const { data: players = [] } = usePlayers();
  
  const isLoading = userTeamLoading || fantasyTeamLoading;
  const error = userTeamError || fantasyTeamError;
  const teamData = fantasyTeam || userTeam;
  
  // Transfer state
  const [selectedPlayer, setSelectedPlayer] = useState<FantasyTeamPlayer | null>(null);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('');

  // Transfer handlers
  const handlePlayerPress = (squadPlayer: FantasyTeamPlayer) => {
    setSelectedPlayer(squadPlayer);
    setSelectedPosition(squadPlayer.player.position);
    setSelectionModalVisible(true);
  };

  const handleSelectPlayer = (newPlayer: Player) => {
    if (selectedPlayer) {
      // Show confirmation dialog
      Alert.alert(
        'Transfer Player',
        `Are you sure you want to replace ${selectedPlayer.player.firstName} ${selectedPlayer.player.lastName} with ${newPlayer.firstName} ${newPlayer.lastName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: () => {
              // Here you would normally call the transfer API
              console.log('Transfer:', {
                from: selectedPlayer.player,
                to: newPlayer,
                position: selectedPosition
              });
              setSelectedPlayer(null);
            }
          }
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#FFB366', '#FFD9B3', '#FFA500']}
        locations={[0, 0.5, 1]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading your team...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error || !teamData) {
    return (
      <LinearGradient
        colors={['#FFB366', '#FFD9B3', '#FFA500']}
        locations={[0, 0.5, 1]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No team found</Text>
          <Text style={styles.errorSubtext}>Please create a team first</Text>
        </View>
      </LinearGradient>
    );
  }

  const startingPlayers = teamData.squad.filter(player => !player.isOnBench);
  const benchPlayers = teamData.squad.filter(player => player.isOnBench);

  return (
    <LinearGradient
      colors={['#CE1126', '#FFFFFF', '#00A651']}
      locations={[0, 0.5, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Team</Text>
            <Text style={styles.teamName}>{teamData.teamName}</Text>
            <View style={styles.teamStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{teamData.totalPoints}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{teamData.budget}</Text>
                <Text style={styles.statLabel}>Budget</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{teamData.transfersRemaining}</Text>
                <Text style={styles.statLabel}>Transfers</Text>
              </View>
            </View>
          </View>

        {/* Starting Lineup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Starting Lineup</Text>
          <View style={styles.playersGrid}>
            {startingPlayers.map((player, index) => (
              <PlayerCard 
                key={`starter-${index}`} 
                {...player} 
                onPress={() => handlePlayerPress(player)}
              />
            ))}
          </View>
        </View>

        {/* Bench */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bench</Text>
          <View style={styles.playersGrid}>
            {benchPlayers.map((player, index) => (
              <PlayerCard 
                key={`bench-${index}`} 
                {...player} 
                onPress={() => handlePlayerPress(player)}
              />
            ))}
          </View>
        </View>

        {/* Transfer Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Transfer Actions</Text>
          <Text style={styles.infoText}>
            You can make transfers to improve your team. Each transfer costs 1 transfer point.
          </Text>
          <View style={styles.transferButtons}>
            <TouchableOpacity style={styles.transferButton}>
              <Text style={styles.transferButtonText}>Add Player</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.transferButton}>
              <Text style={styles.transferButtonText}>Remove Player</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        visible={selectionModalVisible}
        onClose={() => {
          setSelectionModalVisible(false);
          setSelectedPlayer(null);
        }}
        position={selectedPosition}
        onSelectPlayer={handleSelectPlayer}
        players={players}
        selectedPlayer={selectedPlayer?.player}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  teamName: {
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 5,
    textAlign: 'center',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  playersGrid: {
    gap: 10,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  position: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  captainBadges: {
    flexDirection: 'row',
    gap: 5,
  },
  captainBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captainText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerStats: {
    marginTop: 10,
  },
  ownershipText: {
    fontSize: 12,
    color: '#666',
  },
  actionsSection: {
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  transferButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  transferButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerSelectionModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  playersList: {
    maxHeight: 400,
  },
  playerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedPlayerItem: {
    backgroundColor: '#e3f2fd',
  },
  playerItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  playerItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playerItemPosition: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerItemTeam: {
    fontSize: 14,
    fontWeight: '500',
  },
  playerItemPrice: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});