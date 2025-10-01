import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, Image } from "react-native";
import { Text, Button } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "src/hooks/useAuth";

const { width, height } = Dimensions.get('window');

// Lebanese Basketball Fantasy Logo Component
const LebaneseBasketballLogo = () => (
  <View style={styles.logoContainer}>
    <Image 
      source={require('../../assets/images/lebanese-basketball-logo.png')} 
      style={styles.logoImage}
      resizeMode="contain"
      onError={(error) => console.log('Logo image failed to load:', error)}
      onLoad={() => console.log('Logo image loaded successfully')}
    />
  </View>
);

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade in animation
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Bounce animation for the subtitle
    const bounceSequence = Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    const bounceLoop = Animated.loop(bounceSequence, { iterations: 3 });
    bounceLoop.start();
  }, []);

  return (
    <LinearGradient
      colors={['#FFB366', '#FFD9B3', '#FFA500']} // Light orange gradient
      locations={[0, 0.5, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        {/* Lebanese Basketball Fantasy Logo */}
        <Animated.View 
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: [{ scale: logoAnim }]
            }
          ]}
        >
          <LebaneseBasketballLogo />
        </Animated.View>

        {/* Welcome Section */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.welcomeText}>
            Welcome to Fantasy Basketball! 🏀
          </Text>
          
          <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
            <Text style={styles.subtitleText}>
              Build your dream team and compete for glory!
            </Text>
          </Animated.View>

          {user && (
            <Text style={styles.userText}>
              Welcome back, {user.email}! 👋
            </Text>
          )}

          <Button 
            mode="contained" 
            onPress={logout}
            style={styles.logoutButton}
            labelStyle={styles.buttonText}
          >
            Logout
          </Button>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  welcomeSection: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  // Logo Styles
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 200,
    height: 200,
    maxWidth: width * 0.8,
    maxHeight: height * 0.3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: 16,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: "center",
    color: "#34495E",
    marginBottom: 20,
    fontStyle: "italic",
    textShadowColor: "rgba(255, 255, 255, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  userText: {
    fontSize: 14,
    textAlign: "center",
    color: "#00A651", // Green color from Lebanese flag
    marginBottom: 20,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#CE1126", // Red color from Lebanese flag
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
