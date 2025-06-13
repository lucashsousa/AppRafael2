import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import FormScreen from './screens/FormScreen'
const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
                <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: "Cadastro" }} />
                <Stack.Screen name="form" component={FormScreen} options={{ title: "form" }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
