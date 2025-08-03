import React from 'react'
import { Tabs } from 'expo-router'
import FormIcon from '@/assets/images/form.svg';

const TabLayout = () => {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: 'black'
      }} 
      initialRouteName='form'
    >
      <Tabs.Screen name='form' options={{
        tabBarIcon: ({ color, size }) => <FormIcon width={size} height={size} fill={color} />
      }} />
      <Tabs.Screen name='details' />
      <Tabs.Screen name='add' />
    </Tabs>
  )
}

export default TabLayout