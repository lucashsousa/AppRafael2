// src/screens/HomeScreen.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Button
                title="Cadastrar Usuário"
                onPress={() => navigation.navigate('Register')}
            />
            <Button
                title="Visualizar Usuários"
                onPress={() => navigation.navigate('UsersList')}
                color="#841584"
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
});
