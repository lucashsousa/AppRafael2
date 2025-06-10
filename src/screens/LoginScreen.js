import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Certifique-se que o caminho está correto

// 1. Importe os componentes de tela que você criou.
// Certifique-se de que os caminhos para os arquivos estão corretos.
import TelaProfessor from './TelaProfessor';
import TelaAluno from './TelaAluno';

export default function LoginScreen({ navigation }) { 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tipoUsuarioLogado, setTipoUsuarioLogado] = useState(null);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    //setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;
      const userDocRef = doc(db, 'usuarios', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // 2. Apenas atualiza o estado. A mudança de tela cuidará do feedback.
        setTipoUsuarioLogado(userData.tipoUsuario); 
      } else {
        Alert.alert("Erro", "Dados do usuário não encontrados.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert("Erro", "Email ou senha incorretos.");
      setIsLoading(false);
    }
  };

  const navigateToCadastro = () => {
    navigation.navigate('Cadastro'); 
  };
  
  // 3. Renderiza um indicador de carregamento em tela cheia
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // 4. Renderiza a tela correta com base no tipo de usuário logado
  if (tipoUsuarioLogado === 'professor') {
    return <TelaProfessor />;
  }
  
  if (tipoUsuarioLogado === 'aluno') {
    return <TelaAluno />;
  }

  // 5. Se ninguém estiver logado, mostra o formulário de login
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
         <Button title="Entrar" onPress={handleLogin} />
      </View>

      <TouchableOpacity style={styles.cadastroButton} onPress={navigateToCadastro}>
        <Text style={styles.cadastroButtonText}>
          Não tem uma conta? Cadastre-se
        </Text>
      </TouchableOpacity>

      {/* O bloco antigo que mostrava o tipo de usuário foi removido */}
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
      marginBottom: 20,
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