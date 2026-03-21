import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DrawerMenu from "./menu";
import { Animated, BackHandler } from "react-native";

const DRAWER_WIDTH = 250;

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ id: string; text: string; fromUser: boolean }[]>([]);
  const [inputText, setInputText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const router = useRouter();

  const openDrawer = () => {
    Animated.timing(drawerAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, { toValue: -DRAWER_WIDTH, duration: 250, useNativeDriver: true }).start();
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    drawerOpen ? closeDrawer() : openDrawer();
  };

  useEffect(() => {
    const backAction = () => {
      if (drawerOpen) {
        closeDrawer();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [drawerOpen]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: inputText.trim(), fromUser: true }]);
    setInputText("");
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View style={[styles.messageContainer, item.fromUser ? styles.userMessage : styles.botMessage]}>
      <Text style={[styles.messageText, item.fromUser && { color: "#fff" }]}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat Psicólogo</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Drawer modularizado */}
        <DrawerMenu drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} drawerAnim={drawerAnim} />

        {/* Chat */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: "flex-end" }}
          keyboardShouldPersistTaps="handled"
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Escreva sua mensagem..."
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { height: 60, backgroundColor: "#3b82f6", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, justifyContent: "space-between" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  messageContainer: { padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: "80%" },
  userMessage: { backgroundColor: "#3b82f6", alignSelf: "flex-end", borderBottomRightRadius: 0 },
  botMessage: { backgroundColor: "#e5e7eb", alignSelf: "flex-start", borderBottomLeftRadius: 0 },
  messageText: { color: "#000" },
  inputContainer: { flexDirection: "row", padding: 8, borderTopWidth: 1, borderTopColor: "#ccc", alignItems: "center", backgroundColor: "#fff" },
  input: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#f3f4f6", borderRadius: 20, marginRight: 8, maxHeight: 100 },
  sendButton: { backgroundColor: "#3b82f6", borderRadius: 20, padding: 10, justifyContent: "center", alignItems: "center" },
});