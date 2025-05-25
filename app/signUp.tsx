import { Link, Stack } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
    return (
        <>
            <Stack.Screen options={{ title: 'signUp' }} />
            <SafeAreaView style={styles.section}>
                <View style={styles.container}>
                    <View>
                        <Image source={require('@/assets/images/iconoSW.png')} style={styles.safeLogo} />
                        <Text style={styles.logoText}>Safewoman</Text>
                    </View>
                    <View style={{ marginTop: 30 }}>
                        <Text style={styles.textTitle}>Registrate ahora</Text>
                        <Text style={styles.textDefault}>Da el primer paso hacia tu seguridad</Text>
                    </View>
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre completo"
                            placeholderTextColor="gray"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor="gray"
                            keyboardType='email-address'
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Número"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor="gray"
                            secureTextEntry={true}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar contraseña"
                            placeholderTextColor="gray"
                            secureTextEntry={true}
                        />
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.text}>Registrarse</Text>
                        </TouchableOpacity>
                        <View style={styles.textNavigate}>
                            <Text style={styles.textQuestion}>¿Ya tienes cuenta?</Text>
                            <Link href="/login" asChild>
                                <Text style={styles.textRegister}>Inicia sesión</Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    section: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        marginLeft: 40,
        marginRight: 40,
        justifyContent: 'center',
    },
    safeLogo: {
        alignSelf: 'center',
        width: 130,
        height: 130,
    },
    logoText: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#B109C7',
        marginTop: 10,
    },
    textTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#28303F',
    },
    textDefault: {
        fontSize: 16,
        color: '#5F5F5F',
        marginTop: 8,
    },
    input: {
        width: '100%',
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#ACA9A9',
        fontSize: 16,
    },
    formContainer: {
        marginTop: 30,
        gap: 30,
    },
    button: {
        backgroundColor: '#B109C7',
        padding: 10,
        borderRadius: 15,
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
    },
    textQuestion: {
        fontSize: 16,
        color: '#5F5F5F',
    },
    textRegister: {
        fontSize: 16,
        color: '#B109C7',
        fontWeight: 'semibold',
    },
    textNavigate: {
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    }
})
