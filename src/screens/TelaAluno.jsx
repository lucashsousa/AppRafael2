import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList,
    Alert,
    ActivityIndicator,
    Button 
} from 'react-native';
import { collection, where, query, onSnapshot, doc, updateDoc } from 'firebase/firestore'; 
import { db, auth } from '../firebaseConfig'; 

const ProjetoItem = ({ item, onConcluir }) => (
    <View style={styles.listItem}>
        <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>Tema: {item.temaProjeto}</Text>
            <Text style={[
                styles.status, 
                item.status === 'feito' ? styles.statusFeito : styles.statusPendente
            ]}>
                {item.status || 'Pendente'}
            </Text>
        </View>
        <Text style={styles.itemDescription}>"{item.descricaoProjeto}"</Text>
        <Text style={styles.itemDetail}>Curso: {item.nomeCurso}</Text>
        <Text style={styles.itemDetail}>Período: {item.descricaoPeriodo}</Text>
        
        {item.status !== 'feito' && (
            <View style={styles.buttonContainer}>
                <Button title="Marcar como Concluído" onPress={() => onConcluir(item.id)} color="#28a745" />
            </View>
        )}
    </View>
);

export default function TelaAluno() {
    const [meusProjetos, setMeusProjetos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const usuarioAtual = auth.currentUser;

        if (!usuarioAtual) {
            Alert.alert("Erro", "Nenhum usuário autenticado encontrado.");
            setIsLoading(false);
            return;
        }

        const q = query(collection(db, "projetos"), where("alunoId", "==", usuarioAtual.uid));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const projetosDoAluno = [];
            querySnapshot.forEach((doc) => {
                projetosDoAluno.push({ id: doc.id, ...doc.data() });
            });
            
            setMeusProjetos(projetosDoAluno);
            setIsLoading(false); 
        }, (error) => {
            console.error("Erro no ouvinte de projetos: ", error);
            Alert.alert("Erro", "Não foi possível carregar seus projetos em tempo real.");
            setIsLoading(false);
        });

        return () => unsubscribe();
        
    }, []);

    const handleConcluirProjeto = async (projetoId) => {
        const projetoRef = doc(db, "projetos", projetoId);
        try {
            await updateDoc(projetoRef, {
                status: "feito"
            });
            Alert.alert("Sucesso!", "O projeto foi marcado como concluído.");
        } catch (error) {
            console.error("Erro ao atualizar o projeto: ", error);
            Alert.alert("Erro", "Não foi possível atualizar o status do projeto.");
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Carregando seus projetos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meus Projetos</Text>
            <FlatList
                data={meusProjetos}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <ProjetoItem item={item} onConcluir={handleConcluirProjeto} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Você ainda não foi associado a nenhum projeto.</Text>
                    </View>
                }
                contentContainerStyle={{ paddingHorizontal: 10 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 25,
        color: '#333',
    },
    listItem: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 1.84,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    itemDescription: {
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
        marginVertical: 8,
    },
    itemDetail: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    status: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
    },
    statusPendente: {
        backgroundColor: '#ffc107',
    },
    statusFeito: {
        backgroundColor: '#28a745',
    },
    buttonContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
    }
});
