import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useMessages } from '../context/MessageContext';

type MessageDetailScreenRouteProp = RouteProp<RootStackParamList, 'MessageDetail'>;
type MessageDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MessageDetail'>;

const MessageDetailScreen = () => {
  const route = useRoute<MessageDetailScreenRouteProp>();
  const navigation = useNavigation<MessageDetailScreenNavigationProp>();
  const { messages, updateMessage, deleteMessage } = useMessages();
  const { messageId } = route.params;
  
  const [message, setMessage] = useState<{
    id: string;
    text: string;
    sender: string;
    timestamp: number;
    isRead: boolean;
  } | null>(null);

  useEffect(() => {
    const foundMessage = messages.find(msg => msg.id === messageId);
    if (foundMessage) {
      setMessage(foundMessage);
    } else {
      Alert.alert('Error', 'Message not found');
      navigation.goBack();
    }
  }, [messageId, messages]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMessage(messageId);
            navigation.navigate('MessageList');
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (message) {
      navigation.navigate('EditMessage', { messageId: message.id });
    }
  };

  if (!message) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.sender}>{message.sender}</Text>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleString()}
        </Text>
        <Text style={styles.messageText}>{message.text}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  sender: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonText: {
    color: 'white',
  },
});

export default MessageDetailScreen;
