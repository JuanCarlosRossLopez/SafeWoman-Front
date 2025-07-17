import { Link, Stack } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Introduction() {

    return (
        <>
            <Stack.Screen options={{ title: "introducción" }} />
            <SafeAreaView style={styles.section}>
                <View style={styles.container}>
                    <View>
                        <Image source={require("@/assets/images/safeWomanBlanco.png")} style={styles.safeLogo} />
                    </View>
                    <View style={{ marginTop: 30 }}>
                        <Text style={styles.textDefault}>Seguridad en cada paso, libertad en cada momento</Text>
                    </View>
                    <View style={styles.formContainer}>
                        <Link href="/login" asChild>
                        <TouchableOpacity style={styles.buttonL}>
                                <Text style={styles.textL}>Iniciar sesión</Text>
                        </TouchableOpacity>
                        </Link>
                        <Link href="/register" asChild>
                        <TouchableOpacity style={styles.buttonR}>  
                                <Text style={styles.textR}>Registrarse</Text>
                        </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    section: {
        flex: 1,
        backgroundColor: "#B109C7",
    },
    container: {
        flex: 1,
        marginLeft: 40,
        marginRight: 40,
        justifyContent: "center",
    },
    safeLogo: {
        width: 200,
        height: 200,
        alignSelf: "center",
    },
    logoText: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },
    textTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    textDefault: {
        fontSize: 25,
        textAlign: "left",
        color: "white",
    },
    formContainer: {
        marginTop: 30,
    },
    buttonL: {
        backgroundColor: 'white',
        marginTop: 20,
        padding: 10,
        borderRadius: 15,
        alignItems: 'center',
    },
    buttonR: {
        backgroundColor: 'transparent',
        marginTop: 20,
        padding: 10,
        borderRadius: 15,
        borderColor: 'white',
        borderWidth: 1,
        alignItems: 'center',

    },
    textL: {
        color: "#B109C7",
        textAlign: "center",
        fontSize: 16,
    },
    textR: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
    },
    
});