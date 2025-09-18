import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppTabParamList, AuthStackParamList } from "src/navigation/types";
import LoginScreen from "src/screens/LoginScreen";
import RegisterScreen from "src/screens/RegisterScreen";
// Placeholder screens
import HomeScreen from "src/screens/HomeScreen";
import PlayersScreen from "src/screens/PlayersScreen";
import TransfersScreen from "src/screens/TransfersScreen";
import LeaguesScreen from "src/screens/LeaguesScreen";
import ProfileScreen from "src/screens/ProfileScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

export const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

export const AppTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Players" component={PlayersScreen} />
    <Tab.Screen name="Transfers" component={TransfersScreen} />
    <Tab.Screen name="Leagues" component={LeaguesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const RootNavigationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};


