import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

const Add = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const validateForm = () => {
    if (!companyName.trim()) {
      Alert.alert('Validation Error', 'Please enter a company name.');
      return false;
    }

    if (companyName.trim().length < 2) {
      Alert.alert('Validation Error', 'Company name must be at least 2 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const payload = {
        name: companyName.trim()
      };

      const response = await axios.post('https://shopu-data-collection.vercel.app/api/companyName/create', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Company name added successfully!'
        });
        
        // Clear the form
        setCompanyName('');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add company name';
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage
      });
      
      console.error('Error adding company name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = useCallback((value: string) => {
    setCompanyName(value);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Add Company Name
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Add a new company name that can be selected when creating companies
            </Text>
          </View>

          {/* Form Card */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            marginBottom: 24
          }}>
            {/* Company Name Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: '#1F2937', 
                marginBottom: 8 
              }}>
                Company Name *
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937'
                }}
                placeholder="Enter company name"
                value={companyName}
                onChangeText={handleFormChange}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                editable={!loading}
              />
              <Text style={{ 
                fontSize: 12, 
                color: '#6B7280', 
                marginTop: 4 
              }}>
                This name will be available for selection when creating new companies
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !companyName.trim()}
              style={{
                backgroundColor: loading || !companyName.trim() ? '#9CA3AF' : '#337D81',
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={{ 
                    color: 'white', 
                    fontSize: 16, 
                    fontWeight: '600', 
                    marginLeft: 8 
                  }}>
                    Adding...
                  </Text>
                </View>
              ) : (
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  fontWeight: '600' 
                }}>
                  Add Company Name
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={{
            backgroundColor: '#EFF6FF',
            borderRadius: 12,
            padding: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#3B82F6'
          }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600', 
              color: '#1E40AF', 
              marginBottom: 8 
            }}>
              💡 How it works
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#1E40AF',
              lineHeight: 20
            }}>
              After adding a company name here, it will be available in the dropdown list when creating new companies in the Form tab. This helps maintain consistency and makes it easier to select from existing company names.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Add;