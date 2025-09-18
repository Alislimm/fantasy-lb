import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "src/navigation/types";
import { useMutation } from "@tanstack/react-query";
import { registerApi } from "src/services/api";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favouriteTeamId, setFavouriteTeamId] = useState("");
  const [nationality, setNationality] = useState("");

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="lock" />}
        />
        
        <TextInput
          label="Favourite Team ID"
          value={favouriteTeamId}
          onChangeText={setFavouriteTeamId}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="soccer" />}
        />
        
        <TextInput
          label="Nationality"
          value={nationality}
          onChangeText={setNationality}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="flag" />}
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
        >
          Sign Up
        </Button>

        <Button 
          mode="text" 
          onPress={() => navigation.navigate("Login")}
          style={styles.linkButton}
          labelStyle={styles.linkText}
        >
          Already have an account? Sign In
        </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 20 },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: { 
    textAlign: "center", 
    marginBottom: 20,
    color: "#2C3E50",
    fontWeight: "bold",
  },
  input: { 
    marginBottom: 16,
    backgroundColor: "white",
  },
  button: { 
    marginTop: 16,
    borderRadius: 25,
    backgroundColor: "#00A651",
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
    color: "#CE1126",
    fontWeight: "600",
  },
  errorText: { 
    color: "#E74C3C", 
    marginBottom: 10, 
    textAlign: "center",
    fontWeight: "500",
  },
});
