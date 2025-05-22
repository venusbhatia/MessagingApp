export type User = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  createdAt: Date;
};

export type Message = {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  createdAt: Date;
  read: boolean;
  status?: 'sent' | 'delivered' | 'read';
  conversationId: string;
};

export type Conversation = {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  updatedAt: Date;
  unreadCount: number;
  isGroup?: boolean;
  name?: string;
  createdAt?: Date;
  group?: 'Friends' | 'Family' | 'Work' | 'School' | 'Home' | 'Other';
};

export type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  Chat: {
    recipientId: string;
    recipientName: string;
    conversationId: string;
  };
  NewMessage: undefined;
  Profile: undefined;
  MessageList: undefined;
  MessageDetail: {
    messageId: string;
  };
  EditMessage: {
    messageId: string;
  };
  Home: undefined;
  Messages: undefined;
  GroupConversations: {
    group: 'Friends' | 'Family' | 'Work' | 'School' | 'Home' | 'Other';
  };
};

export type MainTabParamList = {
  Inbox: undefined;
  NewMessage: undefined;
  Profile: undefined;
}; 