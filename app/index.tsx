import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { Redirect } from 'expo-router'

const Index = () => {

  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href={"/(auth)/login"} />
  }
  else {
    return <Redirect href={"/(root)/(tabs)/form"} />
  }
}

export default Index