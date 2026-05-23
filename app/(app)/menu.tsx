import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

const DRAWER_WIDTH = 250;

const COLORS = {
  background: "#F1F6FB",
  drawer: "#FFFFFF",
  primary: "#60A5FA",
  primaryDark: "#3B82F6",
  border: "#D6E4F0",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  white: "#FFFFFF",
  shadow: "#1E3A8A",
  overlay: "rgba(0, 0, 0, 0.25)",
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
};

interface MenuProps {
  drawerOpen: boolean;
  setDrawerOpen: (value: boolean) => void;
  drawerAnim: Animated.Value;
}

export default function Menu({
  drawerOpen,
  setDrawerOpen,
  drawerAnim,
}: MenuProps) {
  const router = useRouter();

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setDrawerOpen(false);
  };

  const openDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setDrawerOpen(true);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        drawerOpen && Math.abs(gestureState.dx) > 10,

      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.min(
          Math.max(-DRAWER_WIDTH, gestureState.dx),
          0
        );

        drawerAnim.setValue(newPos);
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) closeDrawer();
        else openDrawer();
      },
    })
  ).current;

  const handleLogout = async () => {
    try {
      closeDrawer();

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.log(error);
        return;
      }

      await AsyncStorage.removeItem(
        "@user_token"
      );

      await AsyncStorage.removeItem(
        "@user_data"
      );

      router.replace("/login");
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  };

  return (
    <>
      {drawerOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeDrawer}
          className="absolute inset-0 bg-[rgba(0,0,0,0.25)]"
          style={{
            zIndex: 9998,
          }}
        />
      )}

      <Animated.View
        className="absolute left-0 top-0 h-screen w-[250px] rounded-tr-[20px] rounded-br-[20px]"
        style={{
          position: "absolute",
          zIndex: 9999,
          height: "100%",
          backgroundColor: "#FFFFFF",

          transform: [{ translateX: drawerAnim }],

          shadowColor: COLORS.shadow,
          shadowOffset: {
            width: 2,
            height: 0,
          },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <SafeAreaView className="flex-1 px-4 pt-4 pb-4">
          <View className="flex-row items-center mb-7 pb-4 border-b border-[#D6E4F0]">
            <View className="w-[42px] h-[42px] rounded-full bg-[#60A5FA] items-center justify-center mr-3">
              <Ionicons
                name="chatbubbles"
                size={22}
                color={COLORS.white}
              />
            </View>

            <View>
              <Text className="text-[22px] font-bold text-[#1E293B]">
                PsyChat
              </Text>

              <Text className="text-[13px] text-[#64748B] mt-[2px]">
                Menu principal
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center gap-3 py-[14px] px-3 mb-2 rounded-[14px] bg-[#F8FBFF] border border-[#D6E4F0]"
            onPress={() => {
              closeDrawer();
              router.push("../tabs/profile");
            }}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={COLORS.primaryDark}
            />

            <Text className="text-[16px] text-[#1E293B] font-medium">
              Perfil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-3 py-[14px] px-3 mb-2 rounded-[14px] bg-[#F8FBFF] border border-[#D6E4F0]"
            onPress={() => {
              closeDrawer();
              router.push("../tabs/history");
            }}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={COLORS.primaryDark}
            />

            <Text className="text-[16px] text-[#1E293B] font-medium">
              Histórico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-3 py-[14px] px-3 mb-2 rounded-[14px] bg-[#F8FBFF] border border-[#D6E4F0]"
            onPress={() => {
              closeDrawer();
              router.push("/");
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={COLORS.primaryDark}
            />

            <Text className="text-[16px] text-[#1E293B] font-medium">
              Novo chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-3 py-[14px] px-3 mb-2 rounded-[14px] bg-[#F8FBFF] border border-[#D6E4F0]"
            onPress={() => {
              closeDrawer();
              router.push("/suport/apoio");
            }}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={COLORS.primaryDark}
            />

            <Text className="text-[16px] text-[#1E293B] font-medium">
              Apoio próximo
            </Text>
          </TouchableOpacity>

          <View className="flex-1" />

          <TouchableOpacity
            className="flex-row items-center gap-3 py-[14px] px-3 rounded-[14px] bg-[#FEE2E2] border border-[#FECACA]"
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={COLORS.danger}
            />

            <Text className="text-[16px] text-[#EF4444] font-bold">
              Sair
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}