import React, { useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Avatar, Divider, IconButton, useTheme } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList, Conversation } from '../types';
import { useMessages } from '../context/MessageContext';
import { AuthContext } from '../navigation';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type GroupConversationsRouteProp = RouteProp<RootStackParamList, 'GroupConversations'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GroupConversationsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupConversationsRouteProp>();
  const { group } = route.params;
  const { conversations, getUser } = useMessages();
  const { currentUser } = useContext(AuthContext);

  const groupConversations = conversations.filter(conv => {
    const convGroup = (conv.group || 'Other').toLowerCase();
    const screenGroup = (group || 'Other').toLowerCase();
    return convGroup === screenGroup;
  });

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipantId = item.participants.find(id => id !== currentUser?.id);
    const otherUser = otherParticipantId ? getUser(otherParticipantId) : null;
    const displayName = item.isGroup ? (item.name || 'Group Chat') : (otherUser?.displayName || 'Unknown User');
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
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage.content}
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
        <IconButton icon="delete" size={20} onPress={() => {}} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{group} Conversations</Text>
      <FlatList
        data={groupConversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={<Text style={styles.emptyText}>No conversations in this group.</Text>}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Main', { screen: 'NewMessage' })}
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
    paddingTop: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
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
  unreadCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 40,
    fontSize: 16,
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
});

export default GroupConversationsScreen; 