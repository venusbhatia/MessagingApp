import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, User } from '../types';

const STORAGE_KEYS = {
  MESSAGES: '@messages',
  USERS: '@users',
  CURRENT_USER: '@current_user',
};

// Message storage functions
export const saveMessages = async (messages: Message[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages:', error);
  }
};

export const getMessages = async (): Promise<Message[]> => {
  try {
    const messages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    return messages ? JSON.parse(messages) : [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const addMessage = async (message: Message): Promise<void> => {
  try {
    const messages = await getMessages();
    messages.push(message);
    await saveMessages(messages);
  } catch (error) {
    console.error('Error adding message:', error);
  }
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messages = await getMessages();
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    await saveMessages(updatedMessages);
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};

// User storage functions
export const saveUsers = async (users: User[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const addUser = async (user: User): Promise<void> => {
  try {
    const users = await getUsers();
    const existingUserIndex = users.findIndex(u => u.id === user.id);
    
    if (existingUserIndex !== -1) {
      users[existingUserIndex] = user;
    } else {
      users.push(user);
    }
    
    await saveUsers(users);
  } catch (error) {
    console.error('Error adding user:', error);
  }
};

export const updateUser = async (updatedUser: User): Promise<void> => {
  try {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      await saveUsers(users);
      
      // Also update current user if it's the same user
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.id === updatedUser.id) {
        await saveCurrentUser(updatedUser);
      }
    }
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

// Current user storage functions
export const saveCurrentUser = async (user: User | null): Promise<void> => {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Initialize storage with mock data if empty
export const initializeStorage = async (): Promise<void> => {
  try {
    const messages = await getMessages();
    const users = await getUsers();

    if (messages.length === 0) {
      // Initialize with empty messages array
      await saveMessages([]);
    }

    if (users.length === 0) {
      // Initialize with some mock users
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john@example.com',
          displayName: 'John Doe',
          photoURL: null,
        },
        {
          id: '2',
          email: 'jane@example.com',
          displayName: 'Jane Smith',
          photoURL: null,
        },
      ];
      await saveUsers(mockUsers);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}; 