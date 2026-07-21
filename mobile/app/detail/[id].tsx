import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ObjectsAPI } from '@/services/api';

interface Object {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export default function ObjectDetailScreen() {
  const [object, setObject] = useState<Object | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      fetchObject(id);
    }
  }, [id]);

  const fetchObject = async (objectId: string) => {
    try {
      const data = await ObjectsAPI.getOne(objectId);
      setObject(data);
    } catch (error) {
      console.error('Error fetching object:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!object) {
    return (
      <View style={styles.centered}>
        <Text>Object not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: object.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{object.title}</Text>
        <Text style={styles.description}>{object.description}</Text>
        <Text style={styles.date}>
          Created: {new Date(object.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
});