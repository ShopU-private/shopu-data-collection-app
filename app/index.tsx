import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { Redirect } from 'expo-router'
import { Text, View } from 'react-native';

const Index = () => {

  const { isLoggedIn, setIsLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href={"/(auth)/login"} />
  }
  else {
    return <Redirect href={"/(root)/(tabs)/welcome"} />
  }
}

export default Index