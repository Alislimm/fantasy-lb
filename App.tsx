import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "src/context/AuthContext";
import { AppTabs, AuthNavigator, RootNavigationProvider } from "src/navigation";
import { useAuth } from "src/hooks/useAuth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const queryClient = new QueryClient();

function RootNavigator() {
  const { user, initializing } = useAuth();
  console.log('[RootNavigator] User:', user);
  console.log('[RootNavigator] Initializing:', initializing);
  if (initializing) return null;
  console.log('[RootNavigator] Navigating to:', user ? 'AppTabs' : 'AuthNavigator');
  return user ? <AppTabs /> : <AuthNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#CE1126', '#FFFFFF', '#00A651']}
        locations={[0, 0.5, 1]}
        style={{ flex: 1 }}
      >
        <PaperProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RootNavigationProvider>
                <RootNavigator />
              </RootNavigationProvider>
            </AuthProvider>
          </QueryClientProvider>
        </PaperProvider>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}
