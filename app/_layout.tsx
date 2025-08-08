import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/context/AuthContext'
import '@/global.css'
import Toast from 'react-native-toast-message';

const RootLayout = () => {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
      </Stack>
      <Toast position='top' topOffset={80} visibilityTime={1000} />
    </AuthProvider>

  )
}

export default RootLayout