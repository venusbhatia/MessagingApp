import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  TextInput,
  Text,
  Avatar,
  Divider,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, User } from '../types';
import { AuthContext } from '../navigation';
import { useMessages } from '../context/MessageContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NewMessageScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const { currentUser } = useContext(AuthContext);
  const { createConversation, users } = useMessages();

  useEffect(() => {
    // Filter out current user from the list
    const otherUsers = users.filter(user => user.id !== currentUser?.id);
    setFilteredUsers(otherUsers);
    setLoading(false);
  }, [users, currentUser]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Filter out current user from the list
      const otherUsers = users.filter(user => user.id !== currentUser?.id);
      setFilteredUsers(otherUsers);
    } else {
      const filtered = users.filter(user =>
        user.id !== currentUser?.id && (
          user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users, currentUser]);

  const handleUserSelect = (user: User) => {
    // Create or get existing conversation
    const conversationId = createConversation([user.id]);
    
    // Navigate to chat with the conversation
    navigation.navigate('Chat', {
      recipientId: user.id,
      recipientName: user.displayName,
      conversationId: conversationId
    });
  };

  const renderUser = ({ item: user }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(user)}
    >
      {user.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      ) : (
        <Avatar.Text
          size={40}
          label={user.displayName.substring(0, 2).toUpperCase()}
        />
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.displayName}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? 'Loading users...' : 'No users found'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Searchbar
        placeholder="Search users"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={EmptyComponent}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
    textAlign: 'center',
  },
});

export default NewMessageScreen;
