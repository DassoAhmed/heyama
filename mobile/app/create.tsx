import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ObjectsAPI } from '@/services/api';

export default function CreateObjectScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    console.log('📷 Opening image picker...');
    
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      console.log('📷 Image picker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('✅ Image selected:', {
          uri: selectedImage.uri,
          fileName: selectedImage.fileName,
          type: selectedImage.type,
        });
        setImage(selectedImage);
      } else {
        console.log('User cancelled image selection');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    console.log('🔄 Submitting form...');
    console.log('Current state:', { title, description, hasImage: !!image });
    
    // Validate fields
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Creating object with image:', image.fileName);
      const result = await ObjectsAPI.create(title, description, image);
      console.log('✅ Object created:', result);
      Alert.alert('Success', 'Object created successfully!');
      router.back();
    } catch (error: any) {
      console.error('❌ Error creating object:', error);
      
      let errorMessage = 'Failed to create object';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Image *</Text>
          <TouchableOpacity 
            style={[styles.imagePicker, image && styles.imagePickerWithImage]} 
            onPress={pickImage} 
            activeOpacity={0.7}
          >
            {image ? (
              <>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageOverlayText}>Tap to change</Text>
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePickerText}>📷 Tap to select an image</Text>
                <Text style={styles.imagePickerSubText}>JPG, PNG, or GIF</Text>
              </View>
            )}
          </TouchableOpacity>

          {image && (
            <View style={styles.imageInfo}>
              <Text style={styles.fileName}>📎 {image.fileName || 'Image selected'}</Text>
              <Text style={styles.fileSize}>
                {image.fileSize ? `${Math.round(image.fileSize / 1024)} KB` : ''}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitText}>Create Object</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  imagePicker: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  imagePickerWithImage: {
    borderColor: '#007aff',
    borderStyle: 'solid',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  imagePickerSubText: {
    color: '#bbb',
    fontSize: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    alignItems: 'center',
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 12,
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  fileName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#007aff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#007aff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});