import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user } = useAuth();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

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
    <SafeAreaView className="flex-1 bg-[#F1F6FB]">
      <ScrollView
        contentContainerStyle={{
          padding: 20,
        }}
      >
        <Text className="text-[28px] font-bold text-[#1E293B] mb-5">
          Meu Perfil
        </Text>

        <View className="bg-white p-[18px] rounded-[18px] mb-5">
          <Text className="text-[14px] text-[#64748B] mb-2 mt-[10px]">
            Email
          </Text>

          <TextInput
            value={email}
            editable={false}
            className="border border-[#D6E4F0] rounded-[14px] px-[14px] py-3 bg-[#F8FBFF] text-[15px] text-[#1E293B] opacity-70"
          />

          <Text className="text-[14px] text-[#64748B] mb-2 mt-[10px]">
            Username
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Digite seu username"
            className="border border-[#D6E4F0] rounded-[14px] px-[14px] py-3 bg-[#F8FBFF] text-[15px] text-[#1E293B]"
          />

          <TouchableOpacity
            className="bg-[#60A5FA] py-[14px] rounded-[14px] mt-[18px] items-center"
            onPress={updateProfile}
            disabled={loading}
          >
            <Text className="text-white text-[16px] font-bold">
              Salvar perfil
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-[18px] rounded-[18px] mb-5">
          <Text className="text-[18px] font-bold text-[#1E293B] mb-3">
            Alterar senha
          </Text>

          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nova senha"
            secureTextEntry
            className="border border-[#D6E4F0] rounded-[14px] px-[14px] py-3 bg-[#F8FBFF] text-[15px] text-[#1E293B]"
          />

          <TouchableOpacity
            className="bg-[#60A5FA] py-[14px] rounded-[14px] mt-[18px] items-center"
            onPress={updatePassword}
            disabled={loading}
          >
            <Text className="text-white text-[16px] font-bold">
              Atualizar senha
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}