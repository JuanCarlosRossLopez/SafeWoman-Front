import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  name?: string;
};

export default function UserHeader({ name }: Props) {
  return (
    <View style={styles.userBox}>
      <Image source={require("../../assets/images/usericon.png")} style={styles.avatar} />
      <View>
        <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>
        <Text style={styles.userName}>{name || "Usuario"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userBox: {
    backgroundColor: "#f3d9f9",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    gap: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  avatar: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B109C7",
    marginTop: 4,
  },
});
