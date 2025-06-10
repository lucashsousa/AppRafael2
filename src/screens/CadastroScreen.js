import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isProfessor, setIsProfessor] = useState(false); // false para 'aluno', true para 'professor'

  const handleCadastro = async () => {
    console.log('handleCadastro chamado');
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      // Cria o usuário com Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      // Define o tipo de usuário
      const tipoUsuario = isProfessor ? 'professor' : 'aluno';

      // Salva os dados adicionais no Firestore
      await setDoc(doc(db, 'usuarios', uid), {
        nome: nome,
        email: email,
        tipoUsuario: tipoUsuario,
        avaliador: false // Valor padrão, se aplicável
      });

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");

      // Navega para OptionsScreen passando os dados do novo usuário
      navigation.replace('OptionsScreen', {
        userId: uid,
        tipoUsuario: tipoUsuario,
        avaliador: false
      });

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      // Trata erros comuns do Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Erro", "Este email já está em uso.");
      } else if (error.code === 'auth/weak-password') {
        Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao realizar o cadastro.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome Completo:</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome completo"
        autoCapitalize="words"
      />

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
        placeholder="Crie uma senha"
        secureTextEntry
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>É um professor?</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isProfessor ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsProfessor(previousState => !previousState)}
          value={isProfessor}
        />
      </View>

      <Button title="Cadastrar" onPress={handleCadastro} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginTop: 4
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20
  }
});