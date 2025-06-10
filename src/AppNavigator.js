import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UsersListScreen from './screens/UsersListScreen';

// Geral
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
                <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: "Cadastro" }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Menu" }} />
                <Stack.Screen name="UsersList" component={UsersListScreen} options={{ title: "Usuários Cadastrados" }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
