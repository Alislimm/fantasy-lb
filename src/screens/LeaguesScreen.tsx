import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Alert, Clipboard } from "react-native";
import { Text, Card, Button, TextInput, IconButton, ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../hooks/useAuth";
import { useCreateLeague, useJoinLeague } from "../hooks/useLeagues";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function LeaguesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [leagueName, setLeagueName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createdLeague, setCreatedLeague] = useState<any>(null);

  const createLeagueMutation = useCreateLeague();
  const joinLeagueMutation = useJoinLeague();

  const handleCreateLeague = async () => {
    if (!leagueName.trim()) {
      Alert.alert('Error', 'Please enter a league name');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      const result = await createLeagueMutation.mutateAsync({
        userId: user.id,
        request: { name: leagueName.trim() }
      });
      
      setCreatedLeague(result);
      setLeagueName("");
      setShowCreateModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create league. Please try again.');
    }
  };

  const handleJoinLeague = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a league code');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      await joinLeagueMutation.mutateAsync({
        joinCode: joinCode.trim(),
        userId: user.id
      });
      
      setJoinCode("");
      setShowJoinModal(false);
      Alert.alert('Success', 'Successfully joined the league!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to Profile tab
            (navigation as any).navigate('Profile');
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to join league. Please check the code and try again.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setLeagueName("");
    setCreatedLeague(null);
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setJoinCode("");
  };

  return (
    <LinearGradient
      colors={['#FFB366', '#FFD9B3', '#FFA500']}
      locations={[0, 0.5, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fantasy Leagues</Text>
          <Text style={styles.subtitle}>Create or join a league to compete with friends</Text>
        </View>

        {/* Options Cards */}
        <View style={styles.optionsContainer}>
          {/* Create League Card */}
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>🏆</Text>
            </View>
            <Text style={styles.optionTitle}>Create League</Text>
            <Text style={styles.optionDescription}>Start your own league and invite friends</Text>
          </TouchableOpacity>

          {/* Join League Card */}
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => setShowJoinModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>🔗</Text>
            </View>
            <Text style={styles.optionTitle}>Join League</Text>
            <Text style={styles.optionDescription}>Enter a code to join an existing league</Text>
          </TouchableOpacity>
        </View>

        {/* Created League Info */}
        {createdLeague && (
          <Card style={styles.leagueInfoCard}>
            <Text style={styles.leagueInfoTitle}>League Created Successfully!</Text>
            <Text style={styles.leagueInfoName}>{createdLeague.name}</Text>
            
            <View style={styles.codeContainer}>
              <View style={styles.codeField}>
                <Text style={styles.codeLabel}>Join Code:</Text>
                <View style={styles.codeRow}>
                  <Text style={styles.codeValue}>{createdLeague.joinCode}</Text>
                  <IconButton
                    icon="content-copy"
                    size={20}
                    onPress={() => copyToClipboard(createdLeague.joinCode, 'Join code')}
                  />
                </View>
              </View>
              
              <View style={styles.codeField}>
                <Text style={styles.codeLabel}>Invite Code:</Text>
                <View style={styles.codeRow}>
                  <Text style={styles.codeValue}>{createdLeague.inviteCode}</Text>
                  <IconButton
                    icon="content-copy"
                    size={20}
                    onPress={() => copyToClipboard(createdLeague.inviteCode, 'Invite code')}
                  />
                </View>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={() => setCreatedLeague(null)}
              style={styles.doneButton}
            >
              Done
            </Button>
          </Card>
        )}
      </ScrollView>

      {/* Create League Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create League</Text>
              <IconButton icon="close" onPress={closeCreateModal} />
            </View>
            
            <View style={styles.modalContent}>
              <TextInput
                label="League Name"
                value={leagueName}
                onChangeText={setLeagueName}
                style={styles.input}
                mode="outlined"
                placeholder="Enter league name"
              />
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={closeCreateModal}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateLeague}
                  loading={createLeagueMutation.isPending}
                  disabled={!leagueName.trim()}
                  style={styles.modalButton}
                >
                  Create
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join League Modal */}
      <Modal visible={showJoinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join League</Text>
              <IconButton icon="close" onPress={closeJoinModal} />
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.joinInstructions}>
                Please enter the league code provided by the league creator
              </Text>
              
              <TextInput
                label="League Code"
                value={joinCode}
                onChangeText={setJoinCode}
                style={styles.input}
                mode="outlined"
                placeholder="Enter league code"
                autoCapitalize="characters"
              />
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={closeJoinModal}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleJoinLeague}
                  loading={joinLeagueMutation.isPending}
                  disabled={!joinCode.trim()}
                  style={styles.modalButton}
                >
                  Join
                </Button>
              </View>
            </View>
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
  optionsContainer: {
    padding: 20,
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionIconText: {
    fontSize: 24,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  leagueInfoCard: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  leagueInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
    textAlign: 'center',
    marginBottom: 8,
  },
  leagueInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  codeContainer: {
    gap: 16,
    marginBottom: 20,
  },
  codeField: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  codeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  doneButton: {
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  joinInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
});


