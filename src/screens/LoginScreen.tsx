import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AuthStackParamList } from "../navigation/types";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const { width, height } = Dimensions.get('window');

// Lebanese Basketball Fantasy Logo Component
const LebaneseBasketballLogo = () => (
  <View style={styles.logoContainer}>
    <Image 
      source={require('../../assets/images/lebanese-basketball-logo.png')} 
      style={styles.logoImage}
      resizeMode="contain"
      onError={(error: any) => console.log('Login logo image failed to load:', error)}
      onLoad={() => console.log('Login logo image loaded successfully')}
    />
  </View>
);

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();

  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: () => loginApi(usernameOrEmail, password),
    onSuccess: async (data) => {
      await login(data.token, data.user ?? null);
    },
  });

  const handleLogin = () => {
    if (!usernameOrEmail || !password) return;
    mutation.mutate();
  };

  return (
    <LinearGradient
      colors={['#CE1126', '#FFFFFF', '#00A651']} // Lebanese flag colors: Red, White, Green
      locations={[0, 0.5, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        {/* Lebanese Basketball Fantasy Logo */}
        <View style={styles.logoSection}>
          <LebaneseBasketballLogo />
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back! 🏀</Text>
          
          <TextInput
            label="Username or Email"
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
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
          {mutation.isError ? (
            <Text style={styles.errorText}>
              {(() => {
                const err = mutation.error as any;
                const data = err?.response?.data;
                const msg =
                  (typeof data === "string" && data) ||
                  data?.message ||
                  data?.error ||
                  err?.message ||
                  "Login failed";
                return String(msg);
              })()}
            </Text>
          ) : null}
          <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={mutation.isPending} 
            disabled={mutation.isPending}
            style={styles.loginButton}
            labelStyle={styles.buttonText}
            buttonColor="#CE1126"
          >
            Sign In
          </Button>

          <Button 
            mode="text" 
            onPress={() => navigation.navigate("Register")}
            style={styles.linkButton}
            labelStyle={styles.linkText}
            textColor="#00A651"
          >
            Not registered yet? Sign Up
          </Button>
        </View>
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: 20,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: { 
    marginBottom: 16,
    backgroundColor: "white",
  },
  loginButton: {
    marginTop: 8,
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
