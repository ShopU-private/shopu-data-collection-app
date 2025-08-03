import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean,
  setIsLoggedIn: (status: boolean) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: 
  { children: ReactNode }
) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}