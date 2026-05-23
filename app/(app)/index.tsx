import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Animated, BackHandler } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import DrawerMenu from "./menu";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useLocalSearchParams } from "expo-router";

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

type Message = {
  id: string;
  text: string;
  fromUser: boolean;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { conversationId: routeConversationId } = useLocalSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const flatListRef = useRef<FlatList>(null);

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

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [drawerOpen]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  }, [messages]);

  useEffect(() => {
    console.log(
      "ROUTE CONVERSATION:",
      routeConversationId
    );

    if (
      routeConversationId &&
      typeof routeConversationId === "string"
    ) {
      setMessages([]);

      loadMessages(routeConversationId);
    }
  }, [routeConversationId]);

  const loadMessages = async (
    conversationId: string
  ) => {
    try {
      console.log("LOAD ID:", conversationId);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", {
          ascending: true,
        });

      console.log("MESSAGES:", data);
      console.log("ERROR:", error);

      if (error) {
        console.log(error);
        return;
      }

      if (!data) return;

      const formattedMessages: Message[] =
        data.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          fromUser: msg.from_user,
        }));

      setConversationId(conversationId);

      setMessages(formattedMessages);
    } catch (err) {
      console.log(err);
    }
  };

  const createConversation = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: user.id,
          title: inputText.trim().slice(0, 30),
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      return null;
    }

    setConversationId(data.id);

    return data.id;
  };

  const saveMessage = async (
    conversation_id: string,
    text: string,
    from_user: boolean
  ) => {
    const { error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id,
          text,
          from_user,
        },
      ]);

    if (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    let currentConversationId = conversationId;

    if (!currentConversationId) {
      currentConversationId =
        await createConversation();
    }

    if (!currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      fromUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);

    await saveMessage(
      currentConversationId,
      userMessage.text,
      true
    );

    const currentMessage = inputText;

    setInputText("");

    setLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.2.16:3000/chat",
        {
          message: currentMessage,
        }
      );

      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        text: response.data.response,
        fromUser: false,
      };

      setMessages((prev) => [...prev, botMessage]);

      await saveMessage(
        currentConversationId,
        botMessage.text,
        false
      );
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          text: "Erro ao conectar com a IA.",
          fromUser: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({
    item,
  }: {
    item: Message;
  }) => (
    <View
      className={`px-[14px] py-3 rounded-[18px] mb-[10px] max-w-[80%] shadow-sm ${
        item.fromUser
          ? "bg-[#BFDBFE] self-end rounded-br-[4px]"
          : "bg-white self-start rounded-bl-[4px] border border-[#D6E4F0]"
      }`}
    >
      <Text
        className={`text-[15px] leading-[22px] text-[#1E293B] ${
          item.fromUser ? "font-medium" : ""
        }`}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F1F6FB]" style = {{ overflow: "hidden"}}>
      <KeyboardAvoidingView
        className="flex-1 bg-[#F1F6FB]"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 60 : 0
        }
      >
        <View
          className="h-16 bg-[#60A5FA] flex-row items-center justify-between px-4 rounded-b-[18px]"
          style={{
            shadowColor: COLORS.shadow,
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.12,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <TouchableOpacity
            onPress={toggleDrawer}
            className="w-9 items-center justify-center"
          >
            <Ionicons
              name="menu"
              size={26}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <Text className="text-white text-[20px] font-bold">
            PsyChat
          </Text>

          <View className="w-9" />
        </View>

        <DrawerMenu
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          drawerAnim={drawerAnim}
        />

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            {
              paddingHorizontal: 16,
              paddingTop: 18,
              paddingBottom: 12,
            },
            messages.length === 0 && {
              flexGrow: 1,
              justifyContent: "center",
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center px-6">
              <Ionicons
                name="chatbubbles-outline"
                size={60}
                color={COLORS.iconSoft}
              />

              <Text className="mt-4 text-[22px] font-bold text-[#1E293B]">
                Bem-vindo ao PsyChat
              </Text>

              <Text className="mt-2 text-[15px] text-[#64748B] text-center leading-[22px]">
                Converse com a IA para
                receber apoio emocional,
                reflexões e conselhos.
              </Text>
            </View>
          }
          ListFooterComponent={
            loading ? (
              <View className="px-[14px] py-3 rounded-[18px] mb-[10px] max-w-[80%] bg-white self-start rounded-bl-[4px] border border-[#D6E4F0]">
                <Text className="text-[15px] leading-[22px] text-[#1E293B]">
                  Digitando...
                </Text>
              </View>
            ) : null
          }
        />

        <View className="px-3 pt-2 pb-3">
          <View
            className="flex-row items-end bg-white rounded-[24px] pl-[14px] pr-2 py-2 border border-[#D6E4F0]"
            style={{
              shadowColor: COLORS.shadow,
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <TextInput
              placeholder="Escreva sua mensagem..."
              placeholderTextColor={
                COLORS.textSecondary
              }
              className="flex-1 text-[15px] text-[#1E293B] max-h-[100px] py-2 pr-2"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity
              onPress={sendMessage}
              className="bg-[#3B82F6] w-[42px] h-[42px] rounded-full items-center justify-center"
              style={{
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Ionicons
                name="send"
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}