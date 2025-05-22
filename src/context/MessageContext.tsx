import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, User } from '../types';

interface MessageContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createConversation: (participants: string[], isGroup?: boolean, name?: string) => string;
  getConversation: (id: string) => Conversation | undefined;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  messages: Message[];
  sendMessage: (conversationId: string, text: string, senderId: string) => Promise<Message>;
  updateMessage: (id: string, text: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  currentUser: User | null;
  users: User[];
  getUser: (id: string) => User | undefined;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

const MOCK_USERS: User[] = [
  ...Array.from({ length: 23 }, (_, i) => ({
    id: `user${i + 1}`,
    email: `user${i + 1}@example.com`,
    displayName: `User ${i + 1}`,
    photoURL: undefined,
    createdAt: new Date(),
  })),
];

const STORAGE_KEYS = {
  CONVERSATIONS: '@MessagingApp:conversations',
  MESSAGES: '@MessagingApp:messages',
  CURRENT_USER: '@MessagingApp:currentUser',
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentConversation, setCurrentConversationState] = useState<Conversation | null>(null);
  const [users] = useState<User[]>(MOCK_USERS);

  useEffect(() => {
    const defaultUser: User = {
      id: 'currentUser',
      email: 'me@example.com',
      displayName: 'Me',
      photoURL: undefined,
      createdAt: new Date(),
    };
    setCurrentUser(defaultUser);

    const GROUPS = ['Friends', 'Family', 'Work', 'School', 'Home', 'Other'];
    const DEMO_MESSAGES = [
      "Hey, how's it going?",
      "What's up?",
      "Long time no see!",
      "Hope you're doing well!",
      "How was your day?",
      "Let's catch up soon!",
      "Did you see the news?",
      "Happy Friday!",
      "Any plans for the weekend?",
      "Miss you!",
      "How's work?",
      "How's the family?",
      "Let's grab coffee!",
      "Are you free this week?",
      "Just checking in!",
      "Hope everything's good!",
      "How's school going?",
      "Let's hang out!",
      "Good morning!",
      "Good night!"
    ];
    const demoConversations: Conversation[] = [];
    for (let i = 1; i <= 23; i++) {
      const group = GROUPS[(i - 1) % GROUPS.length] as Conversation['group'];
      const message = DEMO_MESSAGES[(i - 1) % DEMO_MESSAGES.length];
      demoConversations.push({
        id: `conv${i}`,
        participants: ['currentUser', `user${i}`],
        lastMessage: {
          content: message,
          timestamp: new Date(Date.now() - i * 3600000),
          senderId: `user${i}`,
        },
        unreadCount: 0,
        isGroup: false,
        updatedAt: new Date(Date.now() - i * 3600000),
        group,
      });
    }
    setConversations(demoConversations);
    setMessages([]);
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
        await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save data', error);
      }
    };

    saveData();
  }, [conversations, messages]);

  const getUser = useCallback((id: string): User | undefined => {
    console.log('getUser called with id:', id, 'Available user ids:', users.map(u => u.id));
    return users.find(user => user.id === id);
  }, [users]);

  const getConversation = useCallback((id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id);
  }, [conversations]);

  const setCurrentConversation = useCallback((id: string | null) => {
    if (!id) {
      setCurrentConversationState(null);
      return;
    }
    const conversation = getConversation(id);
    if (conversation) {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.conversationId === id && !msg.read 
            ? { ...msg, read: true, status: 'read' as const }
            : msg
        )
      );
      if (conversation.unreadCount > 0) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === id 
              ? { ...conv, unreadCount: 0, updatedAt: new Date() }
              : conv
          )
        );
      }
      setCurrentConversationState(conversation);
    }
  }, [getConversation]);

  const createConversation = useCallback((participantIds: string[], isGroup = false, name?: string): string => {
    if (!currentUser) {
      throw new Error('No current user');
    }
    if (!isGroup && participantIds.length === 1) {
      const existingConversation = conversations.find(conv => 
        !conv.isGroup && 
        conv.participants.length === 2 &&
        conv.participants.includes(participantIds[0]) &&
        conv.participants.includes(currentUser.id)
      );
      if (existingConversation) {
        return existingConversation.id;
      }
    }
    const newConversation: Conversation = {
      id: uuidv4(),
      participants: [...participantIds, currentUser.id],
      isGroup,
      name,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    return newConversation.id;
  }, [currentUser, conversations]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    setMessages(prev => prev.filter(msg => msg.conversationId !== id));
    if (currentConversation?.id === id) {
      setCurrentConversationState(null);
    }
  }, [currentConversation]);

  const sendMessage = useCallback(async (conversationId: string, text: string, senderId: string): Promise<Message> => {
    if (!currentUser) {
      throw new Error('No current user');
    }
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    const sender = currentUser.id;
    let recipientId: string | undefined;
    if (conversation.participants.length === 2) {
      recipientId = conversation.participants.find(id => id !== sender);
    } else {
      recipientId = conversation.participants.find(id => id !== sender);
    }
    console.log('sendMessage debug:', { conversation, sender, recipientId, participants: conversation.participants });
    if (!recipientId) {
      console.error('Recipient not found in conversation:', conversation);
      throw new Error('Recipient not found in conversation');
    }
    const recipient = users.find(u => u.id === recipientId);
    if (!recipient) {
      console.error('Recipient user not found:', recipientId, 'Available users:', users.map(u => u.id));
      throw new Error('Recipient user not found');
    }
    const newMessage: Message = {
      id: uuidv4(),
      conversationId,
      content: text,
      senderId: sender,
      senderName: currentUser.displayName,
      recipientId: recipient.id,
      recipientName: recipient.displayName,
      createdAt: new Date(),
      read: false,
      status: 'sent',
    };
    setMessages(prev => [newMessage, ...prev]);
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: {
                content: newMessage.content,
                timestamp: newMessage.createdAt,
                senderId: newMessage.senderId,
              },
              updatedAt: new Date(),
              unreadCount: sender === currentUser.id ? conv.unreadCount : conv.unreadCount + 1,
            }
          : conv
      )
    );
    return newMessage;
  }, [currentUser, users, conversations]);

  const updateMessage = useCallback(async (id: string, text: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id 
          ? { ...msg, content: text, createdAt: new Date() }
          : msg
      )
    );
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const markAsRead = useCallback(async (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId && !msg.read
          ? { ...msg, read: true, status: 'read' as const }
          : msg
      )
    );
  }, []);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        currentConversation,
        createConversation,
        getConversation,
        setCurrentConversation,
        deleteConversation,
        messages,
        sendMessage,
        updateMessage,
        deleteMessage,
        markAsRead,
        currentUser,
        users,
        getUser,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
