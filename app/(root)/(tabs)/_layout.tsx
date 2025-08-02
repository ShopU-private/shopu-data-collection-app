import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const TabLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='welcome' />
    </Stack>
  )
}

export default TabLayout