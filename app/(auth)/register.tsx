import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
      Toast.show({ type: "error", text1: "Preencha todos os campos" });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        Toast.show({ type: "error", text1: error.message });
        return;
      }

      const user = data.user;
      if (!user) {
        Toast.show({
          type: "info",
          text1: "Confirme seu email antes de continuar.",
        });
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        username: username.toLowerCase(),
      });

      if (profileError) {
        Toast.show({
          type: "error",
          text1: "Erro ao salvar perfil",
          text2: profileError.message,
        });
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
        text1: "Conta criada e logada com sucesso!",
      });

      router.replace("/(app)");
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Algo deu errado" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Ionicons name="chatbubbles" size={28} color={COLORS.white} />
        </View>
        <Text style={styles.logoText}>PsyChat</Text>
        <Text style={styles.subtitle}>Crie sua conta para começar</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>Cadastro</Text>

        <TextInput
          placeholder="Usuário"
          placeholderTextColor={COLORS.placeholder}
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor={COLORS.placeholder}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Senha"
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={22}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          style={[styles.button, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },

  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 22,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FBFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FBFF",
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 18,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  button: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },

  link: {
    marginTop: 18,
    alignItems: "center",
  },

  linkText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
    fontSize: 14,
  },
});