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
  Animated,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DrawerMenu from "./menu";

const DRAWER_WIDTH = 250;

const COLORS = {
  background: "#F1F6FB",
  header: "#60A5FA",
  headerDark: "#3B82F6",
  userBubble: "#BFDBFE",
  botBubble: "#FFFFFF",
  inputBackground: "#FFFFFF",
  border: "#D6E4F0",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  white: "#FFFFFF",
  iconSoft: "#93C5FD",
  shadow: "#1E3A8A",
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ id: string; text: string; fromUser: boolean }[]>([]);
  const [inputText, setInputText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const openDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
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

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: inputText.trim(),
        fromUser: true,
      },
    ]);

    setInputText("");
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View
      style={[
        styles.messageContainer,
        item.fromUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={[styles.messageText, item.fromUser && styles.userMessageText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={26} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>PsyChat</Text>

          <View style={styles.headerRightSpace} />
        </View>

        <DrawerMenu
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          drawerAnim={drawerAnim}
        />

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.chatContainer,
            messages.length === 0 && styles.emptyChatContainer,
          ]}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubbles-outline"
                size={60}
                color={COLORS.iconSoft}
              />
              <Text style={styles.emptyTitle}>Bem-vindo ao PsyChat</Text>
              <Text style={styles.emptyText}>
                Comece a conversa enviando sua primeira mensagem.
              </Text>
            </View>
          }
        />

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Escreva sua mensagem..."
              placeholderTextColor={COLORS.textSecondary}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 64,
    backgroundColor: COLORS.header,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 5,
  },

  menuButton: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },

  headerRightSpace: {
    width: 36,
  },

  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },

  emptyChatContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  messageContainer: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: "80%",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },

  userMessage: {
    backgroundColor: COLORS.userBubble,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },

  botMessage: {
    backgroundColor: COLORS.botBubble,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  messageText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },

  userMessageText: {
    color: COLORS.textPrimary,
    fontWeight: "500",
  },

  inputWrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 8,
  },

  sendButton: {
    backgroundColor: COLORS.headerDark,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
});