import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setUsername(data?.username || "");
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
        })
        .eq("id", user.id);

      if (error) {
        console.log(error);

        Alert.alert(
          "Erro",
          "Não foi possível atualizar o perfil."
        );

        return;
      }

      Alert.alert(
        "Sucesso",
        "Perfil atualizado com sucesso."
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert(
        "Senha",
        "Digite uma nova senha."
      );

      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Senha",
        "A senha deve ter pelo menos 6 caracteres."
      );

      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        console.log(error);

        Alert.alert(
          "Erro",
          "Não foi possível atualizar a senha."
        );

        return;
      }

      setNewPassword("");

      Alert.alert(
        "Sucesso",
        "Senha atualizada com sucesso."
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>
          Meu Perfil
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            value={email}
            editable={false}
            style={[
              styles.input,
              styles.disabledInput,
            ]}
          />

          <Text style={styles.label}>
            Username
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Digite seu username"
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={updateProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              Salvar perfil
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Alterar senha
          </Text>

          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nova senha"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={updatePassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              Atualizar senha
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6FB",
  },

  container: {
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D6E4F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F8FBFF",
    fontSize: 15,
    color: "#1E293B",
  },

  disabledInput: {
    opacity: 0.7,
  },

  button: {
    backgroundColor: "#60A5FA",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});