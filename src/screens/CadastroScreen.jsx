import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isProfessor, setIsProfessor] = useState(false);

  const handleCadastro = async () => {
    console.log('handleCadastro chamado');
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        nome: nome,
        email: email,
      });

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
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