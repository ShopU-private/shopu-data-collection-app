import { useAuth } from '@/context/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';

const LogoutButton = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowModal(true)} style={{ marginRight: 30 }}>
        <MaterialIcons name="logout" size={24} color="white" />
      </TouchableOpacity>

      {showModal && (
        <Modal
          transparent
          animationType="fade"
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-lg p-6 w-[90%] shadow-lg">
              <Text className="text-lg font-bold text-gray-800 text-center mb-4">
                Confirm Logout
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                Are you sure you want to log out?
              </Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 py-3 rounded-lg mr-2"
                >
                  <Text className="text-gray-800 text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogout}
                  className="flex-1 bg-red-500 py-3 rounded-lg ml-2"
                >
                  <Text className="text-white text-center font-semibold">Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <LogoutButton />,
        headerStyle: {
          backgroundColor: '#337D81',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          marginLeft: 10,
          textTransform: 'capitalize',
          fontWeight: 'semibold',
          letterSpacing: 1,
        },
        tabBarActiveTintColor: 'white',
        tabBarActiveBackgroundColor: '#337D81',
        tabBarInactiveTintColor: '#337D81',
        tabBarStyle: {
          borderRadius: 20,
          margin: 20,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.10,
          shadowRadius: 4,
          elevation: 5,
          borderWidth: 0,
        },
        tabBarLabelStyle: {
          textTransform: 'capitalize',
          fontWeight: 'semibold',
        },
      }}
      initialRouteName="form"
    >
      <Tabs.Screen
        name="form"
        options={{
          tabBarIcon: () => (
            <Image
              source={require('@/assets/images/form.png')}
              style={{ resizeMode: 'contain', height: 25, width: 25 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          tabBarIcon: () => (
            <Image
              source={require('@/assets/images/details.png')}
              style={{ height: 25, width: 25, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => (
            <Image
              source={require('@/assets/images/add.png')}
              style={{ height: 25, width: 25, resizeMode: 'contain' }}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;