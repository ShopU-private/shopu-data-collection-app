import useDebounced from '@/utils/debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

type CompanyDetails = {
  _id?: string;
  shopName?: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  city?: string;
  pincode?: number;
  phone?: number;
  companyName: { _id: string; name: string }[];
};

type Company = {
  _id: string;
  name: string;
};

const Details = () => {
  const [companyData, setCompanyData] = useState<CompanyDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchValue = useDebounced(searchTerm, 500);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [currentCompanyData, setCurrentCompanyData] = useState<CompanyDetails | null>(null);
  const [updateForm, setUpdateForm] = useState({
    shopName: '',
    addressLine1: '',
    addressLine2: '',
    state: '',
    city: '',
    pincode: '',
    phone: ''
  });
  // Main search functionality
  const [mainSearchTerm, setMainSearchTerm] = useState('');
  const debouncedMainSearch = useDebounced(mainSearchTerm, 300);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }
      const response = await axios.get('https://shopu-data-collection.vercel.app/api/company/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.companyDetails) {
        setCompanyData(response.data.companyDetails);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Company details fetched successfully',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchCompanies = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }

    try {
      const response = await axios.get('https://shopu-data-collection.vercel.app/api/companyName/get');
      if (response && response.data.success && response.data.companyNameDetails) {
        setCompanies(response.data.companyNameDetails);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        if (isActive) {
          await Promise.all([fetchData(), fetchCompanies()]);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [fetchData, fetchCompanies])
  );

  const handleDelete = async () => {
    if (!selectedCompanyId) return;

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }

    try {
      const response = await axios.delete(
        `https://shopu-data-collection.vercel.app/api/company/delete/${selectedCompanyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.message) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message,
        });
        fetchData();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to delete company',
      });
    } finally {
      setShowModal(false);
      setSelectedCompanyId(null);
    }
  };

  const handleUpdateFormChange = useCallback((field: string) => (value: string) => {
    setUpdateForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleUpdate = async (company: CompanyDetails) => {
    setCurrentCompanyData(company);
    setUpdateForm({
      shopName: company.shopName || '',
      addressLine1: company.addressLine1 || '',
      addressLine2: company.addressLine2 || '',
      state: company.state || '',
      city: company.city || '',
      pincode: company.pincode?.toString() || '',
      phone: company.phone?.toString() || ''
    });
    setSelectedCompanies(company.companyName || []);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async () => {
    if (!currentCompanyData?._id) return;

    const requiredFields = ['shopName', 'addressLine1', 'state', 'city', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(field => !updateForm[field as keyof typeof updateForm].trim());

    if (missingFields.length > 0) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    if (selectedCompanies.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one company.');
      return;
    }

    try {
      setUpdateLoading(true);

      const payload = {
        shopName: updateForm.shopName,
        addressLine1: updateForm.addressLine1,
        addressLine2: updateForm.addressLine2,
        state: updateForm.state,
        city: updateForm.city,
        pincode: updateForm.pincode,
        phone: updateForm.phone,
        companyName: selectedCompanies.map((company) => company._id)
      };

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await axios.put(
        `https://shopu-data-collection.vercel.app/api/company/update/${currentCompanyData._id}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Company updated successfully'
        });
        setShowUpdateModal(false);
        setCurrentCompanyData(null);
        fetchData();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to update company'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(debouncedSearchValue.toLowerCase())
  );

  const handleSearchTerm = useCallback((text: string) => {
    setSearchTerm(text);
    setShowDropDown(true);
  }, []);

  const handleCompanySelect = (company: Company) => {
    if (!selectedCompanies.find((selected) => selected._id === company._id)) {
      setSelectedCompanies([...selectedCompanies, company]);
    }
    setSearchTerm('');
    setShowDropDown(false);
  };

  const removeSelectedCompany = (companyId: string) => {
    setSelectedCompanies(selectedCompanies.filter((company) => company._id !== companyId));
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setCurrentCompanyData(null);
    setSelectedCompanies([]);
    setSearchTerm('');
    setUpdateForm({
      shopName: '',
      addressLine1: '',
      addressLine2: '',
      state: '',
      city: '',
      pincode: '',
      phone: ''
    });
  };

  const filteredCompanyData = companyData.filter((company) => {
    if (!debouncedMainSearch.trim()) return true;

    const searchLower = debouncedMainSearch.toLowerCase();
    const shopNameMatch = company.shopName?.toLowerCase().includes(searchLower);
    const companyNamesMatch = company.companyName.some(comp =>
      comp.name.toLowerCase().includes(searchLower)
    );
    const addressMatch = company.addressLine1?.toLowerCase().includes(searchLower) ||
      company.addressLine2?.toLowerCase().includes(searchLower);
    const locationMatch = company.city?.toLowerCase().includes(searchLower) ||
      company.state?.toLowerCase().includes(searchLower);

    return shopNameMatch || companyNamesMatch || addressMatch || locationMatch;
  });

  const HighlightText = ({ text, searchTerm, style }: {
    text: string;
    searchTerm: string;
    style?: any;
  }) => {
    if (!searchTerm.trim() || !text) {
      return <Text style={style}>{text || 'N/A'}</Text>;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <Text style={style}>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <Text key={index} style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  const openModal = (id: string) => {
    setSelectedCompanyId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompanyId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>
          Company Details
        </Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: 'white',
              fontSize: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
            placeholder="Search companies by name, shop name, or location..."
            value={mainSearchTerm}
            onChangeText={setMainSearchTerm}
            clearButtonMode="while-editing"
          />
          {mainSearchTerm.length > 0 && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 12,
                top: 12,
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setMainSearchTerm('')}
            >
              <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        {debouncedMainSearch.length > 0 && (
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
            {filteredCompanyData.length} of {companyData.length} companies found
          </Text>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#337D81" />
          <Text style={{ marginTop: 10, color: '#6B7280', fontSize: 16 }}>Loading company details...</Text>
        </View>
      ) : filteredCompanyData.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredCompanyData.map((item, index) => (
            <View
              key={item._id || index}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <HighlightText
                text={item.shopName || 'N/A'}
                searchTerm={debouncedMainSearch}
                style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}
              />
              <View style={{ marginBottom: 4 }}>
                <Text style={{ color: '#6B7280' }}>
                  Address: <HighlightText
                    text={`${item.addressLine1 || 'N/A'}, ${item.addressLine2 || ''}`.replace(', ,', ',')}
                    searchTerm={debouncedMainSearch}
                    style={{ color: '#6B7280' }}
                  />
                </Text>
              </View>
              <View style={{ marginBottom: 4 }}>
                <Text style={{ color: '#6B7280' }}>
                  Location: <HighlightText
                    text={`${item.city || 'N/A'}, ${item.state || 'N/A'}`}
                    searchTerm={debouncedMainSearch}
                    style={{ color: '#6B7280' }}
                  />
                </Text>
              </View>
              <Text style={{ color: '#6B7280', marginBottom: 4 }}>Pincode: {item.pincode || 'N/A'}</Text>
              <Text style={{ color: '#6B7280', marginBottom: 4 }}>Phone: {item.phone || 'N/A'}</Text>
              <View style={{ marginBottom: 4 }}>
                <Text style={{ color: '#6B7280' }}>
                  Companies: <HighlightText
                    text={item.companyName.map((company) => company.name).join(', ') || 'N/A'}
                    searchTerm={debouncedMainSearch}
                    style={{ color: '#6B7280' }}
                  />
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#337D81',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    flex: 1,
                    marginRight: 8,
                  }}
                  onPress={() => handleUpdate(item)}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                    Update
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#EF4444',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    flex: 1,
                    marginLeft: 8,
                  }}
                  onPress={() => openModal(item._id!)}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 }}>
            {debouncedMainSearch.length > 0 ? 'No Matching Companies Found' : 'No Company Details Found'}
          </Text>
          <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>
            {debouncedMainSearch.length > 0
              ? `No companies match "${debouncedMainSearch}". Try a different search term.`
              : 'Please add some companies or try refreshing the page.'}
          </Text>
          {debouncedMainSearch.length > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: '#337D81',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 6,
                marginTop: 12,
              }}
              onPress={() => setMainSearchTerm('')}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>Clear Search</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 8,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
              Confirm Deletion
            </Text>
            <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
              Are you sure you want to delete this company? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#6B7280',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: 8,
                }}
                onPress={closeModal}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#EF4444',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  flex: 1,
                  marginLeft: 8,
                }}
                onPress={handleDelete}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showUpdateModal}
        transparent
        animationType="slide"
        onRequestClose={closeUpdateModal}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              width: '95%',
              maxHeight: '90%',
              padding: 0,
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
                  Update Company
                </Text>
                <TouchableOpacity onPress={closeUpdateModal}>
                  <Text style={{ fontSize: 24, color: '#6B7280' }}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                  Company Selection
                </Text>

                {selectedCompanies.length > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {selectedCompanies.map((company) => (
                        <View key={company._id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                          <Text style={{ color: '#1E40AF', fontWeight: '500', marginRight: 8 }}>{company.name}</Text>
                          <TouchableOpacity
                            onPress={() => removeSelectedCompany(company._id)}
                            style={{ backgroundColor: '#BFDBFE', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text style={{ color: '#1E40AF', fontWeight: 'bold', fontSize: 12 }}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white' }}
                    placeholder="Search and select companies..."
                    value={searchTerm}
                    onChangeText={handleSearchTerm}
                    onFocus={() => setShowDropDown(true)}
                    onBlur={() => setTimeout(() => setShowDropDown(false), 200)}
                  />

                  {showDropDown && searchTerm && (
                    <View style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, marginTop: 4, maxHeight: 192, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                      <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 192 }} nestedScrollEnabled>
                        {filteredCompanies.length > 0 ? (
                          filteredCompanies.slice(0, 50).map((company) => (
                            <TouchableOpacity
                              key={company._id}
                              onPress={() => handleCompanySelect(company)}
                              style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#1F2937', flex: 1 }}>{company.name}</Text>
                                {selectedCompanies.find((select) => select._id === company._id) && (
                                  <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                                    <Text style={{ color: '#065F46', fontSize: 12, fontWeight: '500' }}>Selected</Text>
                                  </View>
                                )}
                              </View>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={{ paddingHorizontal: 16, paddingVertical: 32, alignItems: 'center' }}>
                            <Text style={{ color: '#6B7280' }}>No companies found</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Form Fields */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
                  Shop Name
                </Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white' }}
                  placeholder="Enter shop name"
                  value={updateForm.shopName}
                  onChangeText={handleUpdateFormChange('shopName')}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
                  Address Line 1
                </Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white' }}
                  placeholder="Enter address line 1"
                  value={updateForm.addressLine1}
                  onChangeText={handleUpdateFormChange('addressLine1')}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
                  Address Line 2
                </Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white' }}
                  placeholder="Enter address line 2 (optional)"
                  value={updateForm.addressLine2}
                  onChangeText={handleUpdateFormChange('addressLine2')}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
                    State
                  </Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white' }}
                    placeholder="Enter state"
                    value={updateForm.state}
                    onChangeText={handleUpdateFormChange('state')}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
                    City
                  </Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white' }}
                    placeholder="Enter city"
                    value={updateForm.city}
                    onChangeText={handleUpdateFormChange('city')}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
                  Pincode
                </Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white' }}
                  placeholder="Enter pincode"
                  keyboardType="number-pad"
                  value={updateForm.pincode}
                  onChangeText={handleUpdateFormChange('pincode')}
                  maxLength={6}
                />
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
                  Phone Number
                </Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: 'white' }}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={updateForm.phone}
                  onChangeText={handleUpdateFormChange('phone')}
                  maxLength={10}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#6B7280',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    flex: 1,
                  }}
                  onPress={closeUpdateModal}
                  disabled={updateLoading}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: updateLoading ? '#9CA3AF' : '#337D81',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    flex: 1,
                  }}
                  onPress={handleUpdateSubmit}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator color="white" size="small" />
                      <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }}>
                        Updating...
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                      Update
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default Details;