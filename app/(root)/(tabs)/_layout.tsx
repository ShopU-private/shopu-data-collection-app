import { useAuth } from '@/context/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';

const LogoutButton = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    Alert.alert(
      'Logout',
      'Are you sure to Logout?',
      [
        {
          text: 'cancel',
          style: 'default'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    )
  }

  return (
    <TouchableOpacity onPress={handleSubmit} style={{ marginRight: 30 }}>
      <MaterialIcons name="logout" size={24} color="white" />
    </TouchableOpacity>
  )
}

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
        }
      }}
      initialRouteName='form'
    >
      <Tabs.Screen name='form' options={{
        tabBarIcon: () => {
          return <Image source={require('@/assets/images/form.png')} style={{ resizeMode: 'contain', height: 25, width: 25 }} />
        }
      }} />
      <Tabs.Screen name='details' options={{
        tabBarIcon: () => {
          return <Image source={require('@/assets/images/details.png')} style={{ height: 25, width: 25, resizeMode: 'contain' }} />
        }
      }} />
      <Tabs.Screen name='add' options={{
        tabBarIcon: () => {
          return <Image source={require('@/assets/images/add.png')} style={{ height: 25, width: 25, resizeMode: 'contain' }} />
        }
      }} />
    </Tabs>
  )
}

export default TabLayout