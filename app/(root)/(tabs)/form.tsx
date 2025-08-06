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
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [showDropDown, setShowDropDown] = useState(false);

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
    setShowDropDown(true)
  }

  const handleCompanySelect = (company: Company) => {
    if (!selectedCompanies.find((selected) => selected._id === company._id)) {
      setSelectedCompanies([...selectedCompanies, company])
    }
    setSearchTerm('');
    setShowDropDown(false)
  };

  const removeSelectedCompanies = (companyId: string) => {
    setSelectedCompanies(selectedCompanies.filter((company) => company._id !== companyId))
  }


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View>
          <View>
            <View>
              <Text>Company name</Text>
              {selectedCompanies.map((company) => (
                <View key={company._id}>
                  <Text>{company.name}</Text>
                  <TouchableOpacity onPress={() => removeSelectedCompanies(company._id)}>
                    <Text>x</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TextInput
                placeholder='Search companies name'
                value={searchTerm}
                onChangeText={handleSearchTerm}
                onFocus={() => setShowDropDown(true)}
                placeholderTextColor="#A0A0A0"
              />
              {showDropDown && searchTerm && (
                <View>
                  {filteredCompanies.length > 0 ? (filteredCompanies.slice(0, 50).map((company) => (
                    <TouchableOpacity key={company._id} onPress={() => handleCompanySelect(company)}>
                      <Text>
                        {company.name}
                        {selectedCompanies.find((select) => select._id === company._id) && (
                          <View>
                            <Text>(selected)</Text>
                          </View>
                        )}
                      </Text>
                    </TouchableOpacity>
                  ))) : (
                    <View>
                      <Text>No company found</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <View>
              <Text>Shop Name</Text>
              <TextInput placeholder='Enter shop name' placeholderTextColor="#A0A0A0" />
            </View>
            <View>
              <Text>Address Line 1</Text>
              <TextInput placeholder='Enter address line 1' placeholderTextColor="#A0A0A0" />
            </View>
            <View>
              <Text>Address Line 2</Text>
              <TextInput placeholder='Enter address line 2' placeholderTextColor="#A0A0A0" />
            </View>
            <View>
              <Text>State</Text>
              <TextInput placeholder='Enter state' placeholderTextColor="#A0A0A0" />
            </View>
            <View>
              <Text>City</Text>
              <TextInput placeholder='Enter city' placeholderTextColor="#A0A0A0" />
            </View>
            <View>
              <Text>Pincode</Text>
              <TextInput placeholder='Enter pincode' placeholderTextColor="#A0A0A0" />
            </View>
            <View>
              <Text>Phone</Text>
              <TextInput placeholder='Enter phone' placeholderTextColor="#A0A0A0" />
            </View>
            <View>
              <TouchableOpacity>
                <Text>Submit</Text>
              </TouchableOpacity>
            </View>
            {selectedCompanies.length > 0 && (
              <View>
                <View>
                  <Text>Selected companies{(selectedCompanies.length)}</Text>
                </View>
                <View>
                  {selectedCompanies.map((company) => (
                    <Text key={company._id}>{company.name}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Form