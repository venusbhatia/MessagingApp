import React, { createContext, useState, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrentUser, saveCurrentUser } from '../services/storage';
import { User } from '../types';

// Import screens
import AuthScreen from '../screens/AuthScreen';
import InboxScreen from '../screens/InboxScreen';
import ChatScreen from '../screens/ChatScreen';
import NewMessageScreen from '../screens/NewMessageScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GroupConversationsScreen from '../screens/GroupConversationsScreen';

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  signIn: (user: User) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  signIn: () => {},
  logout: () => {},
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="inbox" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NewMessage"
        component={NewMessageScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-plus" size={size} color={color} />
          ),
          title: 'New Message',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Force demo user id to 'currentUser' for demo consistency
          user.id = 'currentUser';
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = (user: User) => {
    // Force demo user id to 'currentUser' for demo consistency
    user.id = 'currentUser';
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await saveCurrentUser(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, signIn, logout }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route }) => ({
                  headerShown: true,
                  title: route.params.recipientName,
                })}
              />
              <Stack.Screen
                name="GroupConversations"
                component={GroupConversationsScreen}
                options={{ headerShown: true, title: 'Group' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}; 