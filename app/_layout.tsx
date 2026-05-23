import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </AuthProvider>
  );
}