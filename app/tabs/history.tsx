import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";

export default function HistoryScreen() {
  const [conversations, setConversations] =
    useState<any[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    setConversations(data || []);
  };

  const renderItem = ({
    item,
  }: {
    item: any;
  }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-2xl mb-3"
      onPress={() =>
        router.push(`../chat/${item.id}`)
      }
    >
      <Text className="text-[16px] font-semibold text-[#1E293B]">
        {item.title || "Conversa"}
      </Text>

      <Text className="mt-[6px] text-[#64748B]">
        {new Date(
          item.created_at
        ).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-5 bg-[#F1F6FB]">
      <Text className="text-[28px] font-bold mb-5 text-[#1E293B]">
        Histórico
      </Text>

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center mt-10 text-[#64748B]">
            Nenhuma conversa encontrada.
          </Text>
        }
      />
    </View>
  );
}