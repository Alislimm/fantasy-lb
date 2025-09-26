import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform, Image } from "react-native";
import { Text, Button, ActivityIndicator, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { usePlayers } from "src/hooks/usePlayers";
import { useTeams } from "src/hooks/useTeams";
import { useCreateTeam } from "src/hooks/useCreateTeam";
import { useBuildSquad } from "src/hooks/useBuildSquad";
import { useUserTeam } from "src/hooks/useUserTeam";
import { useUserFantasyTeam } from "src/hooks/useUserFantasyTeam";
import { useAuth } from "src/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import type { Player, Team } from "src/services/api";

const { width, height } = Dimensions.get("window");

// Helper function to get team colors
const getTeamColor = (teamName: string) => {
  const colors: { [key: string]: string } = {
    'RIY': '#1D428A',
    'BEI': '#E56020', 
    'SAG': '#552583',
    'BE': '#007A33',
    'Warriors': '#1D428A',
    'Suns': '#E56020',
    'Lakers': '#552583',
    'Bucks': '#00471B',
    'Nuggets': '#0E2240',
    'Celtics': '#007A33',
    'Trail Blazers': '#E03A3E',
    'Mavericks': '#00538C',
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

// Helper function to get team jersey URL by teamId (more reliable)
const getTeamJerseyById = (teamId: number, teams: Team[] | undefined, playerName?: string) => {
  if (!teams || !teamId) return undefined;
  
  const team = teams.find(t => t.id === teamId);
  console.log(`[getTeamJerseyById] Player: ${playerName || 'Unknown'}, Looking for teamId: ${teamId}, Found:`, team ? { id: team.id, name: team.name, jerseyUrl: team.jerseyUrl } : 'No match');
  
  return team?.jerseyUrl;
};

// Helper function to get team jersey URL by teamName (fallback)
const getTeamJersey = (teamName: string, teams: Team[] | undefined) => {
  if (!teams || !teamName) return undefined;
  
  console.log(`[getTeamJersey] Looking for team: "${teamName}"`);
  console.log(`[getTeamJersey] Available teams:`, teams.map(t => ({ id: t.id, name: t.name, shortName: t.shortName, jerseyUrl: t.jerseyUrl })));
  
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
  
  console.log(`[getTeamJersey] Found team:`, team ? { id: team.id, name: team.name, jerseyUrl: team.jerseyUrl } : 'No match');
  
  return team?.jerseyUrl;
};

// Team state management
interface TeamSlot {
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  player?: Player;
}

const initialTeam: TeamSlot[] = [
  { position: 'PG' },
  { position: 'SG' },
  { position: 'SF' },
  { position: 'PF' },
  { position: 'C' },
];

const initialBench: TeamSlot[] = [
  { position: 'PG' },
  { position: 'SG' },
  { position: 'SF' },
];


// Empty Player Slot Component
const EmptyPlayerSlot = ({ position, onPress }: { position: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.playerContainer} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.emptySlot}>
      <Text style={styles.emptySlotText}>+</Text>
    </View>
  </TouchableOpacity>
);

// Filled Player Slot Component
const FilledPlayerSlot = ({ 
  player, 
  onPress, 
  isCaptain = false, 
  isViceCaptain = false,
  teams
}: { 
  player: Player; 
  onPress: () => void;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  teams?: Team[];
}) => {
  const teamName = player.team?.name || (player as any).teamName || 'Unknown Team';
  console.log(`[FilledPlayerSlot] Player: ${player.firstName} ${player.lastName}, teamId: ${player.team?.id}, teamName: "${teamName}"`);
  const jerseyUrl = getTeamJerseyById(player.team?.id, teams, `${player.firstName} ${player.lastName}`) || getTeamJersey(teamName, teams);
  
  return (
    <TouchableOpacity style={styles.playerContainer} onPress={onPress} activeOpacity={0.8}>
      {/* Captain/Vice-Captain Badge */}
      {(isCaptain || isViceCaptain) && (
        <View style={[
          styles.captainBadge,
          isCaptain ? styles.captainBadgeStyle : styles.viceCaptainBadgeStyle
        ]}>
          <Text style={styles.captainBadgeText}>
            {isCaptain ? 'C' : 'VC'}
          </Text>
        </View>
      )}
      
      {/* Real Team Jersey or Fallback */}
      {jerseyUrl ? (
        <View style={styles.jerseyContainer}>
          <Image 
            source={{ uri: jerseyUrl }} 
            style={styles.teamJersey}
            resizeMode="contain"
            onError={() => console.log(`[PickTeam] Failed to load jersey for ${teamName}: ${jerseyUrl}`)}
            onLoad={() => console.log(`[PickTeam] Successfully loaded jersey for ${teamName}`)}
          />
          <View style={styles.jerseyOverlay}>
            <Text style={styles.jerseyNumber}>{player.id}</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.jerseyShape, { backgroundColor: getTeamColor(player.team?.name || 'Unknown Team') }]}>
          <View style={styles.jerseyOutline} />
          <View style={styles.vNeck} />
          <View style={[styles.sidePanel, styles.leftPanel]} />
          <View style={[styles.sidePanel, styles.rightPanel]} />
          <View style={styles.numberContainer}>
            <Text style={styles.jerseyNumber}>{player.id}</Text>
          </View>
          <View style={styles.jerseyBottom} />
        </View>
      )}
      
      {/* Player Info */}
      <View style={styles.playerInfo}>
        <Text style={styles.playerName} numberOfLines={1}>{player.firstName} {player.lastName}</Text>
        <Text style={styles.playerPrice}>${player.marketValue || (player as any).price || 0}M</Text>
      </View>
    </TouchableOpacity>
  );
};

