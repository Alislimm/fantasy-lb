import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTabParamList, AuthStackParamList } from "src/navigation/types";
import SplashScreen from "src/screens/SplashScreen";
import LoginScreen from "src/screens/LoginScreen";
import RegisterScreen from "src/screens/RegisterScreen";
// Placeholder screens
import HomeScreen from "src/screens/HomeScreen";
import PickTeamScreen from "src/screens/PickTeamScreen";
import MyTeamScreen from "src/screens/MyTeamScreen";
import LeaguesScreen from "src/screens/LeaguesScreen";
import ProfileScreen from "src/screens/ProfileScreen";
import FixturesScreen from "src/screens/FixturesScreen";
import TransfersScreen from "src/screens/TransfersScreen";
import PointsScreen from "src/screens/PointsScreen";
import { useAuth } from "src/hooks/useAuth";
import { useUserTeam } from "src/hooks/useUserTeam";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// Simple Icon Components
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>🏠</Text>
  </View>
);

const TeamIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>🏀</Text>
  </View>
);

const FixturesIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>📅</Text>
  </View>
);

const LeaguesIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>🏆</Text>
  </View>
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>👤</Text>
  </View>
);

const TransfersIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>🔄</Text>
  </View>
);

const PointsIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>📊</Text>
  </View>
);

// Splash Screen Wrapper Component
const SplashScreenWrapper = ({ navigation }: any) => {
  const handleSplashFinish = () => {
    navigation.navigate('Login');
  };

  return <SplashScreen onFinish={handleSplashFinish} />;
};

export const AuthNavigator = () => (
  <AuthStack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="Splash"
  >
    <AuthStack.Screen name="Splash" component={SplashScreenWrapper} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

export const AppTabs = () => {
  const { user } = useAuth();
  const { data: userTeam } = useUserTeam();
  const insets = useSafeAreaInsets();
  
  // Determine if user has a team
  const hasTeam = user?.hasFantasyTeam && userTeam;
  const teamTabName = hasTeam ? "My Team" : "Create Team";

  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="Pick Team" 
        component={PickTeamScreen}
        options={{ 
          title: teamTabName,
          tabBarIcon: ({ focused }) => <TeamIcon focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="Fixtures" 
        component={FixturesScreen}
        options={{
          tabBarIcon: ({ focused }) => <FixturesIcon focused={focused} />,
        }}
      />
      {/* Only show Transfers tab if user has a team */}
      {hasTeam && (
        <Tab.Screen 
          name="Transfers" 
          component={TransfersScreen}
          options={{
            tabBarIcon: ({ focused }) => <TransfersIcon focused={focused} />,
          }}
        />
      )}
      {/* Only show Points tab if user has a team */}
      {hasTeam && (
        <Tab.Screen 
          name="Points" 
          component={PointsScreen}
          options={{
            tabBarIcon: ({ focused }) => <PointsIcon focused={focused} />,
          }}
        />
      )}
      <Tab.Screen 
        name="Leagues" 
        component={LeaguesScreen}
        options={{
          tabBarIcon: ({ focused }) => <LeaguesIcon focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};

// Styles for the tab icons
const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
  },
  iconFocused: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  iconText: {
    fontSize: 20,
    color: '#666',
  },
  iconTextFocused: {
    color: '#FFD700',
  },
});


