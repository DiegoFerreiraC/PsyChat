import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";

export default function HistoryScreen() {
  const [conversations, setConversations] = useState<any[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setConversations(data || []);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(`../chat/${item.id}`)
      }
    >
      <Text style={styles.title}>
        {item.title || "Conversa"}
      </Text>

      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Histórico</Text>

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhuma conversa encontrada.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F1F6FB",
  },

  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1E293B",
  },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },

  date: {
    marginTop: 6,
    color: "#64748B",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748B",
  },
});