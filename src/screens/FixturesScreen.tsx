import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFixtures } from '../hooks/useFixtures';
import { useTeams } from '../hooks/useTeams';
import type { Team } from '../services/api';

const { width } = Dimensions.get('window');

// Helper function to get team colors
const getTeamColor = (teamName: string) => {
  const colors: { [key: string]: string } = {
    'Liverpool': '#C8102E',
    'Everton': '#003399',
    'Brighton and Hove Albion': '#0057B8',
    'Tottenham Hotspur': '#132257',
    'Burnley': '#6C1D45',
    'Nottingham Forest': '#DD0000',
    'West Ham United': '#7A263A',
    'Crystal Palace': '#1B458F',
    'Wolverhampton Wanderers': '#FDB913',
    'Leeds United': '#FFCD00',
    'Manchester United': '#DA020E',
    'Chelsea': '#034694',
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

// Helper function to get team logo
const getTeamLogo = (teamName: string, teams: Team[] | undefined) => {
  if (!teams) return undefined;
  
  // First try exact name match
  let team = teams.find(t => t.name === teamName);
  
  // If not found, try short name match
  if (!team) {
    team = teams.find(t => t.shortName === teamName);
  }
  
  // If still not found, try partial name match (case insensitive)
  if (!team) {
    team = teams.find(t => 
      t.name.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(t.name.toLowerCase())
    );
  }
  
  console.log(`[Fixtures] Looking for team: "${teamName}", found:`, team?.name);
  return team?.imageUrl;
};

interface FixtureItemProps {
  fixture: { homeTeam: string; awayTeam: string };
  teams: Team[] | undefined;
}

const FixtureItem = ({ fixture, teams }: FixtureItemProps) => {
  const homeLogo = getTeamLogo(fixture.homeTeam, teams);
  const awayLogo = getTeamLogo(fixture.awayTeam, teams);
  
  return (
    <View style={styles.fixtureItem}>
      <View style={styles.teamContainer}>
        <Text style={styles.teamName}>{fixture.homeTeam}</Text>
        {homeLogo ? (
          <Image 
            source={{ uri: homeLogo }} 
            style={styles.teamLogo}
            onError={() => console.log(`[Fixtures] Failed to load logo for ${fixture.homeTeam}: ${homeLogo}`)}
            onLoad={() => console.log(`[Fixtures] Successfully loaded logo for ${fixture.homeTeam}`)}
          />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: getTeamColor(fixture.homeTeam) }]}>
            <Text style={styles.logoText}>{fixture.homeTeam.charAt(0)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.vsText}>VS</Text>
      </View>
      
      <View style={styles.teamContainer}>
        {awayLogo ? (
          <Image 
            source={{ uri: awayLogo }} 
            style={styles.teamLogo}
            onError={() => console.log(`[Fixtures] Failed to load logo for ${fixture.awayTeam}: ${awayLogo}`)}
            onLoad={() => console.log(`[Fixtures] Successfully loaded logo for ${fixture.awayTeam}`)}
          />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: getTeamColor(fixture.awayTeam) }]}>
            <Text style={styles.logoText}>{fixture.awayTeam.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.teamName}>{fixture.awayTeam}</Text>
      </View>
    </View>
  );
};

export default function FixturesScreen() {
  const insets = useSafeAreaInsets();
  const [currentGameWeek, setCurrentGameWeek] = useState(1);
  
  const { data: fixtures, isLoading: fixturesLoading, error: fixturesError, refetch: refetchFixtures } = useFixtures({
    gameWeekId: currentGameWeek,
  });
  
  const { data: teams } = useTeams();
  
  // Debug logging for teams data
  React.useEffect(() => {
    if (teams) {
      console.log('[Fixtures] Teams data loaded:', teams);
    }
  }, [teams]);

  const handlePreviousWeek = () => {
    if (currentGameWeek > 1) {
      setCurrentGameWeek(currentGameWeek - 1);
    }
  };

  const handleNextWeek = () => {
    setCurrentGameWeek(currentGameWeek + 1);
  };

  const formatGameWeekDate = (gameWeekId: number) => {
    // Mock date calculation - in real app this would come from API
    const startDate = new Date(2024, 8, 20 + (gameWeekId - 1) * 7); // Starting from September 20, 2024
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    
    const startStr = startDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const endStr = endDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${startStr} - ${endStr}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>Fixtures</Text>
        </View>

        {/* GameWeek Navigation */}
        <View style={styles.gameWeekHeader}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handlePreviousWeek}
            disabled={currentGameWeek <= 1}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.navButtonGradient}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.gameWeekInfo}>
            <Text style={styles.gameWeekTitle}>Matchweek {currentGameWeek}</Text>
            <Text style={styles.gameWeekDate}>{formatGameWeekDate(currentGameWeek)}</Text>
          </View>

          <TouchableOpacity 
            style={styles.navButton} 
            onPress={handleNextWeek}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.navButtonGradient}
            >
              <Text style={styles.navButtonText}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Fixtures List */}
        <View style={styles.fixturesContainer}>
          {fixturesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>Loading fixtures...</Text>
            </View>
          ) : fixturesError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load fixtures</Text>
              <Button mode="outlined" onPress={() => refetchFixtures()}>
                Retry
              </Button>
            </View>
          ) : fixtures && fixtures.length > 0 ? (
            fixtures.map((fixture, index) => (
              <React.Fragment key={index}>
                <FixtureItem fixture={fixture} teams={teams} />
                {index < fixtures.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No fixtures found for this gameweek</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    color: '#8B5CF6',
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gameWeekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(139,92,246,0.1)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  navButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  navButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  navButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameWeekInfo: {
    alignItems: 'center',
    flex: 1,
  },
  gameWeekTitle: {
    color: '#8B5CF6',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  gameWeekDate: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '500',
  },
  fixturesContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  fixtureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 80,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
    textAlign: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  vsText: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(139,92,246,0.2)',
    marginHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8B5CF6',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A855F7',
    fontSize: 16,
    textAlign: 'center',
  },
});
