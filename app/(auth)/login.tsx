import { useAuth } from '@/context/AuthContext';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

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
    if (!form.email || !form.password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields'
      });
      return;
    }

    setIsLoading(true)
    try {
      const response = await axios.post('https://shopu-data-collection.vercel.app/api/auth/login', {
        email: form.email,
        password: form.password
      })

      if (response.data && response.data.token) {
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!'
        })
        await AsyncStorage.setItem('token', response.data.token);
        setIsLoggedIn(true)
        router.replace('/(root)/(tabs)/form');
      }
      else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid credentials'
        })
      }
    } catch (error: any) {
      console.log(error)

      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';

      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className='w-[90%] m-auto'>
        <SafeAreaView className='flex-1 items-center'>
          <View>
            <Image source={require('@/assets/images/login.png')} style={{ height: 300, width: 300, marginBottom: 20 }} />
          </View>
          <View className='w-full shadow-lg bg-[#ffffff] mt-10'>
            <View className='mb-5'>
              <Text className='font-extrabold text-[30px] text-center'>Welcome Back!!!</Text>
              <Text className='font-bold text-[25px] text-center mt-5'>Login</Text>
            </View>
            <View className='flex flex-col'>
              <Text className='font-[500px] text-[15px]'>Email</Text>
              <TextInput keyboardType='email-address' className='mb-5 border px-5 rounded-md' placeholder='Enter your email' placeholderTextColor='gray' style={{ color: 'black' }} onChangeText={(value) => setForm({ ...form, email: value })} value={form.email} />
            </View>
            <View className='flex flex-col gap-2 relative'>
              <Text className='font-[500px] text-[15px]'>Password</Text>
              <TextInput secureTextEntry={showPassword ? false : true} className='mb-5 border px-5 rounded-md' placeholder='Enter your password' placeholderTextColor='gray' style={{ color: 'black' }} onChangeText={(value) => setForm({ ...form, password: value })} value={form.password} />
              <TouchableOpacity className='absolute right-3 top-11 cursor-pointer' onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <Feather name="eye" size={18} color="black" /> : <Feather name="eye-off" size={18} color="black" />}
              </TouchableOpacity>
            </View>
            <View className='bg-primary w-full py-3 rounded-md mt-4'>
              <TouchableOpacity onPress={handleSubmit} activeOpacity={1} disabled={loading}>
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