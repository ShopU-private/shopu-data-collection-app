import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Alert, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          marginLeft: 10,
          textTransform: 'capitalize',
          fontWeight: 'semibold'
        },
        tabBarActiveTintColor: 'white',
        tabBarActiveBackgroundColor: '#337D81',
        tabBarStyle: {
          borderRadius: 50,
          margin: 20,
          padding: 10,
        },
        tabBarLabelStyle: {
          textTransform: 'capitalize',
          fontWeight: 'bold'
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