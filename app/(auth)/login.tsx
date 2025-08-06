import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const { setIsLoggedIn } = useAuth();
  const [loading, setIsLoading] = useState(false);
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      console.log(token);
      if (token) {
        setIsLoggedIn(true);
        router.replace('/(root)/(tabs)/form');
      }
    }
    checkToken()
  }, [router, setIsLoggedIn])

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('https://shopu-data-collection.vercel.app/api/auth/login', {
        email: form.email,
        password: form.password
      })

      if (response) {
        console.log("Logged in successfull")
        await AsyncStorage.setItem('token', response.data.token);
        setIsLoading(false)
        router.replace('/(root)/(tabs)/form');
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className='w-[90%] m-auto'>
        <SafeAreaView className='flex-1 items-center'>
          <View>
            <Image source={require('@/assets/images/login.png')} style={{ height: 300, width: 300, marginBottom: 20 }} />
          </View>
          <View className='w-full'>
            <View className='mb-10'>
              <Text className='font-extrabold text-[30px] text-center'>Welcome Back!!!</Text>
              <Text className='font-bold text-[20px] text-center'>Login</Text>
            </View>
            <View className='flex flex-col gap-2'>
              <Text className='font-[500px] text-[15px]'>Email</Text>
              <TextInput keyboardType='email-address' className='mb-5 border px-5 rounded-md' placeholder='Enter your email' onChangeText={(value) => setForm({ ...form, email: value })} value={form.email} />
            </View>
            <View className='flex flex-col gap-2 relative'>
              <Text className='font-[500px] text-[15px]'>Password</Text>
              <TextInput secureTextEntry={showPassword ? false : true} className='mb-5 border px-5 rounded-md' placeholder='Enter your password' onChangeText={(value) => setForm({ ...form, password: value })} value={form.password} />
              <TouchableOpacity className='absolute right-3 top-11 cursor-pointer' onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <Feather name="eye" size={18} color="black" /> : <Feather name="eye-off" size={18} color="black" />}
              </TouchableOpacity>
            </View>
            <View className='bg-primary w-full py-3 rounded-md mt-4'>
              <TouchableOpacity onPress={handleSubmit} activeOpacity={1}>
                {
                  loading ? <Text className='text-center'><ActivityIndicator size={"small"} className='text-white font-semibold' /></Text> : <Text className='text-white text-center font-semibold'>Login</Text>
                }
              </TouchableOpacity>
            </View>
          </View>

        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Login