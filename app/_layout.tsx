import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/context/AuthContext'
import '@/global.css'

const RootLayout = () => {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
      </Stack>
    </AuthProvider>

  )
}

export default RootLayout