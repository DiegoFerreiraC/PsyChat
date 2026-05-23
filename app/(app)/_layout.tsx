import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

const COLORS = {
  background: "#F1F6FB",
  primary: "#3B82F6",
};

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F1F6FB]">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}