import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useMessages } from '../context/MessageContext';

type EditMessageScreenRouteProp = RouteProp<RootStackParamList, 'EditMessage'>;
type EditMessageScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditMessage'>;

const EditMessageScreen = () => {
  const route = useRoute<EditMessageScreenRouteProp>();
  const navigation = useNavigation<EditMessageScreenNavigationProp>();
  const { messageId } = route.params;
  const { messages, updateMessage } = useMessages();
  
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');

  useEffect(() => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      setText(message.text);
      setSender(message.sender);
    } else {
      Alert.alert('Error', 'Message not found');
      navigation.goBack();
    }
  }, [messageId, messages, navigation]);

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    try {
      await updateMessage(messageId, text.trim());
      Alert.alert('Success', 'Message updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to update message', error);
      Alert.alert('Error', 'Failed to update message. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Sender</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={sender}
          editable={false}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={text}
          onChangeText={setText}
          placeholder="Type your message here..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save Changes</Text>
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
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  messageInput: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#333',
  },
});

export default EditMessageScreen;
