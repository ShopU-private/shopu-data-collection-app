import { View, Text } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'

const TabLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }} initialRouteName='form'>
      <Tabs.Screen name='form' />
      <Tabs.Screen name='details' />
      <Tabs.Screen name='logout' />
    </Tabs>
  )
}

export default TabLayout