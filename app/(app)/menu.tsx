import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, PanResponder, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAWER_WIDTH = 250;

interface MenuProps {
  drawerOpen: boolean;
  setDrawerOpen: (value: boolean) => void;
  drawerAnim: Animated.Value;
}

export default function Menu({ drawerOpen, setDrawerOpen, drawerAnim }: MenuProps) {
  const router = useRouter();

  const closeDrawer = () => {
    Animated.timing(drawerAnim, { toValue: -DRAWER_WIDTH, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(false);
  };

  const openDrawer = () => {
    Animated.timing(drawerAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(true);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => drawerOpen && Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.min(Math.max(-DRAWER_WIDTH, gestureState.dx), 0);
        drawerAnim.setValue(newPos);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) closeDrawer();
        else openDrawer();
      },
    })
  ).current;

  const handleLogout = () => {
    Alert.alert(
      "Sair do aplicativo",
      "Deseja sair do aplicativo?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          onPress: async () => {
            await AsyncStorage.removeItem("@user_token");
            await AsyncStorage.removeItem("@user_data");
            router.replace("/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      {drawerOpen && <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeDrawer} />}

      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]} {...panResponder.panHandlers}>
        <SafeAreaView style={styles.drawerSafeArea}>
          <Text style={styles.drawerTitle}>Menu</Text>

          <TouchableOpacity style={styles.drawerItem} onPress={() => { closeDrawer(); router.push("/(app)/tabs/profile"); }}>
            <Text style={styles.drawerItemText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerItem} onPress={() => { closeDrawer(); router.push("/(app)/tabs/history"); }}>
            <Text style={styles.drawerItemText}>Histórico</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerItem} onPress={() => { closeDrawer(); router.push("/(app)/tabs/new-chat"); }}>
            <Text style={styles.drawerItemText}>Novo Chat</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
            <Text style={[styles.drawerItemText, { color: "red" }]}>Sair</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  drawer: { position: "absolute", top: 60, bottom: 0, left: 0, width: DRAWER_WIDTH, backgroundColor: "#fff", zIndex: 10, elevation: 5 },
  drawerSafeArea: { flex: 1, paddingHorizontal: 16 },
  drawerTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 24 },
  drawerItem: { paddingVertical: 12 },
  drawerItemText: { fontSize: 16 },
  overlay: { position: "absolute", top: 60, bottom: 0, left: 0, right: 0, backgroundColor: "#00000055", zIndex: 5 },
});