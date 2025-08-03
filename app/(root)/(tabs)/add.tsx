import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Logout = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: 'cancel'
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
    <SafeAreaView>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Logout