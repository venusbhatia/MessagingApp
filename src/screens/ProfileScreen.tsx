import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Avatar,
  Button,
  TextInput,
  IconButton,
  useTheme,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../navigation';
import { updateUser } from '../services/storage';
import { User } from '../types';

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { currentUser, logout } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    if (!user || !displayName.trim()) return;

    setLoading(true);
    try {
      const updatedUser: User = {
        ...user,
        displayName: displayName.trim(),
      };
      await updateUser(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        // In a real app, you would upload the image to a storage service
        // and get back a URL. For demo purposes, we'll just use the local URI
        const updatedUser: User = {
          ...user!,
          photoURL: result.assets[0].uri,
        };
        await updateUser(updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickImage}>
          {user.photoURL ? (
            <Avatar.Image
              size={120}
              source={{ uri: user.photoURL }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={120}
              label={user.displayName.substring(0, 2).toUpperCase()}
              style={styles.avatar}
            />
          )}
          <View style={styles.editIconContainer}>
            <IconButton
              icon="camera"
              size={20}
              style={styles.editIcon}
              iconColor="#fff"
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.input}
            />
            <View style={styles.editButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsEditing(false);
                  setDisplayName(user.displayName);
                }}
                style={styles.editButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateProfile}
                loading={loading}
                disabled={loading || !displayName.trim()}
                style={styles.editButton}
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{user.displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Button
              mode="outlined"
              onPress={() => setIsEditing(true)}
              style={styles.editProfileButton}
            >
              Edit Profile
            </Button>
          </View>
        )}

        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
          textColor={theme.colors.error}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    backgroundColor: '#e1e1e1',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 4,
  },
  editIcon: {
    margin: 0,
  },
  content: {
    padding: 20,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  editContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  editProfileButton: {
    marginTop: 8,
  },
  signOutButton: {
    marginTop: 32,
    borderColor: '#ff3b30',
  },
});

export default ProfileScreen; 