// Player Selection Modal
const PlayerSelectionModal = ({ visible, position, onClose, onPlayerSelect, currentTeamValue, startingTeam, benchTeam }: any) => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);
  const { data: teams, isLoading: teamsLoading } = useTeams({
    enabled: visible, // Only fetch teams when modal is visible
  });
  const { data: players, isLoading: playersLoading } = usePlayers({
    ...(selectedTeamId && { teamId: selectedTeamId }),
  }, {
    enabled: visible, // Only fetch players when modal is visible
  });

  // Get all currently selected player IDs
  const getAllSelectedPlayerIds = () => {
    const allSlots = [...startingTeam, ...benchTeam];
    return allSlots.filter(slot => slot.player).map(slot => slot.player!.id);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.playerSelectionModal}>
          <Text style={styles.modalTitle}>Select {position}</Text>
          
          {/* Team Filter */}
          <View style={styles.teamFilter}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Button
                mode={!selectedTeamId ? "contained" : "outlined"}
                onPress={() => setSelectedTeamId(undefined)}
                style={styles.teamButton}
              >
                All Teams
              </Button>
              {teams?.map((team: Team) => (
                <Button
                  key={team.id}
                  mode={selectedTeamId === team.id ? "contained" : "outlined"}
                  onPress={() => setSelectedTeamId(team.id)}
                  style={styles.teamButton}
                >
                  {team.name}
                </Button>
              ))}
            </ScrollView>
          </View>

          {/* Players List */}
          <ScrollView style={styles.playersList}>
            {playersLoading ? (
              <ActivityIndicator style={styles.loading} />
            ) : (
              players?.map((player: Player) => {
                console.log(`[PlayerSelectionModal] Player: ${player.firstName} ${player.lastName}, marketValue: ${player.marketValue}, price: ${(player as any).price}`);
                console.log(`[PlayerSelectionModal] Player team data:`, player.team);
                console.log(`[PlayerSelectionModal] Player team name:`, player.team?.name);
                const playerPrice = player.marketValue || (player as any).price || 0;
                const wouldExceedBudget = (currentTeamValue + playerPrice) > 100;
                const isAlreadySelected = getAllSelectedPlayerIds().includes(player.id);
                const isDisabled = wouldExceedBudget || isAlreadySelected;
                
                return (
                  <TouchableOpacity
                    key={player.id}
                    style={[
                      styles.playerItem,
                      isDisabled && styles.playerItemOverBudget
                    ]}
                    onPress={() => onPlayerSelect(player)}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.playerItemName,
                      isDisabled && styles.playerItemDisabled
                    ]}>
                      {player.firstName} {player.lastName}
                      {isAlreadySelected && ' ✓'}
                    </Text>
                    <Text style={[
                      styles.playerItemTeam,
                      isDisabled && styles.playerItemDisabled
                    ]}>
                      {player.team?.name || (player as any).teamName || 'Unknown Team'}
                    </Text>
                    <Text style={[
                      styles.playerItemPrice,
                      wouldExceedBudget && styles.playerItemPriceOverBudget
                    ]}>
                      ${playerPrice}M
                      {wouldExceedBudget && ' ⚠️'}
                      {isAlreadySelected && ' (Selected)'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <Button mode="text" onPress={onClose} style={styles.closeButton}>
            Cancel
          </Button>
        </View>
      </View>
    </Modal>
  );
};

// Enhanced Player Modal with complete info and actions
const PlayerModal = ({ 
  visible, 
  player, 
  onClose, 
  onCaptainSelect, 
  onViceCaptainSelect,
  onRemovePlayer,
  currentCaptain,
  currentViceCaptain,
  teams
}: any) => {
  // Don't render if player is null
  if (!player) {
    return null;
  }

  const teamName = player.team?.name || (player as any).teamName || 'Unknown Team';
  console.log(`[PlayerModal] Player: ${player.firstName} ${player.lastName}, teamId: ${player.team?.id || 0}, teamName: "${teamName}"`);
  const jerseyUrl = getTeamJerseyById(player.team?.id || 0, teams, `${player.firstName} ${player.lastName}`) || getTeamJersey(teamName, teams);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.playerModal}>
          {/* Player Header */}
          <View style={styles.playerModalHeader}>
            {jerseyUrl ? (
              <View style={styles.jerseyContainer}>
                <Image 
                  source={{ uri: jerseyUrl }} 
                  style={styles.teamJersey}
                  resizeMode="contain"
                  onError={() => console.log(`[PlayerModal] Failed to load jersey for ${teamName}: ${jerseyUrl}`)}
                  onLoad={() => console.log(`[PlayerModal] Successfully loaded jersey for ${teamName}`)}
                />
                <View style={styles.jerseyOverlay}>
                  <Text style={styles.jerseyNumber}>{player.id}</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.jerseyShape, { backgroundColor: getTeamColor(teamName) }]}>
                <View style={styles.jerseyOutline} />
                <View style={styles.vNeck} />
                <View style={[styles.sidePanel, styles.leftPanel]} />
                <View style={[styles.sidePanel, styles.rightPanel]} />
                <View style={styles.numberContainer}>
                  <Text style={styles.jerseyNumber}>{player.id}</Text>
                </View>
                <View style={styles.jerseyBottom} />
              </View>
            )}
            <View style={styles.playerModalInfo}>
              <Text style={styles.playerModalName}>{player.firstName} {player.lastName}</Text>
              <Text style={styles.playerModalTeam}>{teamName}</Text>
              <Text style={styles.playerModalPrice}>${player.marketValue || (player as any).price || 0}M</Text>
            </View>
          </View>

          {/* Player Stats */}
          <View style={styles.playerStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Position:</Text>
              <Text style={styles.statValue}>{player.position}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Team:</Text>
              <Text style={styles.statValue}>{teamName}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Price:</Text>
              <Text style={styles.statValue}>${player.marketValue || (player as any).price || 0}M</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Ownership:</Text>
              <Text style={styles.statValue}>{player.ownershipPct}%</Text>
            </View>
          </View>

          {/* Current Role */}
          {(currentCaptain === player.id || currentViceCaptain === player.id) && (
            <View style={styles.currentRole}>
              <Text style={styles.roleText}>
                Current Role: {currentCaptain === player.id ? 'Captain' : 'Vice-Captain'}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.playerModalActions}>
            <Button 
              mode="outlined" 
              onPress={onClose}
              style={styles.modalActionButton}
            >
              Cancel
            </Button>
            
            <Button 
              mode="contained" 
              onPress={() => onViceCaptainSelect(player.id)}
              disabled={currentCaptain === player.id}
              style={styles.modalActionButton}
              buttonColor={currentViceCaptain === player.id ? "#22C55E" : "#3B82F6"}
            >
              {currentViceCaptain === player.id ? "Vice-Captain ✓" : "Make Vice-Captain"}
            </Button>
            
            <Button 
              mode="contained" 
              onPress={() => onCaptainSelect(player.id)}
              disabled={currentViceCaptain === player.id}
              style={styles.modalActionButton}
              buttonColor={currentCaptain === player.id ? "#22C55E" : "#EAB308"}
            >
              {currentCaptain === player.id ? "Captain ✓" : "Make Captain"}
            </Button>
            
            <Button 
              mode="contained" 
              onPress={() => onRemovePlayer(player)}
              style={[styles.modalActionButton, styles.removeButton]}
              buttonColor="#E53E3E"
            >
              Remove from Squad
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Remove Player Modal
const RemovePlayerModal = ({ visible, player, onClose, onRemove }: any) => {
  // Don't render if player is null
  if (!player) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.removeModal}>
          <Text style={styles.modalTitle}>Remove Player</Text>
          <Text style={styles.removeText}>
            Remove {player.firstName} {player.lastName} from your team?
          </Text>
          <View style={styles.removeActions}>
            <Button mode="outlined" onPress={onClose}>Cancel</Button>
            <Button mode="contained" onPress={onRemove} buttonColor="#E53E3E">
              Remove
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Player Info Modal Component
const PlayerInfoModal = ({ 
  visible, 
  onClose, 
  player 
}: {
  visible: boolean;
  onClose: () => void;
  player: Player | null;
}) => {
  if (!player) return null;

  const teamColor = getTeamColor(player.team?.name || (player as any).teamName || 'Unknown Team');
  const positionColor = getPositionColor(player.position);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.playerInfoModal}>
          {/* Player Header */}
          <View style={styles.playerInfoHeader}>
            <Text style={styles.playerInfoName}>{player.firstName} {player.lastName}</Text>
            <Text style={[styles.playerInfoPosition, { backgroundColor: positionColor }]}>
              {player.position}
            </Text>
          </View>
          
          {/* Player Details */}
          <View style={styles.playerInfoDetails}>
            <View style={styles.playerInfoRow}>
              <Text style={styles.playerInfoLabel}>Team:</Text>
              <Text style={[styles.playerInfoValue, { color: teamColor }]}>{player.team?.name || (player as any).teamName || 'Unknown Team'}</Text>
            </View>
            <View style={styles.playerInfoRow}>
              <Text style={styles.playerInfoLabel}>Price:</Text>
              <Text style={styles.playerInfoValue}>${player.marketValue || (player as any).price || 0}M</Text>
            </View>
            <View style={styles.playerInfoRow}>
              <Text style={styles.playerInfoLabel}>Ownership:</Text>
              <Text style={styles.playerInfoValue}>{player.ownershipPct}%</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.closeInfoButton} onPress={onClose}>
            <Text style={styles.closeInfoButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function PickTeamScreen() {
  const insets = useSafeAreaInsets();
  const [startingTeam, setStartingTeam] = useState<TeamSlot[]>(initialTeam);
  const [benchTeam, setBenchTeam] = useState<TeamSlot[]>(initialBench);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSelectingForBench, setIsSelectingForBench] = useState(false);
  const [teamName, setTeamName] = useState<string>('');
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<number | null>(null);
  const [captainModalVisible, setCaptainModalVisible] = useState(false);
  const [playerInfoModalVisible, setPlayerInfoModalVisible] = useState(false);
  const [selectedPlayerForInfo, setSelectedPlayerForInfo] = useState<Player | null>(null);
  
  // Auth and user team hooks
  const { user, updateUser } = useAuth();
  const { data: userTeam, isLoading: userTeamLoading } = useUserTeam();
  const { data: fantasyTeam, isLoading: fantasyTeamLoading } = useUserFantasyTeam();
  const queryClient = useQueryClient();
  
  // API hooks
  const createTeamMutation = useCreateTeam();
  const buildSquadMutation = useBuildSquad();
  const { data: teams } = useTeams();

  // Debug logging
  console.log('[PickTeamScreen] fantasyTeam:', fantasyTeam);
  console.log('[PickTeamScreen] fantasyTeam type:', typeof fantasyTeam);
  console.log('[PickTeamScreen] squad length:', fantasyTeam?.squad?.length || 0);
  console.log('[PickTeamScreen] userTeamLoading:', userTeamLoading);
  console.log('[PickTeamScreen] fantasyTeamLoading:', fantasyTeamLoading);
  
  // Determine if user needs to create a team or is modifying their existing team
  const hasTeamData = fantasyTeam && fantasyTeam.squad && fantasyTeam.squad.length > 0;
  const needsToCreateTeam = !hasTeamData;
  const isLoading = userTeamLoading || fantasyTeamLoading;
  
  // If user has a fantasy team (from hasFantasyTeam API), show team display
  const shouldShowTeamDisplay = user?.hasFantasyTeam && hasTeamData;
  
  // Calculate team value for existing team
  const getExistingTeamValue = () => {
    if (!fantasyTeam || !fantasyTeam.squad) return 0;
    return fantasyTeam.squad.reduce((total: number, squadPlayer: any) => total + (squadPlayer.player.marketValue || squadPlayer.player.price || 0), 0);
  };

  // Calculate total team value
  const getAllPlayers = () => {
    const startingPlayers = startingTeam.filter(slot => slot.player).map(slot => slot.player!);
    const benchPlayers = benchTeam.filter(slot => slot.player).map(slot => slot.player!);
    return [...startingPlayers, ...benchPlayers];
  };

  const totalTeamValue = getAllPlayers().reduce((total, player) => total + (player.marketValue || (player as any).price || 0), 0);

  const handleEmptySlotPress = (index: number, position: string, isBench: boolean = false) => {
    setSelectedSlotIndex(index);
    setSelectedPosition(position);
    setIsSelectingForBench(isBench);
    setSelectionModalVisible(true);
  };

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    setCaptainModalVisible(true);
  };

  const handlePlayerInfoPress = (player: Player) => {
    setSelectedPlayerForInfo(player);
    setPlayerInfoModalVisible(true);
  };

  const handleCaptainSelect = (playerId: number) => {
    // Transfer captaincy from current captain to new player
    setCaptainId(playerId);
    setCaptainModalVisible(false);
  };

  const handleViceCaptainSelect = (playerId: number) => {
    // Transfer vice-captaincy from current vice-captain to new player
    setViceCaptainId(playerId);
    setCaptainModalVisible(false);
  };

  const handleRemovePlayerFromModal = (player: Player) => {
    // Find and remove the player from team
    const startingIndex = startingTeam.findIndex(slot => slot.player?.id === player.id);
    const benchIndex = benchTeam.findIndex(slot => slot.player?.id === player.id);
    
    if (startingIndex !== -1) {
      const newTeam = [...startingTeam];
      newTeam[startingIndex] = { position: newTeam[startingIndex].position };
      setStartingTeam(newTeam);
    } else if (benchIndex !== -1) {
      const newBench = [...benchTeam];
      newBench[benchIndex] = { position: newBench[benchIndex].position };
      setBenchTeam(newBench);
    }
    
    // Clear captain/vice-captain if removed player was selected
    if (captainId === player.id) {
      setCaptainId(null);
    }
    if (viceCaptainId === player.id) {
      setViceCaptainId(null);
    }
    
    setCaptainModalVisible(false);
    setSelectedPlayer(null);
  };

  const handleRemovePlayer = () => {
    // Find and remove the player from team
    const startingIndex = startingTeam.findIndex(slot => slot.player?.id === selectedPlayer?.id);
    const benchIndex = benchTeam.findIndex(slot => slot.player?.id === selectedPlayer?.id);
    
    if (startingIndex !== -1) {
      const newTeam = [...startingTeam];
      newTeam[startingIndex] = { position: newTeam[startingIndex].position };
      setStartingTeam(newTeam);
    } else if (benchIndex !== -1) {
      const newBench = [...benchTeam];
      newBench[benchIndex] = { position: newBench[benchIndex].position };
      setBenchTeam(newBench);
    }
    
    // Clear captain/vice-captain if removed player was selected
    if (captainId === selectedPlayer?.id) {
      setCaptainId(null);
    }
    if (viceCaptainId === selectedPlayer?.id) {
      setViceCaptainId(null);
    }
    
    setRemoveModalVisible(false);
    setSelectedPlayer(null);
  };

  const handlePlayerSelect = (player: Player) => {
    const newSlot: TeamSlot = { position: selectedPosition as any, player };
    
    if (isSelectingForBench) {
      const newBench = [...benchTeam];
      newBench[selectedSlotIndex] = newSlot;
      setBenchTeam(newBench);
    } else {
      const newTeam = [...startingTeam];
      newTeam[selectedSlotIndex] = newSlot;
      setStartingTeam(newTeam);
    }
    
    setSelectionModalVisible(false);
  };


  const handleSaveTeam = async () => {
    if (totalTeamValue > 100) {
      Alert.alert('Budget Exceeded', 'Your team value exceeds $100M. Please remove some players.');
      return;
    }
    
     if (getAllPlayers().length < 8) {
       Alert.alert('Incomplete Team', 'Please select all 8 players (5 starting + 3 bench).');
       return;
     }
    
    if (!teamName.trim()) {
      Alert.alert('Team Name Required', 'Please enter a name for your team.');
      return;
    }
    
    if (!captainId) {
      Alert.alert('Captain Required', 'Please select a captain for your team.');
      return;
    }
    
    if (!viceCaptainId) {
      Alert.alert('Vice-Captain Required', 'Please select a vice-captain for your team.');
      return;
    }
    
    try {
      if (!user?.id) {
        Alert.alert('Error', 'User not logged in. Please log in again.');
        return;
      }
      
      const gameWeekId = 1; // Use gameweek ID 1 as requested
      
      // Prepare squad data
      const startingPlayers = startingTeam.filter(slot => slot.player).map(slot => slot.player!.id);
      const benchPlayers = benchTeam.filter(slot => slot.player).map(slot => slot.player!.id);
      
      // Build the initial squad (this creates the team and squad in one call)
      const squadResult = await buildSquadMutation.mutateAsync({
        teamName: teamName.trim(),
        ownerUserId: user.id,
        starters: startingPlayers,
        bench: benchPlayers,
        captainPlayerId: captainId || undefined,
        viceCaptainPlayerId: viceCaptainId || undefined,
      });
      
      Alert.alert(
        'Congratulations!', 
        `Your team "${squadResult.teamName}" has been created successfully!`,
        [
          {
            text: 'OK',
            onPress: async () => {
              // Update user to mark that they now have a fantasy team
              await updateUser({ hasFantasyTeam: true });
              
              // Invalidate and refetch user team data
              await queryClient.invalidateQueries({ queryKey: ['userTeam'] });
              
              // Reset the form
              setStartingTeam(initialTeam);
              setBenchTeam(initialBench);
              setTeamName('');
              setCaptainId(null);
              setViceCaptainId(null);
              
              console.log('[PickTeam] Team created successfully, user updated and queries invalidated');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create team/lineup:', error);
      Alert.alert(
        'Failed to Create Team', 
        'There was an error creating your team. Please try again.'
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D2691E" />
        <Text style={styles.loadingText}>Loading your team...</Text>
      </View>
    );
  }

  // Render existing team view when user has a fantasy team
  if (shouldShowTeamDisplay) {
    // Get squad players and organize them by position
    const squadPlayers = fantasyTeam?.squad || [];
    const teamValue = getExistingTeamValue();
    
    // For now, let's assume first 5 are starters and next 3 are bench
    // In a real app, you'd have position-specific logic
    const startingPlayers = squadPlayers.slice(0, 5);
    const benchPlayers = squadPlayers.slice(5, 8);
    
    console.log('[PickTeamScreen] Squad players:', squadPlayers.length);
    console.log('[PickTeamScreen] Starting players:', startingPlayers.length);
    console.log('[PickTeamScreen] Bench players:', benchPlayers.length);

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
              <Text style={styles.teamName}>{fantasyTeam?.teamName || 'My Fantasy Team'}</Text>
              <View style={styles.teamStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{fantasyTeam?.totalPoints || 0}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${teamValue.toFixed(1)}M</Text>
                  <Text style={styles.statLabel}>Team Value</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{fantasyTeam?.transfersRemaining || 0}</Text>
                  <Text style={styles.statLabel}>Transfers</Text>
                </View>
              </View>
            </View>

          {/* Basketball Court */}
          <View style={styles.courtContainer}>
            <Image 
              source={require('../../assets/images/basketball-court.jpeg')} 
              style={styles.court}
              resizeMode="cover"
            />
            
            {/* Starting 5 Players - Basketball Formation */}
            <View style={styles.formationContainer}>
              {/* Guards (Bottom) */}
              <View style={styles.guardsRow}>
                  {startingPlayers[0] && (
                    <FilledPlayerSlot
                      player={startingPlayers[0].player}
                      onPress={() => handlePlayerInfoPress(startingPlayers[0].player)}
                      isCaptain={false} // You can add captain logic later
                      isViceCaptain={false} // You can add vice-captain logic later
                      teams={teams}
                    />
                  )}
                {startingPlayers[1] && (
                  <FilledPlayerSlot
                    player={startingPlayers[1].player}
                    onPress={() => handlePlayerInfoPress(startingPlayers[1].player)}
                    isCaptain={false}
                    isViceCaptain={false}
                    teams={teams}
                  />
                )}
              </View>
              
              {/* Forwards (Middle) */}
              <View style={styles.forwardsRow}>
                {startingPlayers[2] && (
                  <FilledPlayerSlot
                    player={startingPlayers[2].player}
                    onPress={() => handlePlayerInfoPress(startingPlayers[2].player)}
                    isCaptain={false}
                    isViceCaptain={false}
                    teams={teams}
                  />
                )}
                {startingPlayers[3] && (
                  <FilledPlayerSlot
                    player={startingPlayers[3].player}
                    onPress={() => handlePlayerInfoPress(startingPlayers[3].player)}
                    isCaptain={false}
                    isViceCaptain={false}
                    teams={teams}
                  />
                )}
              </View>
              
              {/* Center (Top) */}
              <View style={styles.centerRow}>
                {startingPlayers[4] && (
                  <FilledPlayerSlot
                    player={startingPlayers[4].player}
                    onPress={() => handlePlayerInfoPress(startingPlayers[4].player)}
                    isCaptain={false}
                    isViceCaptain={false}
                    teams={teams}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Bench */}
          <View style={styles.benchSection}>
            <Text style={styles.benchTitle}>Bench</Text>
            <View style={styles.benchContainer}>
               {benchPlayers.map((squadPlayer: any, index: number) => (
                 <FilledPlayerSlot
                   key={`bench-${index}`}
                   player={squadPlayer.player}
                   onPress={() => handlePlayerInfoPress(squadPlayer.player)}
                   isCaptain={false}
                   isViceCaptain={false}
                   teams={teams}
                 />
               ))}
            </View>
          </View>
        </ScrollView>

        {/* Player Info Modal */}
        <PlayerInfoModal
          visible={playerInfoModalVisible}
          onClose={() => setPlayerInfoModalVisible(false)}
          player={selectedPlayerForInfo}
        />
      </LinearGradient>
    );
  }

  // Fallback for when user has a team but data is not available yet
  if (!needsToCreateTeam && !hasTeamData && !isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D2691E" />
        <Text style={styles.loadingText}>Loading your team data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Basketball Court Background */}
      <Image 
        source={require('../../assets/images/basketball-court.jpeg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={(error) => console.log('Background court image failed to load:', error)}
        onLoad={() => console.log('Background court image loaded successfully')}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            {needsToCreateTeam ? 'Create Team' : 'My Team'}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {needsToCreateTeam 
              ? 'Tap empty slots to add players, tap players to remove them'
              : `Your team: ${userTeam?.teamName}`
            }
          </Text>
        </View>

        {/* Basketball Court */}
        <View style={styles.courtContainer}>
          <Image 
            source={require('../../assets/images/basketball-court.jpeg')} 
            style={styles.court}
            resizeMode="cover"
            onError={(error) => console.log('Basketball court image failed to load:', error)}
            onLoad={() => console.log('Basketball court image loaded successfully')}
          />

            {/* Starting 5 Players - Basketball Formation */}
            <View style={styles.formationContainer}>
              {/* Guards (Bottom) */}
              <View style={styles.guardsRow}>
                {startingTeam[0].player ? (
                  <FilledPlayerSlot
                    player={startingTeam[0].player}
                    onPress={() => handlePlayerPress(startingTeam[0].player!)}
                    isCaptain={captainId === startingTeam[0].player.id}
                    isViceCaptain={viceCaptainId === startingTeam[0].player.id}
                    teams={teams}
                  />
                ) : (
                  <EmptyPlayerSlot
                    position="PG"
                    onPress={() => handleEmptySlotPress(0, 'PG')}
                  />
                )}
                {startingTeam[1].player ? (
                  <FilledPlayerSlot
                    player={startingTeam[1].player}
                    onPress={() => handlePlayerPress(startingTeam[1].player!)}
                    isCaptain={captainId === startingTeam[1].player.id}
                    isViceCaptain={viceCaptainId === startingTeam[1].player.id}
                    teams={teams}
                  />
                ) : (
                  <EmptyPlayerSlot
                    position="SG"
                    onPress={() => handleEmptySlotPress(1, 'SG')}
                  />
                )}
              </View>

              {/* Center (Middle) */}
              <View style={styles.centerRow}>
                {startingTeam[4].player ? (
                  <FilledPlayerSlot
                    player={startingTeam[4].player}
                    onPress={() => handlePlayerPress(startingTeam[4].player!)}
                    isCaptain={captainId === startingTeam[4].player.id}
                    isViceCaptain={viceCaptainId === startingTeam[4].player.id}
                    teams={teams}
                  />
                ) : (
                  <EmptyPlayerSlot
                    position="C"
                    onPress={() => handleEmptySlotPress(4, 'C')}
                  />
                )}
              </View>

              {/* Forwards (Top) */}
              <View style={styles.forwardsRow}>
                {startingTeam[2].player ? (
                  <FilledPlayerSlot
                    player={startingTeam[2].player}
                    onPress={() => handlePlayerPress(startingTeam[2].player!)}
                    isCaptain={captainId === startingTeam[2].player.id}
                    isViceCaptain={viceCaptainId === startingTeam[2].player.id}
                    teams={teams}
                  />
                ) : (
                  <EmptyPlayerSlot
                    position="SF"
                    onPress={() => handleEmptySlotPress(2, 'SF')}
                  />
                )}
                {startingTeam[3].player ? (
                  <FilledPlayerSlot
                    player={startingTeam[3].player}
                    onPress={() => handlePlayerPress(startingTeam[3].player!)}
                    isCaptain={captainId === startingTeam[3].player.id}
                    isViceCaptain={viceCaptainId === startingTeam[3].player.id}
                    teams={teams}
                  />
                ) : (
                  <EmptyPlayerSlot
                    position="PF"
                    onPress={() => handleEmptySlotPress(3, 'PF')}
                  />
                )}
              </View>
            </View>
        </View>

        {/* Bench Players */}
        <View style={styles.benchSection}>
          <Text variant="titleLarge" style={styles.benchTitle}>Bench</Text>
          <View style={styles.benchPlayers}>
            {benchTeam.map((slot, index) => (
              slot.player ? (
                <FilledPlayerSlot
                  key={index}
                  player={slot.player}
                  onPress={() => handlePlayerPress(slot.player!)}
                  isCaptain={captainId === slot.player.id}
                  isViceCaptain={viceCaptainId === slot.player.id}
                  teams={teams}
                />
              ) : (
                <EmptyPlayerSlot
                  key={index}
                  position={slot.position}
                  onPress={() => handleEmptySlotPress(index, slot.position, true)}
                />
              )
            ))}
          </View>
        </View>

        {/* Team Value and Save Section - Show when creating team or when user has players selected */}
        {(() => {
          const playerCount = getAllPlayers().length;
          const hasTeamName = teamName.trim();
          console.log("🔍 [DEBUG] Button visibility check:", {
            needsToCreateTeam,
            playerCount,
            hasTeamName,
            shouldShow: needsToCreateTeam || playerCount > 0 || hasTeamName
          });
          return needsToCreateTeam || playerCount > 0 || hasTeamName;
        })() && (
        <View style={styles.teamManagement}>
          {/* Team Name Input */}
          <View style={styles.teamNameSection}>
            <Text style={styles.teamNameLabel}>Team Name</Text>
            <TextInput
              mode="outlined"
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter your team name"
              style={styles.teamNameInput}
              maxLength={50}
              outlineColor="rgba(210,105,30,0.3)"
              activeOutlineColor="#D2691E"
              textColor="#FFFFFF"
              placeholderTextColor="rgba(255,255,255,0.6)"
              contentStyle={styles.teamNameInputContent}
              returnKeyType="done"
              blurOnSubmit={true}
              autoCorrect={false}
              autoCapitalize="words"
              dense={false}
            />
          </View>

          <View style={styles.budgetSection}>
            <Text style={styles.budgetLabel}>Team Value</Text>
            <View style={styles.budgetDisplay}>
              <Text style={[
                styles.budgetValue, 
                totalTeamValue > 100 && styles.budgetOverLimit
              ]}>
                ${totalTeamValue.toFixed(1)}M
              </Text>
              <Text style={styles.budgetLimit}> / $100M</Text>
            </View>
            
            {/* Player Count Display */}
            <View style={styles.playerCountDisplay}>
                <Text style={[
                  styles.playerCountValue,
                 getAllPlayers().length === 8 && styles.playerCountComplete
                ]}>
                  {getAllPlayers().length}
                </Text>
               <Text style={styles.playerCountLimit}> / 8 players</Text>
            </View>
            {totalTeamValue > 100 && (
              <Text style={styles.budgetWarning}>
                Budget exceeded! Remove players to stay within $100M limit.
              </Text>
            )}
          </View>
          
          <Button
            mode="contained"
            onPress={handleSaveTeam}
            disabled={(() => {
              const playerCount = getAllPlayers().length;
              const hasTeamName = teamName.trim();
                const isDisabled = totalTeamValue > 100 || 
                 playerCount !== 8 || 
                 !hasTeamName ||
                 !captainId ||
                !viceCaptainId ||
                buildSquadMutation.isPending ||
                false;
              
              console.log("🔍 [DEBUG] Button disabled check:", {
                totalTeamValue,
                playerCount,
                hasTeamName,
                captainId,
                viceCaptainId,
                isPending: createTeamMutation.isPending,
                isDisabled
              });
              
              return isDisabled;
            })()}
            loading={buildSquadMutation.isPending}
              style={[
                styles.saveButton,
               (totalTeamValue > 100 || getAllPlayers().length !== 8 || !teamName.trim() || !captainId || !viceCaptainId) && styles.saveButtonDisabled
              ]}
            buttonColor={
              totalTeamValue > 100 ? '#E53E3E' : 
              !teamName.trim() ? '#9CA3AF' :
              !captainId || !viceCaptainId ? '#F59E0B' :
              '#22C55E'
            }
          >
            {buildSquadMutation.isPending
              ? 'Building Squad...'
              : false
                ? 'Creating Lineup...'
                  : totalTeamValue > 100 
                    ? 'Budget Exceeded' 
                   : getAllPlayers().length !== 8 
                     ? `Select ${8 - getAllPlayers().length} More Players`
                    : !teamName.trim()
                      ? 'Enter Team Name'
                      : !captainId
                        ? 'Select Captain'
                        : !viceCaptainId
                          ? 'Select Vice-Captain'
                          : 'Create Team'
            }
          </Button>
        </View>
        )}
      </ScrollView>

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        visible={selectionModalVisible}
        position={selectedPosition}
        onClose={() => setSelectionModalVisible(false)}
        onPlayerSelect={handlePlayerSelect}
        currentTeamValue={totalTeamValue}
        startingTeam={startingTeam}
        benchTeam={benchTeam}
      />

      {/* Enhanced Player Modal */}
      <PlayerModal
        visible={captainModalVisible}
        player={selectedPlayer}
        onClose={() => setCaptainModalVisible(false)}
        onCaptainSelect={handleCaptainSelect}
        onViceCaptainSelect={handleViceCaptainSelect}
        onRemovePlayer={handleRemovePlayerFromModal}
        currentCaptain={captainId}
        currentViceCaptain={viceCaptainId}
        teams={teams}
      />

      {/* Remove Player Modal (Keep for backward compatibility) */}
      <RemovePlayerModal
        visible={removeModalVisible}
        player={selectedPlayer}
        onClose={() => setRemoveModalVisible(false)}
        onRemove={handleRemovePlayer}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF8C00', // Basketball orange background
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3, // Semi-transparent overlay
  },
  scrollContent: {
    paddingBottom: 150, // Increased padding to account for keyboard and bench player names
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 140, 0, 0.85)', // Basketball orange with transparency
    borderRadius: 20,
    margin: 16,
    borderWidth: 2,
    borderColor: '#FFD700', // Gold border
    elevation: 6,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
    borderWidth: 4,
    borderColor: '#FFD700', // Gold border for basketball court
  },
  court: {
    width: '100%',
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
    width: 85,
  },
  emptySlot: {
    width: 60,
    height: 75,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  emptySlotText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  positionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
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
  jerseyNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
  playerInfo: {
    marginTop: -5,
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
  },
  benchSection: {
    padding: 20,
    paddingBottom: 30, // Extra bottom padding for player names
    backgroundColor: 'rgba(255, 140, 0, 0.9)', // Basketball orange with high opacity
    marginHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 30, // Extra bottom margin for better spacing
    borderWidth: 3,
    borderColor: '#FFD700', // Gold border for basketball court feel
    elevation: 8,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
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
    flexWrap: 'wrap',
    gap: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  removeModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    elevation: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  teamFilter: {
    marginBottom: 16,
  },
  teamButton: {
    marginRight: 8,
  },
  playersList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerItemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 2,
  },
  playerItemTeam: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  playerItemPrice: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  playerItemOverBudget: {
    backgroundColor: '#FEF2F2',
    opacity: 0.6,
  },
  playerItemDisabled: {
    color: '#999',
  },
  playerItemPriceOverBudget: {
    color: '#E53E3E',
  },
  loading: {
    padding: 20,
  },
  closeButton: {
    marginTop: 8,
  },
  removeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  removeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  // Team Management Styles
  teamManagement: {
    padding: 20,
    backgroundColor: 'rgba(255, 140, 0, 0.9)', // Basketball orange with high opacity
    marginHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 40, // Added bottom margin for better spacing
    borderWidth: 3,
    borderColor: '#FFD700', // Gold border
    elevation: 8,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  teamNameSection: {
    marginBottom: 20,
    zIndex: 1, // Ensure input stays above other elements
  },
  teamNameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    // Remove extra padding since we have a separate label now
  },
  teamNameLabel: {
    color: '#D2691E', // Match the active outline color
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8, // Add margin to create space between label and input
    marginLeft: 4, // Slight left margin to align with input
  },
  teamNameInputContent: {
    color: '#FFFFFF',
    fontSize: 16, // Slightly larger font for better readability
    minHeight: 20, // Ensure minimum content height
    paddingTop: 8, // Add padding to content
  },
  budgetSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetLabel: {
    color: '#D2691E',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  budgetDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  budgetValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#22C55E',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  budgetOverLimit: {
    color: '#E53E3E',
  },
  budgetLimit: {
    fontSize: 18,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  playerCountDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  playerCountValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F59E0B',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  playerCountComplete: {
    color: '#22C55E',
  },
  playerCountLimit: {
    fontSize: 16,
    color: '#D2691E',
    fontWeight: '700',
    marginLeft: 4,
  },
  budgetWarning: {
    color: '#E53E3E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  saveButton: {
    borderRadius: 15,
    paddingVertical: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  // Captain Badge Styles
  captainBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  captainBadgeStyle: {
    backgroundColor: '#EAB308', // Yellow for captain
  },
  viceCaptainBadgeStyle: {
    backgroundColor: '#3B82F6', // Blue for vice-captain
  },
  captainBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Captain Modal Styles
  captainModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    elevation: 10,
    alignItems: 'center',
  },
  captainActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  captainButton: {
    flex: 1,
    minWidth: 100,
  },
  loadingText: {
    color: '#D2691E',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  // Enhanced Player Modal Styles
  playerModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  playerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerModalInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerModalName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  playerModalTeam: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  playerModalPrice: {
    fontSize: 18,
    color: '#22C55E',
    fontWeight: '700',
  },
  playerStats: {
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  currentRole: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  roleText: {
    fontSize: 16,
    color: '#D97706',
    fontWeight: '600',
  },
  playerModalActions: {
    gap: 12,
  },
  modalActionButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  removeButton: {
    marginTop: 8,
  },
  // Real Jersey Styles
  jerseyContainer: {
    width: 80,
    height: 100,
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
  // Existing team view styles
  scrollView: {
    flex: 1,
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
  benchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  // Player Info Modal styles
  playerInfoModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    elevation: 10,
    alignItems: 'center',
  },
  playerInfoHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  playerInfoName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  playerInfoPosition: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerInfoDetails: {
    width: '100%',
    marginBottom: 20,
  },
  playerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playerInfoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  playerInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeInfoButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeInfoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
