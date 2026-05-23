import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  background: "#F1F6FB",
  card: "#FFFFFF",
  primary: "#60A5FA",
  primaryDark: "#3B82F6",
  secondary: "#DBEAFE",
  border: "#D6E4F0",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  placeholder: "#94A3B8",
  white: "#FFFFFF",
  shadow: "#1E3A8A",
  icon: "#60A5FA",
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (loading) return;

    if (!email || !username || !password) {
      Toast.show({
        type: "error",
        text1: "Preencha todos os campos",
      });

      return;
    }

    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });

        return;
      }

      const user = data.user;

      if (!user) {
        Toast.show({
          type: "info",
          text1:
            "Confirme seu email antes de continuar.",
        });

        return;
      }

      const { error: profileError } =
        await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            username:
              username.toLowerCase(),
          });

      if (profileError) {
        Toast.show({
          type: "error",
          text1: "Erro ao salvar perfil",
          text2: profileError.message,
        });

        return;
      }

      const { error: loginError } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        );

      if (loginError) {
        Toast.show({
          type: "error",
          text1: "Erro ao logar",
          text2: loginError.message,
        });

        return;
      }

      Toast.show({
        type: "success",
        text1:
          "Conta criada e logada com sucesso!",
      });

      router.replace("/(app)");
    } catch (err) {
      console.log(err);

      Toast.show({
        type: "error",
        text1: "Algo deu errado",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 bg-[#F1F6FB]">
            <View className="items-center mb-8">
              <View
                className="w-[68px] h-[68px] rounded-full bg-[#60A5FA] items-center justify-center mb-[14px]"
                style={{
                  shadowColor: COLORS.shadow,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.14,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              >
                <Ionicons
                  name="chatbubbles"
                  size={28}
                  color={COLORS.white}
                />
              </View>

              <Text className="text-[32px] font-extrabold text-[#3B82F6]">
                PsyChat
              </Text>

              <Text className="mt-[6px] text-[14px] text-[#64748B]">
                Crie sua conta para começar
              </Text>
            </View>

            <View
              className="bg-white rounded-[24px] p-[22px] border border-[#D6E4F0]"
              style={{
                shadowColor: COLORS.shadow,
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-[28px] font-bold text-[#1E293B] mb-[22px] text-center">
                Cadastro
              </Text>

              <TextInput
                placeholder="Usuário"
                placeholderTextColor={
                  COLORS.placeholder
                }
                value={username}
                onChangeText={setUsername}
                className="border border-[#D6E4F0] bg-[#F8FBFF] p-[14px] rounded-[14px] mb-4 text-[15px] text-[#1E293B]"
                autoCapitalize="none"
              />

              <TextInput
                placeholder="Email"
                placeholderTextColor={
                  COLORS.placeholder
                }
                value={email}
                onChangeText={setEmail}
                className="border border-[#D6E4F0] bg-[#F8FBFF] p-[14px] rounded-[14px] mb-4 text-[15px] text-[#1E293B]"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View className="flex-row items-center border border-[#D6E4F0] bg-[#F8FBFF] px-[14px] rounded-[14px] mb-[18px]">
                <TextInput
                  placeholder="Senha"
                  placeholderTextColor={
                    COLORS.placeholder
                  }
                  secureTextEntry={
                    !showPassword
                  }
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 py-[14px] text-[15px] text-[#1E293B]"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye"
                        : "eye-off"
                    }
                    size={22}
                    color={
                      COLORS.textSecondary
                    }
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                className="bg-[#3B82F6] py-4 rounded-[16px] items-center"
                style={{
                  opacity: loading ? 0.7 : 1,

                  shadowColor: COLORS.shadow,
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator
                    color={COLORS.white}
                  />
                ) : (
                  <Text className="text-white font-bold text-[16px]">
                    Criar conta
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push("/login")
                }
                className="mt-[18px] items-center"
              >
                <Text className="text-[#3B82F6] font-bold text-[14px]">
                  Já tem conta? Entrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}