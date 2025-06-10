import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function UsersListScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cursosMap, setCursosMap] = useState({});
  const [temasMap, setTemasMap] = useState({});
  const [projetosMap, setProjetosMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const cursosSnapshot = await getDocs(collection(db, 'cursos'));
      const cursos = {};
      cursosSnapshot.forEach((doc) => {
        cursos[doc.id] = doc.data().nome;
      });
      setCursosMap(cursos);

      const temasSnapshot = await getDocs(collection(db, 'temas'));
      const temas = {};
      temasSnapshot.forEach((doc) => {
        temas[doc.id] = doc.data().titulo;
      });
      setTemasMap(temas);

      const projetosSnapshot = await getDocs(collection(db, 'projetos'));
      const projetos = {};
      projetosSnapshot.forEach((doc) => {
        const data = doc.data();
        const alunoRef = typeof data.alunoId === 'object' && data.alunoId?.id ? data.alunoId.id : data.alunoId;
        if (!alunoRef) return;
        if (!projetos[alunoRef]) projetos[alunoRef] = [];
        projetos[alunoRef].push({
          nomeProjeto: data.nomeProjeto,
          descricaoProjeto: data.descricaoProjeto,
          temaId: typeof data.temaId === 'object' && data.temaId?.id ? data.temaId.id : data.temaId,
          cursoId: typeof data.cursoId === 'object' && data.cursoId?.id ? data.cursoId.id : data.cursoId,
          periodo: data.periodo,
          notaMedia: data.notaMedia,
        });
      });
      setProjetosMap(projetos);

      const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
      const usersList = usuariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usersList);
    } catch (error) {
      console.error("Erro ao buscar dados: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return () => unsubscribe;
  }, [fetchData, navigation]);

  const handleEditUser = (user) => {
    if (user.tipoUsuario === 'administrador') {
      navigation.navigate('EditarAdminScreen', { uid: user.id });
    } else if (user.tipoUsuario === 'professor') {
      navigation.navigate('EditarProfessorScreen', { uid: user.id });
    } else if (user.tipoUsuario === 'aluno') {
      navigation.navigate('EditarAlunoScreen', { uid: user.id });
    } else if (user.tipoUsuario === 'avaliador' || user.avaliador) {
      navigation.navigate('EditarAvaliadorScreen', { uid: user.id });
    }
  };

  const renderUsuario = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>Usuário: {item.usuario || '-'}</Text>
      <Text>Email: {item.email || '-'}</Text>
      <Text>Nome: {item.nome || '-'}</Text>
      <Text>Tipo: {item.tipoUsuario || '-'}{item.avaliador ? ' (também avaliador)' : ''}</Text>
      {item.nmatricula && <Text>Matrícula: {item.nmatricula}</Text>}

      {Array.isArray(item.temas) && item.temas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Temas:</Text>
          {item.temas.map((temaId, index) => {
            const id = typeof temaId === 'object' && temaId?.id ? temaId.id : temaId;
            return <Text key={index}>• {temasMap[id] || id}</Text>;
          })}
        </View>
      )}

      {Array.isArray(item.cursos) && item.cursos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Cursos:</Text>
          {item.cursos.map((cursoId, index) => {
            const nomeCurso = cursosMap[cursoId] || cursoId;
            const periodo = item.periodos?.[cursoId];
            return (
              <Text key={index}>
                • {nomeCurso}
                {periodo !== undefined && ` - Períodos: ${Array.isArray(periodo) ? periodo.join(', ') : periodo}`}
              </Text>
            );
          })}
        </View>
      )}

      {item.tipoUsuario === 'aluno' && projetosMap[item.id] && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Projetos:</Text>
          {projetosMap[item.id].map((projeto, index) => (
            <View key={index} style={styles.projectItem}>
              <Text>• {projeto.nomeProjeto || 'Sem título'}</Text>
              <Text>  Descrição: {projeto.descricaoProjeto || '-'}</Text>
              <Text>  Tema: {temasMap[projeto.temaId] || 'Tema não encontrado'}</Text>
              <Text>  Curso: {cursosMap[projeto.cursoId] || '-'}</Text>
              <Text>  Período: {projeto.periodo || '-'}</Text>
              <Text>  Nota Média: {projeto.notaMedia || 'N/A'}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.editButton} onPress={() => handleEditUser(item)}>
        <Text style={styles.editButtonText}>Acessar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        renderItem={renderUsuario}
        ListEmptyComponent={<Text>Nenhum usuário cadastrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontWeight: '600',
    marginTop: 10,
  },
  section: {
    marginTop: 5,
  },
  projectItem: {
    marginLeft: 10,
    marginTop: 5,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});