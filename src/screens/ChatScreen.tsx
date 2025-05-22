import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from 'react-native';
import { TextInput, IconButton, Avatar, Text, Menu } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useMessages } from '../context/MessageContext';
import { AuthContext } from '../navigation';
import { format } from 'date-fns';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export const ChatScreen = () => {
  const [newMessage, setNewMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const route = useRoute<ChatScreenRouteProp>();
  const { recipientId, recipientName, conversationId } = route.params;
  const { currentUser } = useContext(AuthContext);
  const { messages, sendMessage, deleteMessage, setCurrentConversation } = useMessages();

  useEffect(() => {
    setCurrentConversation(conversationId);
    return () => {
      setCurrentConversation(null);
    };
  }, [conversationId, setCurrentConversation]);

  // Filter messages for this conversation
  const chatMessages = messages.filter(
    msg => msg.conversationId === conversationId
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;
    try {
      await sendMessage(conversationId, newMessage.trim(), currentUser.id);
      setNewMessage('');
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (err) {
      console.error("sendMessage error:", err);
      Alert.alert("Error", "Unable to send message. (Error: " + (err instanceof Error ? err.message : String(err)) + ")");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(id) },
      ]
    );
  };

  const renderMessage = ({ item: message }: { item: any }) => {
    const isSentByMe = message.senderId === currentUser?.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isSentByMe ? styles.sentMessageContainer : styles.receivedMessageContainer,
        ]}
      >
        {!isSentByMe && (
          <Avatar.Text
            size={24}
            label={recipientName.substring(0, 2).toUpperCase()}
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageContent,
            isSentByMe ? styles.sentMessageContent : styles.receivedMessageContent,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isSentByMe ? styles.sentMessageText : styles.receivedMessageText,
            ]}
          >
            {message.content}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isSentByMe ? styles.sentMessageTimestamp : styles.receivedMessageTimestamp,
            ]}
          >
            {format(new Date(message.createdAt), 'HH:mm')}
          </Text>
        </View>
        {isSentByMe && (
          <IconButton
            icon="delete"
            size={18}
            onPress={() => handleDelete(message.id)}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    );
  };

  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <Text>Loading user...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start the conversation by sending a message
            </Text>
          </View>
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={500}
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    maxWidth: '80%',
  },
  sentMessageContainer: {
    alignSelf: 'flex-end',
  },
  receivedMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
  },
  sentMessageContent: {
    backgroundColor: '#007AFF',
  },
  receivedMessageContent: {
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentMessageTimestamp: {
    color: '#fff',
  },
  receivedMessageTimestamp: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
}); 