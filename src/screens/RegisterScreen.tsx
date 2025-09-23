import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AuthStackParamList } from "src/navigation/types";
import { useMutation } from "@tanstack/react-query";
import { registerApi } from "src/services/api";

const { width, height } = Dimensions.get('window');

// Lebanese Basketball Fantasy Logo Component
const LebaneseBasketballLogo = () => (
  <View style={styles.logoContainer}>
    <Image 
      source={require('../../assets/images/lebanese-basketball-logo.png')} 
      style={styles.logoImage}
      resizeMode="contain"
      onError={(error: any) => console.log('Register logo image failed to load:', error)}
      onLoad={() => console.log('Register logo image loaded successfully')}
    />
  </View>
);

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favouriteTeamId, setFavouriteTeamId] = useState("");
  const [nationality, setNationality] = useState("");
  const insets = useSafeAreaInsets();

  const mutation = useMutation({
    mutationFn: () => registerApi({
      username,
      email,
      password,
      favouriteTeamId: parseInt(favouriteTeamId) || 1, // Default to team 1
      nationality,
    }),
    onSuccess: () => {
      // Redirect to login after successful registration
      navigation.navigate("Login");
    },
  });

  const handleRegister = () => {
    if (!username || !email || !password || !nationality) return;
    mutation.mutate();
  };

  return (
    <LinearGradient
      colors={['#CE1126', '#FFFFFF', '#00A651']} // Lebanese flag colors: Red, White, Green
      locations={[0, 0.5, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Lebanese Basketball Fantasy Logo */}
          <View style={styles.logoSection}>
            <LebaneseBasketballLogo />
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              Join the Game! 🏀
            </Text>
          
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              outlineColor="#4B0082"
              activeOutlineColor="#4B0082"
            />
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              outlineColor="#4B0082"
              activeOutlineColor="#4B0082"
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              outlineColor="#4B0082"
              activeOutlineColor="#4B0082"
            />
            
            <TextInput
              label="Favourite Team ID"
              value={favouriteTeamId}
              onChangeText={setFavouriteTeamId}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="soccer" />}
              outlineColor="#4B0082"
              activeOutlineColor="#4B0082"
            />
            
            <TextInput
              label="Nationality"
              value={nationality}
              onChangeText={setNationality}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="flag" />}
              outlineColor="#4B0082"
              activeOutlineColor="#4B0082"
            />

            {mutation.isError ? (
              <Text style={styles.errorText}>
                {(() => {
                  const err = mutation.error as any;
                  const msg = err?.response?.data?.message || err?.message || "Registration failed";
                  return String(msg);
                })()}
              </Text>
            ) : null}

            <Button 
              mode="contained" 
              onPress={handleRegister} 
              loading={mutation.isPending} 
              disabled={mutation.isPending}
              style={styles.button}
              labelStyle={styles.buttonText}
              buttonColor="#00A651"
            >
              Sign Up
            </Button>

            <Button 
              mode="text" 
              onPress={() => navigation.navigate("Login")}
              style={styles.linkButton}
              labelStyle={styles.linkText}
              textColor="#CE1126"
            >
              Already have an account? Sign In
            </Button>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  content: { 
    flex: 1, 
    justifyContent: "center", 
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  title: { 
    textAlign: "center", 
    marginBottom: 20,
    color: "#2C3E50",
    fontWeight: "bold",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: { 
    marginBottom: 16,
    backgroundColor: "white",
  },
  button: { 
    marginTop: 16,
    borderRadius: 25,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  linkButton: { 
    marginTop: 16,
  },
  linkText: {
    fontWeight: "600",
  },
  errorText: { 
    color: "#E74C3C", 
    marginBottom: 10, 
    textAlign: "center",
    fontWeight: "500",
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
});
