import axios from 'axios';
import { API_URL } from '@env';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

console.log('API_URL:', API_URL);
console.log('Platform:', Platform.OS);

const api = axios.create({
  baseURL: API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('📤 Making request to:', config.url);
    console.log('📤 Method:', config.method);
    
    if (config.data instanceof FormData) {
      console.log('📤 FormData being sent');
      // @ts-ignore
      if (config.data._parts) {
        // @ts-ignore
        for (let pair of config.data._parts) {
          const value = pair[1];
          if (value && typeof value === 'object') {
            console.log('  -', pair[0], ':', value.uri || value.name || value);
          } else {
            console.log('  -', pair[0], ':', value);
          }
        }
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.code === 'ECONNABORTED') {
      console.error('⚠️ Request timeout - check if server is running');
    }
    if (!error.response) {
      console.error('⚠️ Network error - check if API URL is correct:', API_URL);
      console.error('   Make sure the API server is running on the correct port');
    }
    return Promise.reject(error);
  }
);

export const ObjectsAPI = {
  create: async (title: string, description: string, image: ImagePicker.ImagePickerAsset) => {
    console.log('🔄 Creating object...');
    console.log('📝 Title:', title);
    console.log('📝 Description:', description);
    console.log('📷 Image URI:', image?.uri);
    console.log('📷 Image fileName:', image?.fileName);
    console.log('📷 Image type:', image?.type);
    console.log('📱 Platform:', Platform.OS);
    
    // Validate inputs
    if (!title || !title.trim()) {
      throw new Error('Title is required');
    }
    if (!description || !description.trim()) {
      throw new Error('Description is required');
    }
    if (!image || !image.uri) {
      throw new Error('Image is required');
    }
    
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      
      // Handle image based on platform
      let fileObject;
      
      if (Platform.OS === 'web') {
        // For Web: Convert blob URL to actual file
        console.log('🌐 Web platform detected - fetching blob...');
        
        try {
          // Fetch the blob from the blob URL
          const response = await fetch(image.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.status}`);
          }
          const blob = await response.blob();
          
          // Get file extension from fileName or blob type
          const fileExtension = image.fileName?.split('.').pop() || 
                               blob.type?.split('/').pop() || 'jpg';
          const fileName = image.fileName || `photo_${Date.now()}.${fileExtension}`;
          const fileType = blob.type || image.type || 'image/jpeg';
          
          // Create File object for web
          fileObject = new File([blob], fileName, { type: fileType });
          console.log('📷 Web File object created:', {
            name: fileObject.name,
            type: fileObject.type,
            size: fileObject.size,
          });
        } catch (fetchError) {
          console.error('❌ Failed to fetch blob:', fetchError);
          throw new Error(`Failed to process image for web: ${fetchError.message}`);
        }
      } else {
        // For Native (iOS/Android): Use the URI directly
        const fileType = image.type || 'image/jpeg';
        const fileName = image.fileName || `photo_${Date.now()}.jpg`;
        
        // @ts-ignore - React Native FormData expects this format
        fileObject = {
          uri: image.uri,
          type: fileType,
          name: fileName,
        };
        console.log('📷 Native file object created:', fileObject);
      }
      
      // Append the file to FormData
      // @ts-ignore
      formData.append('image', fileObject);
      
      console.log('📤 FormData created with file');
      console.log('📤 Sending to:', `${api.defaults.baseURL}/objects`);
      
      const response = await api.post('/objects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 60000, // Increase timeout for uploads
      });
      
      console.log('✅ Object created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error in create API call:', error);
      // Re-throw with more context
      if (error.response) {
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error('Network error - Could not reach the server. Make sure the API is running.');
      } else {
        throw error;
      }
    }
  },

  list: async () => {
    console.log('🔄 Fetching objects...');
    try {
      const response = await api.get('/objects');
      console.log('✅ Objects fetched:', response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error('❌ Error in list API call:', error);
      throw error;
    }
  },

  getOne: async (id: string) => {
    console.log('🔄 Fetching object:', id);
    try {
      const response = await api.get(`/objects/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error in getOne API call:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    console.log('🔄 Deleting object:', id);
    try {
      const response = await api.delete(`/objects/${id}`);
      console.log('✅ Object deleted:', id);
      return response.data;
    } catch (error) {
      console.error('❌ Error in delete API call:', error);
      throw error;
    }
  },
};

export default api;