import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSocket } from '@/context/SocketContext';
import { ObjectsAPI } from '@/services/api';

interface Object {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export default function ObjectsListScreen() {
  const [objects, setObjects] = useState<Object[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchObjects();

    if (socket) {
      socket.on('objectCreated', (newObject: Object) => {
        setObjects(prev => [newObject, ...prev]);
      });

      socket.on('objectDeleted', (id: string) => {
        setObjects(prev => prev.filter(obj => obj.id !== id));
      });
    }

    return () => {
      if (socket) {
        socket.off('objectCreated');
        socket.off('objectDeleted');
      }
    };
  }, [socket]);

  const fetchObjects = async () => {
    try {
      const data = await ObjectsAPI.list();
      setObjects(data);
    } catch (error) {
      console.error('Error fetching objects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Object',
      'Are you sure you want to delete this object?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ObjectsAPI.delete(id);
              setObjects(prev => prev.filter(obj => obj.id !== id));
            } catch (error) {
              console.error('Error deleting object:', error);
              Alert.alert('Error', 'Failed to delete object');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Object }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/detail/${item.id}`)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <FlatList
        data={objects}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No objects found. Create one!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  deleteText: {
    color: 'white',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1,
  },
  fabText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});