import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

// As importações do Firebase SDK para Web/Expo estão corretas.
import { signInWithEmailAndPassword } from 'firebase/auth';

// A importação do firestore não é mais necessária nesta tela
// import { doc, getDoc } from 'firebase/firestore';

// Importe sua configuração do Firebase (auth)
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Autentica o usuário com o serviço de Autenticação
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      console.log('Usuário logado com sucesso! UID:', userCredential.user.uid);

      navigation.navigate('form');

    } catch (error) {
      console.error('Erro ao fazer login:', error.code);
      let errorMessage = 'Ocorreu um erro ao fazer login.';
      // Erros comuns de autenticação
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou senha inválidos.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      Alert.alert('Erro no Login', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToCadastro = () => {
    navigation.navigate('Cadastro');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Login</Text>

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite o email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha:</Text>
      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Digite a senha"
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button title="Entrar" onPress={handleLogin} disabled={isLoading} />
      </View>

      {/* Botão de cadastro como um link de texto para melhor UX */}
      <TouchableOpacity onPress={navigateToCadastro} style={styles.cadastroButton}>
        <Text style={styles.cadastroButtonText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    color: '#555',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginTop: 6,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  cadastroButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  cadastroButtonText: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});