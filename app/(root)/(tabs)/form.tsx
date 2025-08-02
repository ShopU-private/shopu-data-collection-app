import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Form = () => {
  return (
    <ScrollView>
          <SafeAreaView>
            <View>
              <Text>Details</Text>
            </View>
          </SafeAreaView>
        </ScrollView>
  )
}

export default Form