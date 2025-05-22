import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Text, Avatar, Divider, IconButton, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Message, User, Conversation } from '../types';
import { format } from 'date-fns';
import { AuthContext } from '../navigation';
import { useMessages } from '../context/MessageContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper function to convert timestamp to Date
const toDate = (timestamp: string | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

const GROUPS = ['Friends', 'Family', 'Work', 'School'];

const GROUP_BUBBLES = [
  { key: 'Home', label: 'Home', emoji: '🏠' },
  { key: 'Family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { key: 'Friends', label: 'Friends', emoji: '🧑‍🤝‍🧑' },
  { key: 'School', label: 'School', emoji: '🎒' },
];

const ALLOWED_GROUPS = ['Friends', 'Family', 'Work', 'School', 'Home', 'Other'] as const;
type AllowedGroup = typeof ALLOWED_GROUPS[number];

const InboxScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const { currentUser } = useContext(AuthContext);
  const { conversations, deleteConversation, getUser } = useMessages();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Group conversations by their 'group' field
  const groupedConversations = GROUPS.map(group => ({
    title: group,
    data: conversations.filter(conv => conv.group === group),
  }));
  // Add 'Other' group for conversations without a group
  const otherConversations = conversations.filter(conv => !GROUPS.includes(conv.group || ''));
  if (otherConversations.length > 0) {
    groupedConversations.push({ title: 'Other', data: otherConversations });
  }

  const handleGroupPress = (groupKey: string) => {
    if (ALLOWED_GROUPS.includes(groupKey as AllowedGroup)) {
      navigation.navigate('GroupConversations', { group: groupKey as AllowedGroup });
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipantId = item.participants.find(id => id !== currentUser?.id);
    const otherUser = otherParticipantId ? getUser(otherParticipantId) : null;
    const displayName = item.isGroup
      ? (item.name || 'Group Chat')
      : (otherUser?.displayName || 'Unknown User');

    // For last message sender display
    let lastSenderPrefix = '';
    if (item.lastMessage) {
      if (item.lastMessage.senderId === currentUser?.id) {
        lastSenderPrefix = 'You: ';
      } else {
        const senderUser = getUser(item.lastMessage.senderId);
        lastSenderPrefix = senderUser ? senderUser.displayName + ': ' : '';
      }
    }

    return (
      <TouchableOpacity
        style={styles.messageItem}
        onPress={() => navigation.navigate('Chat', {
          recipientId: otherParticipantId || '',
          recipientName: displayName,
          conversationId: item.id
        })}
      >
        <Avatar.Text size={40} label={displayName.substring(0, 2).toUpperCase()} />
        <View style={styles.messageContent}>
          <Text style={styles.name}>{displayName}</Text>
          {item.lastMessage && (
            <>
              <Text
                style={[
                  styles.lastMessage,
                  item.lastMessage.senderId === currentUser?.id && { color: theme.colors.primary },
                  item.unreadCount > 0 && item.lastMessage.senderId !== currentUser?.id && { fontWeight: 'bold' }
                ]}
                numberOfLines={1}
              >
                {lastSenderPrefix}{item.lastMessage.content}
              </Text>
              <Text style={styles.timestamp}>
                {format(item.lastMessage.timestamp, 'MMM d, HH:mm')}
                {item.unreadCount > 0 && (
                  <Text style={styles.unreadCount}> • {item.unreadCount} unread</Text>
                )}
              </Text>
            </>
          )}
        </View>
        <IconButton
          icon="delete"
          size={20}
          onPress={() => handleDeleteConversation(item.id)}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Group Bubbles Grid */}
      <View style={styles.groupGrid}>
        {GROUP_BUBBLES.map(group => (
          <TouchableOpacity
            key={group.key}
            style={styles.groupBubble}
            onPress={() => handleGroupPress(group.key)}
          >
            <Text style={styles.groupEmoji}>{group.emoji}</Text>
            <Text style={styles.groupLabel}>{group.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* End Group Bubbles Grid */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <TouchableOpacity
              style={styles.newMessageButton}
              onPress={() => navigation.navigate('NewMessage')}
            >
              <Text style={styles.newMessageButtonText}>Start a conversation</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewMessage')}
      >
        <View style={{ backgroundColor: '#007AFF', borderRadius: 28, width: 56, height: 56, justifyContent: 'center', alignItems: 'center' }}>
          <IconButton icon="plus" size={24} iconColor="#fff" style={{ margin: 0 }} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

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
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  newMessageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newMessageButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  unreadCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyGroupContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyGroupText: {
    color: '#aaa',
    fontStyle: 'italic',
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 8,
  },
  groupBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default InboxScreen; 