import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, User } from '../types';

interface MessageContextType {
  // Conversations
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createConversation: (participants: string[], isGroup?: boolean, name?: string) => string;
  getConversation: (id: string) => Conversation | undefined;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  
  // Messages
  messages: Message[];
  sendMessage: (conversationId: string, text: string, senderId: string) => Promise<Message>;
  updateMessage: (id: string, text: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  
  // Users
  currentUser: User | null;
  users: User[];
  getUser: (id: string) => User | undefined;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Mock data for demo purposes
const MOCK_USERS: User[] = [
  {
    id: 'user1',
    email: 'john@example.com',
    displayName: 'John Doe',
    photoURL: undefined,
    createdAt: new Date(),
  },
  {
    id: 'user2',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    photoURL: undefined,
    createdAt: new Date(),
  },
  {
    id: 'user3',
    email: 'bob@example.com',
    displayName: 'Bob Johnson',
    photoURL: undefined,
    createdAt: new Date(),
  },
  {
    id: 'user4',
    email: 'alice@example.com',
    displayName: 'Alice Brown',
    photoURL: undefined,
    createdAt: new Date(),
  },
  {
    id: 'user5', email: 'user5@example.com', displayName: 'User Five', photoURL: undefined, createdAt: new Date() },
  { id: 'user6', email: 'user6@example.com', displayName: 'User Six', photoURL: undefined, createdAt: new Date() },
  { id: 'user7', email: 'user7@example.com', displayName: 'User Seven', photoURL: undefined, createdAt: new Date() },
  { id: 'user8', email: 'user8@example.com', displayName: 'User Eight', photoURL: undefined, createdAt: new Date() },
  { id: 'user9', email: 'user9@example.com', displayName: 'User Nine', photoURL: undefined, createdAt: new Date() },
  { id: 'user10', email: 'user10@example.com', displayName: 'User Ten', photoURL: undefined, createdAt: new Date() },
  { id: 'user11', email: 'user11@example.com', displayName: 'User Eleven', photoURL: undefined, createdAt: new Date() },
  { id: 'user12', email: 'user12@example.com', displayName: 'User Twelve', photoURL: undefined, createdAt: new Date() },
  { id: 'user13', email: 'user13@example.com', displayName: 'User Thirteen', photoURL: undefined, createdAt: new Date() },
  { id: 'user14', email: 'user14@example.com', displayName: 'User Fourteen', photoURL: undefined, createdAt: new Date() },
  { id: 'user15', email: 'user15@example.com', displayName: 'User Fifteen', photoURL: undefined, createdAt: new Date() },
  { id: 'user16', email: 'user16@example.com', displayName: 'User Sixteen', photoURL: undefined, createdAt: new Date() },
  { id: 'user17', email: 'user17@example.com', displayName: 'User Seventeen', photoURL: undefined, createdAt: new Date() },
  { id: 'user18', email: 'user18@example.com', displayName: 'User Eighteen', photoURL: undefined, createdAt: new Date() },
  { id: 'user19', email: 'user19@example.com', displayName: 'User Nineteen', photoURL: undefined, createdAt: new Date() },
  { id: 'user20', email: 'user20@example.com', displayName: 'User Twenty', photoURL: undefined, createdAt: new Date() },
  { id: 'user21', email: 'user21@example.com', displayName: 'User Twenty-One', photoURL: undefined, createdAt: new Date() },
  { id: 'user22', email: 'user22@example.com', displayName: 'User Twenty-Two', photoURL: undefined, createdAt: new Date() },
  { id: 'user23', email: 'user23@example.com', displayName: 'User Twenty-Three', photoURL: undefined, createdAt: new Date() },
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

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current user (in a real app, this would be set after login)
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser({
            ...parsedUser,
            createdAt: new Date(parsedUser.createdAt),
          });
        } else {
          // Set a default user for demo
          const defaultUser: User = {
            id: 'currentUser',
            email: 'me@example.com',
            displayName: 'Me',
            photoURL: undefined,
            createdAt: new Date(),
          };
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
          setCurrentUser(defaultUser);
        }

        // Load conversations
        const storedConversations = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        if (storedConversations) {
          const parsedConversations = JSON.parse(storedConversations);
          setConversations(parsedConversations.map((conv: any) => ({
            ...conv,
            updatedAt: new Date(conv.updatedAt),
            lastMessage: conv.lastMessage ? {
              content: conv.lastMessage.content,
              timestamp: new Date(conv.lastMessage.timestamp),
              senderId: conv.lastMessage.senderId,
            } : undefined,
          })));
        } else {
          // Assign users to groups in a round-robin fashion
          const GROUPS = ['Friends', 'Family', 'Work', 'School', 'Home', 'Love', 'Other'];
          const demoConversations: Conversation[] = [];
          for (let i = 1; i <= 23; i++) {
            const group = GROUPS[(i - 1) % GROUPS.length];
            demoConversations.push({
              id: `conv${i}`,
              participants: ['currentUser', `user${i}`],
              lastMessage: {
                content: "Hey, how's it going?",
                timestamp: new Date(Date.now() - i * 3600000),
                senderId: `user${i}`,
              },
              unreadCount: 0,
              isGroup: false,
              updatedAt: new Date(Date.now() - i * 3600000),
              group,
            });
          }
          await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(demoConversations));
          setConversations(demoConversations);
        }

