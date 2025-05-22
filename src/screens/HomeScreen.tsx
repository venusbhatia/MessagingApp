import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Messaging App</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MessageList')}
      >
        <Text style={styles.buttonText}>View Messages</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.newMessageButton]}
        onPress={() => navigation.navigate('NewMessage')}
      >
        <Text style={[styles.buttonText, styles.newMessageButtonText]}>New Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  newMessageButton: {
    backgroundColor: '#34C759',
  },
  newMessageButtonText: {
    color: 'white',
  },
});

export default HomeScreen;
