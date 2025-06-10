import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Button, 
    StyleSheet, 
    Alert, 
    FlatList,
    Modal,
    TouchableOpacity,
    ScrollView,
    Switch
} from 'react-native';
import { collection, addDoc, getDocs, where, query, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig'; 

const FormularioItem = ({ label, value, onChangeText, placeholder, multiline = false, numberOfLines = 1, secureTextEntry = false }) => (
    <View style={styles.formItem}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            multiline={multiline}
            numberOfLines={numberOfLines}
            secureTextEntry={secureTextEntry}
        />
    </View>
);

const ProjetoItem = ({ item, onEdit }) => (
    <TouchableOpacity onPress={() => onEdit(item)}>
        <View style={styles.listItem}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Tema: {item.temaProjeto}</Text>
                <Text style={[styles.status, item.status === 'feito' ? styles.statusFeito : styles.statusPendente]}>
                    {item.status || 'Pendente'}
                </Text>
            </View>
            <Text style={styles.itemDescription}>"{item.descricaoProjeto}"</Text>
            <Text style={styles.itemDetail}>Aluno: {item.nomeAluno} ({item.emailAluno})</Text>
            <Text style={styles.itemDetail}>Curso: {item.nomeCurso}</Text>
            <Text style={styles.itemDetail}>Período: {item.descricaoPeriodo}</Text>
        </View>
    </TouchableOpacity>
);

export default function TelaProfessor() {
    const [nomeCurso, setNomeCurso] = useState('');
    const [temaProjeto, setTemaProjeto] = useState('');
    const [descricaoProjeto, setDescricaoProjeto] = useState('');
    const [descricaoPeriodo, setDescricaoPeriodo] = useState('');
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [listaAlunos, setListaAlunos] = useState([]);
    const [modalAlunoVisivel, setModalAlunoVisivel] = useState(false);
    const [projetos, setProjetos] = useState([]);
    const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
    const [projetoEmEdicao, setProjetoEmEdicao] = useState(null);
    const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
    const [novoUsuarioEmail, setNovoUsuarioEmail] = useState('');
    const [novoUsuarioSenha, setNovoUsuarioSenha] = useState('');
    const [novoUsuarioIsProfessor, setNovoUsuarioIsProfessor] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState('projetos');

    useEffect(() => {
        const q = query(collection(db, 'projetos'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setProjetos(items);
        });
        return () => unsubscribe();
    }, []);

    const fetchAlunos = async () => {
        const q = query(collection(db, "usuarios"), where("tipoUsuario", "==", "aluno"));
        const querySnapshot = await getDocs(q);
        setListaAlunos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleCadastroUsuario = async () => {
        if (!novoUsuarioNome || !novoUsuarioEmail || !novoUsuarioSenha) {
            Alert.alert("Erro", "Preencha todos os campos para cadastrar um novo usuário.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, novoUsuarioEmail, novoUsuarioSenha);
            const uid = userCredential.user.uid;
            const tipoUsuario = novoUsuarioIsProfessor ? 'professor' : 'aluno';
            await setDoc(doc(db, 'usuarios', uid), {
                nome: novoUsuarioNome,
                email: novoUsuarioEmail,
                tipoUsuario: tipoUsuario,
            });
            Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
            setNovoUsuarioNome('');
            setNovoUsuarioEmail('');
            setNovoUsuarioSenha('');
            setNovoUsuarioIsProfessor(false);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert("Erro", "Este email já está em uso.");
            } else if (error.code === 'auth/weak-password') {
                Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");
            } else {
                Alert.alert("Erro", "Ocorreu um erro ao realizar o cadastro.");
            }
        }
    };

    const handleAbrirModalAluno = async () => {
        await fetchAlunos();
        setModalAlunoVisivel(true);
    };

    const handleSelecionarAluno = (aluno) => {
        setAlunoSelecionado(aluno);
        setModalAlunoVisivel(false);
    };
    
    const handleAbrirModalEdicao = (projeto) => {
        setProjetoEmEdicao(projeto);
        setModalEdicaoVisivel(true);
    };

    const handleSalvarAlteracoes = async () => {
        if (!projetoEmEdicao) return;
        const projetoRef = doc(db, 'projetos', projetoEmEdicao.id);
        await updateDoc(projetoRef, {
            temaProjeto: projetoEmEdicao.temaProjeto,
            descricaoProjeto: projetoEmEdicao.descricaoProjeto,
            nomeCurso: projetoEmEdicao.nomeCurso,
            descricaoPeriodo: projetoEmEdicao.descricaoPeriodo,
            status: projetoEmEdicao.status,
        });
        Alert.alert('Sucesso', 'Projeto atualizado!');
        setModalEdicaoVisivel(false);
    };

    const handleSalvarProjeto = async () => {
        if (!nomeCurso.trim() || !alunoSelecionado || !temaProjeto.trim() || !descricaoPeriodo.trim() || !descricaoProjeto.trim()) {
            Alert.alert('Erro', 'Preencha todos os campos e associe um aluno.');
            return;
        }
        await addDoc(collection(db, 'projetos'), { nomeCurso, alunoId: alunoSelecionado.id, nomeAluno: alunoSelecionado.nome, emailAluno: alunoSelecionado.email, temaProjeto, descricaoProjeto, descricaoPeriodo, status: 'pendente' });
        Alert.alert('Sucesso', 'Projeto cadastrado!');
        setNomeCurso(''); setAlunoSelecionado(null); setTemaProjeto(''); setDescricaoProjeto(''); setDescricaoPeriodo('');
    };
    
    const renderContent = () => {
        switch (abaAtiva) {
            case 'projetos':
                return (
                    <FlatList 
                        data={projetos} 
                        renderItem={({item}) => <ProjetoItem item={item} onEdit={handleAbrirModalEdicao} />} 
                        keyExtractor={item => item.id} 
                        ListHeaderComponent={<Text style={styles.sectionTitle}>Projetos Cadastrados</Text>}
                        ListEmptyComponent={<Text style={styles.emptyListText}>Nenhum projeto cadastrado.</Text>}
                    />
                );
            case 'cadastrarProjeto':
                return (
                    <ScrollView>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cadastrar Novo Projeto</Text>
                            <FormularioItem label="Nome do Curso:" value={nomeCurso} onChangeText={setNomeCurso} placeholder="Ex: Engenharia de Software" />
                            <View style={styles.formItem}>
                                <Text style={styles.label}>Aluno:</Text>
                                <TouchableOpacity style={styles.selectButton} onPress={handleAbrirModalAluno}>
                                    <Text style={styles.selectButtonText}>{alunoSelecionado ? `${alunoSelecionado.nome}` : 'Associar a um Aluno'}</Text>
                                </TouchableOpacity>
                            </View>
                            <FormularioItem label="Tema do Projeto:" value={temaProjeto} onChangeText={setTemaProjeto} placeholder="Ex: Sistema de Gestão Acadêmica" />
                            <FormularioItem label="Descrição do Projeto:" value={descricaoProjeto} onChangeText={setDescricaoProjeto} placeholder="Descreva o projeto" multiline={true} />
                            <FormularioItem label="Descrição do Período:" value={descricaoPeriodo} onChangeText={setDescricaoPeriodo} placeholder="Ex: 2025/1" />
                            <Button title="Salvar Novo Projeto" onPress={handleSalvarProjeto} />
                        </View>
                    </ScrollView>
                );
            case 'cadastrarUsuario':
                return (
                    <ScrollView>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cadastrar Novo Usuário</Text>
                            <FormularioItem label="Nome Completo:" value={novoUsuarioNome} onChangeText={setNovoUsuarioNome} placeholder="Digite o nome do usuário" />
                            <FormularioItem label="Email:" value={novoUsuarioEmail} onChangeText={setNovoUsuarioEmail} placeholder="Digite o email de acesso" />
                            <FormularioItem label="Senha:" value={novoUsuarioSenha} onChangeText={setNovoUsuarioSenha} placeholder="Crie uma senha de 6+ caracteres" secureTextEntry={true} />
                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>É um professor?</Text>
                                <Switch
                                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                                    thumbColor={novoUsuarioIsProfessor ? "#f5dd4b" : "#f4f3f4"}
                                    onValueChange={() => setNovoUsuarioIsProfessor(previousState => !previousState)}
                                    value={novoUsuarioIsProfessor}
                                />
                            </View>
                            <Button title="Cadastrar Usuário" onPress={handleCadastroUsuario} />
                        </View>
                    </ScrollView>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Painel do Professor</Text>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, abaAtiva === 'projetos' && styles.tabAtiva]} onPress={() => setAbaAtiva('projetos')}>
                    <Text style={styles.tabText}>Projetos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, abaAtiva === 'cadastrarProjeto' && styles.tabAtiva]} onPress={() => setAbaAtiva('cadastrarProjeto')}>
                    <Text style={styles.tabText}>Cadastrar Projeto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, abaAtiva === 'cadastrarUsuario' && styles.tabAtiva]} onPress={() => setAbaAtiva('cadastrarUsuario')}>
                    <Text style={styles.tabText}>Cadastrar Usuário</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={modalAlunoVisivel} onRequestClose={() => setModalAlunoVisivel(false)} transparent={true}>
                 <View style={styles.modalContainer}><View style={styles.modalView}><Text style={styles.modalTitle}>Selecione um Aluno</Text><FlatList data={listaAlunos} keyExtractor={(item) => item.id} renderItem={({ item }) => ( <TouchableOpacity style={styles.alunoItem} onPress={() => handleSelecionarAluno(item)}><Text style={styles.alunoNome}>{item.nome}</Text><Text style={styles.alunoEmail}>{item.email}</Text></TouchableOpacity> )} /><Button title="Cancelar" onPress={() => setModalAlunoVisivel(false)} color="red" /></View></View>
            </Modal>
            
            {projetoEmEdicao && (
                <Modal visible={modalEdicaoVisivel} onRequestClose={() => setModalEdicaoVisivel(false)} transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Editar Projeto</Text>
                            <ScrollView>
                                <FormularioItem label="Tema:" value={projetoEmEdicao.temaProjeto} onChangeText={(text) => setProjetoEmEdicao({...projetoEmEdicao, temaProjeto: text})} />
                                <FormularioItem label="Descrição:" value={projetoEmEdicao.descricaoProjeto} onChangeText={(text) => setProjetoEmEdicao({...projetoEmEdicao, descricaoProjeto: text})} multiline={true}/>
                                <FormularioItem label="Curso:" value={projetoEmEdicao.nomeCurso} onChangeText={(text) => setProjetoEmEdicao({...projetoEmEdicao, nomeCurso: text})} />
                                <FormularioItem label="Período:" value={projetoEmEdicao.descricaoPeriodo} onChangeText={(text) => setProjetoEmEdicao({...projetoEmEdicao, descricaoPeriodo: text})} />
                                <Text style={styles.label}>Status:</Text>
                                <View style={styles.statusSelector}>
                                    <TouchableOpacity onPress={() => setProjetoEmEdicao({...projetoEmEdicao, status: 'pendente'})} style={[styles.statusOption, projetoEmEdicao.status !== 'feito' ? styles.statusSelected : null]}>
                                        <Text style={projetoEmEdicao.status !== 'feito' ? styles.statusSelectedText : styles.statusUnselectedText}>Pendente</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setProjetoEmEdicao({...projetoEmEdicao, status: 'feito'})} style={[styles.statusOption, projetoEmEdicao.status === 'feito' ? styles.statusSelected : null]}>
                                        <Text style={projetoEmEdicao.status === 'feito' ? styles.statusSelectedText : styles.statusUnselectedText}>Feito</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                            <View style={styles.modalButtons}>
                               <Button title="Salvar" onPress={handleSalvarAlteracoes} />
                               <Button title="Cancelar" onPress={() => setModalEdicaoVisivel(false)} color="red" />
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            
            <View style={styles.contentArea}>
                {renderContent()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    contentContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginTop: 20, marginBottom: 10, color: '#333' },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: '#fff', },
    tab: { paddingVertical: 15, paddingHorizontal: 5, flex: 1, alignItems: 'center' },
    tabAtiva: { borderBottomWidth: 3, borderBottomColor: '#007bff' },
    tabText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
    contentArea: { flex: 1, padding: 20 },
    section: { backgroundColor: '#fff', borderRadius: 8, padding: 20, marginBottom: 25, },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#007bff', marginBottom: 15, paddingBottom: 10, },
    formItem: { marginBottom: 15, },
    label: { fontSize: 16, marginBottom: 5, color: '#555' },
    input: { minHeight: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#fff', fontSize: 16 },
    listItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1.0, marginHorizontal: 5 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
    itemDescription: { fontSize: 14, color: '#555', fontStyle: 'italic', marginBottom: 8 },
    itemDetail: { fontSize: 14, color: '#666', marginTop: 4 },
    emptyListText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#888' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, width: '90%', maxHeight: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' },
    alunoItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', width: '100%' },
    alunoNome: { fontSize: 18 },
    alunoEmail: { fontSize: 14, color: 'gray' },
    selectButton: { height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, backgroundColor: '#fff', justifyContent: 'center' },
    selectButtonText: { fontSize: 16, color: '#333' },
    status: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 12, fontSize: 12, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' },
    statusPendente: { backgroundColor: '#ffc107' },
    statusFeito: { backgroundColor: '#28a745' },
    statusSelector: { flexDirection: 'row', justifyContent: 'center', marginVertical: 15 },
    statusOption: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, marginHorizontal: 5 },
    statusSelected: { backgroundColor: '#007bff', borderColor: '#007bff' },
    statusSelectedText: { color: '#fff' },
    statusUnselectedText: { color: '#333' },
    switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 15 }
});
