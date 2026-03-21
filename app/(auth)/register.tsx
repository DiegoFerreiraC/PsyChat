import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import Toast from 'react-native-toast-message';
import { Ionicons } from "@expo/vector-icons";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // controla exibição da senha
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (loading) return;
    if (!email || !username || !password) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        Toast.show({ type: 'error', text1: error.message });
        return;
      }

      const user = data.user;
      if (!user) {
        Toast.show({ type: 'info', text1: 'Confirme seu email antes de continuar.' });
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        username: username.toLowerCase(),
      });

      if (profileError) {
        Toast.show({ type: 'error', text1: 'Erro ao salvar perfil', text2: profileError.message });
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        Toast.show({ type: 'error', text1: 'Erro ao logar', text2: loginError.message });
        return;
      }

      Toast.show({ type: 'success', text1: 'Conta criada e logada com sucesso!' });
      router.replace("/(app)");
    } catch (err) {
      console.log(err);
      Toast.show({ type: 'error', text1: 'Algo deu errado' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Input de senha com ícone */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Senha"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        style={[styles.button, loading && { opacity: 0.6 }]}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")} style={styles.link}>
        <Text style={styles.linkText}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24, backgroundColor: "#fff" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 16 },
  passwordContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 12, borderRadius: 8, marginBottom: 16 },
  passwordInput: { flex: 1, paddingVertical: 12 },
  button: { backgroundColor: "#22c55e", padding: 16, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#3b82f6", fontWeight: "bold" },
});