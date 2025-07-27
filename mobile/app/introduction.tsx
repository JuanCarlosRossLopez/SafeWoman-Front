import { Link, Stack } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Introduction() {

    return (
        <>
            <Stack.Screen options={{ title: "introducción", headerShown: false }} />
            <SafeAreaView style={styles.section}>
                <View style={styles.container}>
                    {/* Decorative background elements */}
                    <View style={styles.backgroundDecoration1} />
                    <View style={styles.backgroundDecoration2} />
                    <View style={styles.backgroundDecoration3} />
                    
                    <View style={styles.logoContainer}>
                        <View style={styles.logoWrapper}>
                            <Image source={require("@/assets/images/safeWomanBlanco.png")} style={styles.safeLogo} />
                        </View>
                        <Text style={styles.brandText}>SafeWoman</Text>
                    </View>
                    
                    <View style={styles.contentContainer}>
                        <Text style={styles.tagline}>Seguridad en cada paso,</Text>
                        <Text style={styles.taglineSecond}>libertad en cada momento</Text>
                        <View style={styles.decorativeLine} />
                    </View>
                    
                    <View style={styles.formContainer}>
                        <Link href="/login" asChild>
                            <TouchableOpacity style={styles.buttonL} activeOpacity={0.8}>
                                <Text style={styles.textL}>Iniciar sesión</Text>
                            </TouchableOpacity>
                        </Link>
                        <Link href="/register" asChild>
                            <TouchableOpacity style={styles.buttonR} activeOpacity={0.8}>  
                                <Text style={styles.textR}>Registrarse</Text>
                            </TouchableOpacity>
                        </Link>
                        
                        <View style={styles.securityBadge}>
                            <Text style={styles.securityText}>🛡️ Tu seguridad es nuestra prioridad</Text>
                        </View>
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
        position: 'relative',
        overflow: 'hidden',
    },
    container: {
        flex: 1,
        marginLeft: 30,
        marginRight: 30,
        justifyContent: "space-between",
        paddingTop: 60,
        paddingBottom: 40,
    },
    
    // Background decorative elements
    backgroundDecoration1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    backgroundDecoration2: {
        position: 'absolute',
        top: 150,
        left: -80,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    backgroundDecoration3: {
        position: 'absolute',
        bottom: 100,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    
    // Logo section
    logoContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    logoWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 120,
        padding: 20,
    },
    safeLogo: {
        width: 160,
        height: 160,
    },
    brandText: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
        marginTop: 20,
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    
    // Content section
    contentContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    tagline: {
        fontSize: 24,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 5,
    },
    taglineSecond: {
        fontSize: 24,
        fontWeight: '300',
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 32,
        fontStyle: 'italic',
    },
    decorativeLine: {
        width: 80,
        height: 3,
        backgroundColor: 'white',
        marginTop: 20,
        borderRadius: 2,
    },
    
    // Form section
    formContainer: {
        marginTop: 20,
    },
    buttonL: {
        backgroundColor: 'white',
        marginTop: 15,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
        transform: [{ scale: 1 }],
    },
    buttonR: {
        backgroundColor: 'transparent',
        marginTop: 15,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 25,
        borderColor: 'white',
        borderWidth: 2,
        alignItems: 'center',
    },
    textL: {
        color: "#B109C7",
        textAlign: "center",
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    textR: {
        color: "white",
        textAlign: "center",
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    
    // Security badge
    securityBadge: {
        marginTop: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    securityText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});