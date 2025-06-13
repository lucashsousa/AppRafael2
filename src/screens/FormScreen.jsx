import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList, // Importado para renderizar a lista
} from 'react-native';

// 1. IMPORTAÇÕES CORRETAS DO FIREBASE PARA EXPO
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Importe sua instância do DB

const TelaAluguel = () => {
  // Estados para cada campo do formulário
  const [nomeCarro, setNomeCarro] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [valorAluguel, setValorAluguel] = useState('');
  const [dataAluguel, setDataAluguel] = useState('');
  const [loading, setLoading] = useState(false);

  // Novo estado para armazenar a lista de aluguéis
  const [alugueis, setAlugueis] = useState([]);

  // useEffect para buscar os dados do Firestore em tempo real
  useEffect(() => {
    const q = query(collection(db, 'alugueis'));

    // onSnapshot cria um "ouvinte" para a coleção
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rentalsList = [];
      querySnapshot.forEach((doc) => {
        rentalsList.push({ id: doc.id, ...doc.data() });
      });
      setAlugueis(rentalsList); // Atualiza o estado com os dados
    });

    // Retorna a função de limpeza para parar de ouvir quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Função para lidar com o envio do formulário
  const handleSalvarAluguel = async () => {
    // Validação para campos vazios
    if (!nomeCarro || !nomeCliente || !valorAluguel || !dataAluguel) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const aluguelData = {
        'Nome do carro': nomeCarro,
        'Nome do cliente': nomeCliente,
        'Valor do aluguel': parseFloat(valorAluguel),
        'Data do aluguel': dataAluguel,
      };

      const docRef = await addDoc(collection(db, 'alugueis'), aluguelData);
      console.log('Documento salvo com ID: ', docRef.id);

      Alert.alert('Sucesso!', 'Aluguel salvo com sucesso.');

      // Limpa os campos após o sucesso
      setNomeCarro('');
      setNomeCliente('');
      setValorAluguel('');
      setDataAluguel('');

    } catch (error) {
      console.error('Erro ao salvar aluguel:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o aluguel.');
    } finally {
      setLoading(false);
    }
  };

  // Componente para renderizar cada item da lista
  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Carro:</Text> {item['Nome do carro']}</Text>
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Cliente:</Text> {item['Nome do cliente']}</Text>
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Valor:</Text> R$ {item['Valor do aluguel'].toFixed(2)}</Text>
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Data:</Text> {item['Data do aluguel']}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={alugueis}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.scrollContainer}
        // O formulário agora é o cabeçalho da lista
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Registrar Aluguel de Carro 🚗</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do Carro"
              value={nomeCarro}
              onChangeText={setNomeCarro}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Nome do Cliente"
              value={nomeCliente}
              onChangeText={setNomeCliente}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Valor do Aluguel (ex: 350.50)"
              value={valorAluguel}
              onChangeText={setValorAluguel}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Data do Aluguel (DD/MM/AAAA)"
              value={dataAluguel}
              onChangeText={setDataAluguel}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSalvarAluguel}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Salvar Aluguel</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.listTitle}>Aluguéis Registrados</Text>
          </>
        }
      />
    </KeyboardAvoidingView>
  );
};

// Estilos para o componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- NOVOS ESTILOS PARA A LISTA ---
  listTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 20,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  itemLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default TelaAluguel;