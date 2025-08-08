import useDebounced from '@/utils/debounce'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Toast from 'react-native-toast-message'

type Company = {
  _id: string,
  name: string
}

const Form = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchValue = useDebounced(searchTerm, 500);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blurTimeoutId, setBlurTimeoutId] = useState<number | null>(null);
  const [form, setForm] = useState({
    shopName: '',
    addressLine1: '',
    addressLine2: '',
    state: '',
    city: '',
    pincode: '',
    phone: ''
  })

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('https://shopu-data-collection.vercel.app/api/companyName/get');
      if (response && response.data.success && response.data.companyNameDetails) {
        setCompanies(response.data.companyNameDetails);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/(auth)/login')
      }

      await fetchCompanies();
    }

    fetchData()

    // Cleanup timeout on unmount
    return () => {
      if (blurTimeoutId) {
        clearTimeout(blurTimeoutId);
      }
    }
  }, [router, blurTimeoutId])

  const handleFormChange = useCallback((field: string) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const validateForm = () => {
    const requiredFields = ['shopName', 'addressLine1', 'state', 'city', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(field => !form[field as keyof typeof form].trim());

    if (missingFields.length > 0) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return false;
    }

    if (selectedCompanies.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one company.');
      return false;
    }

    return true;
  }

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true)

      const payload = {
        shopName: form.shopName,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        phone: form.phone,
        companyName: selectedCompanies.map((company) => company._id)
      }

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/(auth)/login')
        return;
      }

      const response = await axios.post('https://shopu-data-collection.vercel.app/api/company/create', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Company created successfully'
        })
        setForm({
          shopName: '',
          addressLine1: '',
          addressLine2: '',
          state: '',
          city: '',
          pincode: '',
          phone: ''
        })
        setSelectedCompanies([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(debouncedSearchValue.toLowerCase())
  )

  const handleSearchTerm = useCallback((text: string) => {
    setSearchTerm(text)
    setShowDropDown(true)
  }, [])

  const handleTextInputBlur = useCallback(() => {
    const timeoutId = setTimeout(() => setShowDropDown(false), 200);
    setBlurTimeoutId(timeoutId);
  }, []);

  const handleTextInputFocus = useCallback(async () => {
    // Clear any pending blur timeout
    if (blurTimeoutId) {
      clearTimeout(blurTimeoutId);
      setBlurTimeoutId(null);
    }
    setShowDropDown(true);
    await fetchCompanies();
  }, [blurTimeoutId]);

  const handleCompanySelect = (company: Company) => {
    if (!selectedCompanies.find((selected) => selected._id === company._id)) {
      setSelectedCompanies([...selectedCompanies, company])
    }
    setSearchTerm('');
    setShowDropDown(false)
  };

  const removeSelectedCompany = (companyId: string) => {
    setSelectedCompanies(selectedCompanies.filter((company) => company._id !== companyId))
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <View className="px-6 pt-6">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Create Company</Text>
            <Text className="text-gray-600">Fill in the details to register a new company</Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Company Selection</Text>

            {selectedCompanies.length > 0 && (
              <View className="mb-4">
                <View className="flex-row flex-wrap gap-2">
                  {selectedCompanies.map((company) => (
                    <View key={company._id} className="flex-row items-center bg-blue-100 px-3 py-2 rounded-full">
                      <Text className="text-blue-800 font-medium mr-2">{company.name}</Text>
                      <TouchableOpacity
                        onPress={() => removeSelectedCompany(company._id)}
                        className="bg-blue-200 rounded-full w-5 h-5 items-center justify-center"
                      >
                        <Text className="text-blue-800 font-bold text-xs">×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <Text className="text-sm text-gray-600 mt-2">
                  {selectedCompanies.length} company{selectedCompanies.length !== 1 ? 'ies' : ''} selected
                </Text>
              </View>
            )}

            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500"
                placeholder="Search and select companies..."
                value={searchTerm}
                onChangeText={handleSearchTerm}
                onFocus={handleTextInputFocus}
                onBlur={handleTextInputBlur}
              />

              {showDropDown && searchTerm && (
                <View className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg mt-1 max-h-48 shadow-lg">
                  <ScrollView keyboardShouldPersistTaps="handled" className="max-h-48" nestedScrollEnabled>
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.slice(0, 50).map((company) => (
                        <TouchableOpacity
                          key={company._id}
                          onPress={() => handleCompanySelect(company)}
                          className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-900 flex-1">{company.name}</Text>
                            {selectedCompanies.find((select) => select._id === company._id) && (
                              <View className="bg-green-100 px-2 py-1 rounded">
                                <Text className="text-green-800 text-xs font-medium">Selected</Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View className="px-4 py-8 items-center">
                        <Text className="text-gray-500">No companies found</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <View className="space-y-6">
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-2">Shop Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500"
                placeholder="Enter shop name"
                value={form.shopName}
                onChangeText={handleFormChange('shopName')}
              />
            </View>

            <View>
              <Text className="text-lg font-semibold text-gray-900 mb-4">Address Information</Text>

              <View className="space-y-4">
                <View>
                  <Text className="text-base font-medium text-gray-700 mb-2">Address Line 1</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500"
                    placeholder="Enter address line 1"
                    value={form.addressLine1}
                    onChangeText={handleFormChange('addressLine1')}
                  />
                </View>

                <View>
                  <Text className="text-base font-medium text-gray-700 mb-2">Address Line 2</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500"
                    placeholder="Enter address line 2 (optional)"
                    value={form.addressLine2}
                    onChangeText={handleFormChange('addressLine2')}
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-700 mb-2">State</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500"
                      placeholder="Enter state"
                      value={form.state}
                      onChangeText={handleFormChange('state')}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-700 mb-2">City</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500"
                      placeholder="Enter city"
                      value={form.city}
                      onChangeText={handleFormChange('city')}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View>
              <Text className="text-lg font-semibold text-gray-900 mb-4">Contact Information</Text>

              <View className="space-y-4">
                <View>
                  <Text className="text-base font-medium text-gray-700 mb-2">Pincode</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500"
                    placeholder="Enter pincode"
                    keyboardType="number-pad"
                    value={form.pincode}
                    onChangeText={handleFormChange('pincode')}
                    maxLength={6}
                  />
                </View>

                <View>
                  <Text className="text-base font-medium text-gray-700 mb-2">Phone Number</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500"
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    value={form.phone}
                    onChangeText={handleFormChange('phone')}
                    maxLength={10}
                  />
                </View>
              </View>
            </View>
          </View>

          <View className="mt-8 mb-4">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.9}
              className={`rounded-lg py-4 px-6 items-center justify-center ${loading ? 'bg-gray-400' : 'bg-[#337D81]'}`}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold ml-2">Submitting...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">Create Company</Text>
              )}
            </TouchableOpacity>
          </View>
          {selectedCompanies.length > 0 && (
            <View className="bg-blue-50 rounded-lg p-4 mt-4">
              <Text className="text-blue-900 font-semibold mb-2">
                Selected Companies ({selectedCompanies.length})
              </Text>
              <View className="space-y-1">
                {selectedCompanies.map((company, index) => (
                  <Text key={company._id} className="text-blue-800">
                    {index + 1}. {company.name}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Form