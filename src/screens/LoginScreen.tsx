import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back! 🏀</Text>
        
        <TextInput
          label="Username or Email"
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="account" />}
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
        >
          Sign In
        </Button>

        <Button 
          mode="text" 
          onPress={() => navigation.navigate("Register")}
          style={styles.linkButton}
          labelStyle={styles.linkText}
        >
          Not registered yet? Sign Up
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20,
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: 20,
  },
  input: { 
    marginBottom: 16,
    backgroundColor: "white",
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 25,
    backgroundColor: "#CE1126",
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
    color: "#00A651",
    fontWeight: "600",
  },
  errorText: {
    color: "#E74C3C",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "500",
  },
});
