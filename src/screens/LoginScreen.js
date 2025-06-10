import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity // 1. Importe o TouchableOpacity
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// 2. Garanta que o componente recebe a prop { navigation }
export default function LoginScreen({ navigation }) { 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoUsuarioLogado, setTipoUsuarioLogado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setIsLoading(true);
    setTipoUsuarioLogado(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;
      const userDocRef = doc(db, 'usuarios', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTipoUsuarioLogado(userData.tipoUsuario);
        Alert.alert("Sucesso", "Login realizado com sucesso!");
      } else {
        Alert.alert("Erro", "Dados do usuário não encontrados no banco de dados.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert("Erro", "Email ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Função para navegar para a tela de cadastro
  const navigateToCadastro = () => {
    navigation.navigate('Cadastro'); 
  };

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

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <Button title="Entrar" onPress={handleLogin} />
      )}

      {/* 4. Botão que leva para a tela de cadastro */}
      <TouchableOpacity style={styles.cadastroButton} onPress={navigateToCadastro}>
        <Text style={styles.cadastroButtonText}>
          Não tem uma conta? Cadastre-se
        </Text>
      </TouchableOpacity>

      {tipoUsuarioLogado && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {tipoUsuarioLogado === 'professor' ? 'Professor' : 'Aluno'}
          </Text>
        </View>
      )}
    </View>
  );
}

// 5. Adicione os novos estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
  // Estilo para o botão de cadastro
  cadastroButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cadastroButtonText: {
    fontSize: 16,
    color: '#007bff', // Cor azul, típica de links
    textDecorationLine: 'underline',
  },
  resultContainer: {
    marginTop: 40,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#333',
  },
});