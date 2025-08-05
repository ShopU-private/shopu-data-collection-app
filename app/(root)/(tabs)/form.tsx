import useDebounced from '@/utils/debounce'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

type Company = {
  _id: string,
  name: string
}

const Form = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchValue = useDebounced(searchTerm, 500);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/(auth)/login')
      }

      const response = await axios.get('https://shopu-data-collection.vercel.app/api/companyName/get');
      if (response && response.data.success && response.data.companyNameDetails) {
        setCompanies(response.data.companyNameDetails);
      }
    }

    fetchData()
  }, [router])

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(debouncedSearchValue.toLowerCase())
  )

  const handleSearchTerm = (text: string) => {
    setSearchTerm(text);
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F6FAFA' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='w-[95%] m-auto flex justify-center py-8'>
          <View className='bg-white rounded-2xl shadow-lg px-6 py-8'>
            <View className='mb-6'>
              <Text className='text-primary font-semibold text-lg mb-2'>Company name</Text>
              <TextInput
                placeholder='Search companies name'
                value={searchTerm}
                onChangeText={handleSearchTerm}
                className='border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-base'
                placeholderTextColor="#A0A0A0"
              />
              {searchTerm && (
                <View className='bg-white rounded-lg shadow p-2 mt-2 max-h-48'>
                  {filteredCompanies.length > 0 ? (filteredCompanies.slice(0, 50).map((company) => (
                    <TouchableOpacity key={company._id} className='py-2 px-2 rounded hover:bg-gray-100'>
                      <Text className='text-gray-700'>{company.name}</Text>
                    </TouchableOpacity>
                  ))) : (
                    <View>
                      <Text className='text-gray-400'>No company found</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <View className='mb-6'>
              <Text className='text-primary font-semibold text-lg mb-2'>Shop Name</Text>
              <TextInput placeholder='Enter shop name' className='border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-base' placeholderTextColor="#A0A0A0" />
            </View>
            <View className='mb-6'>
              <Text className='text-primary font-semibold text-lg mb-2'>Address Line 1</Text>
              <TextInput placeholder='Enter address line 1' className='border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-base' placeholderTextColor="#A0A0A0" />
            </View>
            <View className='mb-6'>
              <Text className='text-primary font-semibold text-lg mb-2'>Address Line 2</Text>
              <TextInput placeholder='Enter address line 2' className='border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-base' placeholderTextColor="#A0A0A0" />
            </View>
            <View className='mb-6'>
              <Text className='text-primary font-semibold text-lg mb-2'>State</Text>
              <TextInput placeholder='Enter state' className='border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-base' placeholderTextColor="#A0A0A0" />
            </View>
            <View className='mb-6'>
              <Text className='text-primary font-semibold text-lg mb-2'>City</Text>
              <TextInput placeholder='Enter city' className='border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-base' placeholderTextColor="#A0A0A0" />
            </View>
            <View className='mb-6'>
              <Text className='text-primary font-semibold text-lg mb-2'>Pincode</Text>
              <TextInput placeholder='Enter pincode' className='border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-base' placeholderTextColor="#A0A0A0" />
            </View>
            <View className='mb-6'>
              <Text className='text-primary font-semibold text-lg mb-2'>Phone</Text>
              <TextInput placeholder='Enter phone' className='border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-base' placeholderTextColor="#A0A0A0" />
            </View>
            <View className='bg-primary mt-2 p-4 rounded-xl shadow-md'>
              <TouchableOpacity>
                <Text className='text-white text-center font-semibold text-lg tracking-wide'>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Form