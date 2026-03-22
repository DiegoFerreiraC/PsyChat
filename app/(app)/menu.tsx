import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, PanResponder, Alert,} from "react-native";
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
            try {
              
              await supabase.auth.signOut();

              await AsyncStorage.removeItem("@user_token");
              await AsyncStorage.removeItem("@user_data");

              router.replace("/login");
            } catch (error) {
              console.log("Erro ao sair:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      {drawerOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      )}

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView style={styles.drawerSafeArea}>
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Ionicons name="chatbubbles" size={22} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.drawerTitle}>PsyChat</Text>
              <Text style={styles.drawerSubtitle}>Menu principal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              closeDrawer();
              router.push("/(app)/tabs/profile");
            }}
          >
            <Ionicons name="person-outline" size={20} color={COLORS.primaryDark} />
            <Text style={styles.drawerItemText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              closeDrawer();
              router.push("/(app)/tabs/history");
            }}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.primaryDark} />
            <Text style={styles.drawerItemText}>Histórico</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              closeDrawer();
              router.push("/(app)/tabs/new-chat");
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={COLORS.primaryDark}
            />
            <Text style={styles.drawerItemText}>Novo Chat</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    top: 60,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.drawer,
    zIndex: 10,
    elevation: 6,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  drawerSafeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  drawerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  drawerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  drawerItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },

  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  logoutText: {
    fontSize: 16,
    color: COLORS.danger,
    fontWeight: "700",
  },

  overlay: {
    position: "absolute",
    top: 60,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 5,
  },
});