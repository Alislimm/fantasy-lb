import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Alert } from "react-native";
import { Text, Card, Button, IconButton, ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../hooks/useAuth";
import { useUserLeagues, useLeagueDetails } from "../hooks/useLeagues";
import type { UserLeague, LeagueDetails } from "../services/api";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedLeague, setSelectedLeague] = useState<LeagueDetails | null>(null);
  const [leagueDetailsModalVisible, setLeagueDetailsModalVisible] = useState(false);

  const { data: userLeagues, isLoading: userLeaguesLoading, refetch: refetchUserLeagues } = useUserLeagues(user?.id);
  const { data: leagueDetails, isLoading: leagueDetailsLoading } = useLeagueDetails(
    selectedLeague?.leagueId,
    { enabled: !!selectedLeague }
  );

  const handleLeaguePress = (league: UserLeague) => {
    setSelectedLeague({
      leagueId: league.leagueId,
      leagueName: league.leagueName,
      leagueType: league.leagueType,
      rankings: []
    });
    setLeagueDetailsModalVisible(true);
  };

  const closeLeagueDetailsModal = () => {
    setLeagueDetailsModalVisible(false);
    setSelectedLeague(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (userLeaguesLoading) {
    return (
      <LinearGradient
        colors={['#FFB366', '#FFD9B3', '#FFA500']}
        locations={[0, 0.5, 1]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#FFB366', '#FFD9B3', '#FFA500']}
      locations={[0, 0.5, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your account and league information</Text>
        </View>

        {/* User Info Card */}
        <Card style={styles.userInfoCard}>
          <View style={styles.userInfoContent}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.username || 'Unknown User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
              <Text style={styles.userRole}>{user?.role || 'USER'}</Text>
            </View>
          </View>
        </Card>

        {/* Leagues Section */}
        <View style={styles.leaguesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Leagues</Text>
            <Button
              mode="outlined"
              onPress={() => refetchUserLeagues()}
              style={styles.refreshButton}
              compact
            >
              Refresh
            </Button>
          </View>

          {!userLeagues || userLeagues.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No leagues joined yet</Text>
              <Text style={styles.emptySubtext}>Create or join a league to get started</Text>
            </Card>
          ) : (
            <View style={styles.leaguesList}>
              {userLeagues.map((league) => (
                <TouchableOpacity
                  key={league.leagueId}
                  style={styles.leagueCard}
                  onPress={() => handleLeaguePress(league)}
                  activeOpacity={0.8}
                >
                  <View style={styles.leagueInfo}>
                    <Text style={styles.leagueName}>{league.leagueName}</Text>
                    <Text style={styles.leagueType}>{league.leagueType}</Text>
                    <Text style={styles.leagueJoinedDate}>
                      Joined: {formatDate(league.joinedAt)}
                    </Text>
                  </View>
                  <View style={styles.leagueStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{league.totalPoints}</Text>
                      <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>#{league.rank}</Text>
                      <Text style={styles.statLabel}>Rank</Text>
                    </View>
                  </View>
                  <IconButton icon="chevron-right" size={20} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* League Details Modal */}
      <Modal visible={leagueDetailsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.leagueDetailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedLeague?.leagueName || 'League Details'}
              </Text>
              <IconButton icon="close" onPress={closeLeagueDetailsModal} />
            </View>
            
            <ScrollView style={styles.modalContent}>
              {leagueDetailsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={styles.loadingText}>Loading standings...</Text>
                </View>
              ) : leagueDetails && leagueDetails.rankings ? (
                <View style={styles.standingsContainer}>
                  <Text style={styles.standingsTitle}>League Standings</Text>
                  <View style={styles.standingsHeader}>
                    <Text style={styles.standingsHeaderText}>Rank</Text>
                    <Text style={styles.standingsHeaderText}>Team</Text>
                    <Text style={styles.standingsHeaderText}>Points</Text>
                  </View>
                  {leagueDetails.rankings.map((team, index) => (
                    <View key={index} style={styles.standingsRow}>
                      <Text style={styles.standingsRank}>#{index + 1}</Text>
                      <Text style={styles.standingsTeam}>{team.teamName}</Text>
                      <Text style={styles.standingsPoints}>{team.totalPoints}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Failed to load league details</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  userInfoCard: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  leaguesSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  refreshButton: {
    borderRadius: 8,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  leaguesList: {
    gap: 12,
  },
  leagueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  leagueType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  leagueJoinedDate: {
    fontSize: 11,
    color: '#888',
  },
  leagueStats: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueDetailsModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.95,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    padding: 20,
  },
  standingsContainer: {
    gap: 8,
  },
  standingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  standingsHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  standingsHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  standingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    marginBottom: 4,
  },
  standingsRank: {
    flex: 0.3,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  standingsTeam: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
  },
  standingsPoints: {
    flex: 0.3,
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});


