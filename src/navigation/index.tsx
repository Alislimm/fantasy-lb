import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import { useAuth } from "src/hooks/useAuth";
import { useUserTeam } from "src/hooks/useUserTeam";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

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
  
  // Determine if user has a team
  const hasTeam = user?.hasFantasyTeam && userTeam;
  const teamTabName = hasTeam ? "Pick Team" : "Create Team";

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="Pick Team" 
        component={PickTeamScreen}
        options={{ title: teamTabName }}
      />
      <Tab.Screen name="Fixtures" component={FixturesScreen} />
      {/* Only show Points tab if user has a team */}
      {hasTeam && (
        <Tab.Screen name="Points" component={MyTeamScreen} />
      )}
      <Tab.Screen name="Leagues" component={LeaguesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};


