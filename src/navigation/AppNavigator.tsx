import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import MessageListScreen from '../screens/MessageListScreen';
import MessageDetailScreen from '../screens/MessageDetailScreen';
import NewMessageScreen from '../screens/NewMessageScreen';
import EditMessageScreen from '../screens/EditMessageScreen';
import 'react-native-gesture-handler';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MessageStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MessageList" 
      component={MessageListScreen} 
      options={{ title: 'Messages' }} 
    />
    <Stack.Screen 
      name="MessageDetail" 
      component={MessageDetailScreen} 
      options={{ title: 'Message Details' }} 
    />
    <Stack.Screen 
      name="NewMessage" 
      component={NewMessageScreen} 
      options={{ title: 'New Message' }} 
    />
    <Stack.Screen 
      name="EditMessage" 
      component={EditMessageScreen} 
      options={{ title: 'Edit Message' }} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color }) => (
              <View>
                <Text style={{ fontSize: 24, color }}>🏠</Text>
              </View>
            ),
          }} 
        />
        <Tab.Screen 
          name="Messages" 
          component={MessageStack} 
          options={{
            tabBarIcon: ({ color }) => (
              <View>
                <Text style={{ fontSize: 24, color }}>✉️</Text>
              </View>
            ),
          }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