        // Load messages
        const storedMessages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages.map((msg: any) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
          })));
        } else {
          // Create some demo messages
          const demoMessages: Message[] = [
            {
              id: 'msg1',
              conversationId: 'conv1',
              content: 'Hey there!',
              senderId: 'user1',
              senderName: 'John Doe',
              recipientId: 'currentUser',
              recipientName: 'Me',
              createdAt: new Date(Date.now() - 86400000),
              read: true,
              status: 'read',
            },
            {
              id: 'msg2',
              conversationId: 'conv1',
              content: 'Hi! How are you?',
              senderId: 'currentUser',
              senderName: 'Me',
              recipientId: 'user1',
              recipientName: 'John Doe',
              createdAt: new Date(Date.now() - 86350000),
              read: true,
              status: 'read',
            },
            {
              id: 'msg3',
              conversationId: 'conv1',
              content: 'Hey, how are you?',
              senderId: 'user1',
              senderName: 'John Doe',
              recipientId: 'currentUser',
              recipientName: 'Me',
              createdAt: new Date(Date.now() - 3600000),
              read: false,
              status: 'delivered',
            },
          ];
          await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(demoMessages));
          setMessages(demoMessages);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };

    loadData();
  }, []);

  // Save data to storage when it changes
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

  // Get a user by ID
  const getUser = useCallback((id: string): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  // Get a conversation by ID
  const getConversation = useCallback((id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id);
  }, [conversations]);

  // Set the current conversation
  const setCurrentConversation = useCallback((id: string | null) => {
    if (!id) {
      setCurrentConversationState(null);
      return;
    }
    
    const conversation = getConversation(id);
    if (conversation) {
      // Mark all messages in this conversation as read
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.conversationId === id && !msg.read 
            ? { ...msg, read: true, status: 'read' as const }
            : msg
        )
      );
      
      // Update unread count
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

  // Create a new conversation
  const createConversation = useCallback((participantIds: string[], isGroup = false, name?: string): string => {
    if (!currentUser) {
      throw new Error('No current user');
    }
    
    // For 1:1 chats, check if a conversation already exists
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

  // Delete a conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    // Also delete all messages in this conversation
    setMessages(prev => prev.filter(msg => msg.conversationId !== id));
    
    if (currentConversation?.id === id) {
      setCurrentConversationState(null);
    }
  }, [currentConversation]);

  // Send a new message
  const sendMessage = useCallback(async (conversationId: string, text: string, senderId: string): Promise<Message> => {
    if (!currentUser) {
      throw new Error('No current user');
    }
    
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Find the recipient (in a 1:1 chat, it's the other participant)
    const recipientId = conversation.participants.find(id => id !== senderId);
    if (!recipientId) {
      throw new Error('Recipient not found in conversation');
    }
    
    const recipient = users.find(u => u.id === recipientId);
    if (!recipient) {
      throw new Error('Recipient user not found');
    }
    
    const newMessage: Message = {
      id: uuidv4(),
      conversationId,
      content: text,
      senderId,
      senderName: currentUser.displayName,
      recipientId: recipient.id,
      recipientName: recipient.displayName,
      createdAt: new Date(),
      read: false,
      status: 'sent',
    };
    
    setMessages(prev => [newMessage, ...prev]);
    
    // Update conversation's last message
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
              unreadCount: senderId === currentUser.id ? conv.unreadCount : conv.unreadCount + 1,
            }
          : conv
      )
    );
    
    return newMessage;
  }, [currentUser, users, conversations]);

  // Update a message
  const updateMessage = useCallback(async (id: string, text: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id 
          ? { ...msg, content: text, createdAt: new Date() }
          : msg
      )
    );
  }, []);

  // Delete a message
  const deleteMessage = useCallback(async (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Mark a message as read
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
        // Conversations
        conversations,
        currentConversation,
        createConversation,
        getConversation,
        setCurrentConversation,
        deleteConversation,
        
        // Messages
        messages,
        sendMessage,
        updateMessage,
        deleteMessage,
        markAsRead,
        
        // Users
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
