import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const { setIsLoggedIn } = useAuth();
  const [loading, setIsLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const details = await axios.post('https://shopu-data-collection.vercel.app/api/auth/login', {
        email: form.email,
        password: form.password
      })

      if (details) {
        console.log("Logged in successfull")
        router.replace('/(root)/(tabs)/form');
        setIsLoading(false)
        setIsLoggedIn(true)
      }
      else {
        console.log("Failed to loggedin")
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <SafeAreaView className='flex-1 items-center justify-center'>
        <View>
          <Text className='font-extrabold text-[30px]'>Login Page</Text>
        </View>
        <View className='w-full'> 
          <TextInput placeholder='Enter your email' onChangeText={(value) => setForm({ ...form, email: value })} value={form.email} />
          <TextInput placeholder='Enter your password' onChangeText={(value) => setForm({ ...form, password: value })} value={form.password} />
        </View>
        <View className='bg-green-700 w-full py-2'>
          <TouchableOpacity onPress={handleSubmit}>
            {
              loading ? <ActivityIndicator size={"small"} color={"ffffff"} /> : <Text className='text-white text-center'>Login</Text>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}

export default Login