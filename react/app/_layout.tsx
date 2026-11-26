
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";

import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Slot, useRouter, useSegments } from "expo-router";

import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const [showSplash, setShowSplash] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  // Animação nativa no Android e compatível com Web.
  const useNativeDriver = Platform.OS !== "web";

  // Animação inicial da logo.
  useEffect(() => {
    if (!loaded) return;

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver,
        }),

        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 45,
          useNativeDriver,
        }),
      ]),

      Animated.delay(600),

      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setShowSplash(false);
      }
    });

    return () => {
      animation.stop();
    };
  }, [loaded, opacity, scale, useNativeDriver]);

  // Verificação da sessão do usuário.
  useEffect(() => {
    if (!loaded || showSplash) return;

    let ativo = true;

    const verificarSessao = async () => {
      try {
        const primeiroSegmento = segments[0];

        // Usuário está nas telas de autenticação.
        if (primeiroSegmento === "(auth)") {
          if (ativo) setCheckingSession(false);
          return;
        }

        const token = await AsyncStorage.getItem("token");

        if (!ativo) return;

        if (!token) {
          router.replace("/login");
          return;
        }

        setCheckingSession(false);
      } catch (error) {
        console.log("Erro ao verificar sessão:", error);

        if (ativo) {
          router.replace("/login");
        }
      }
    };

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, [loaded, showSplash, segments, router]);

  // Carregamento das fontes.
  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0099FF" />
      </View>
    );
  }

  // Tela inicial.
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.Image
          source={require("../assets/images/logogrande.png")}
          style={[
            styles.splashLogo,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Verificação da sessão.
  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0099FF" />
      </View>
    );
  }

  const primeiroSegmento = segments[0];

  const estaNoAuth = primeiroSegmento === "(auth)";

  const pathnameAtual = segments.join("/");

  const isHome =
    pathnameAtual === "(tabs)" ||
    pathnameAtual === "(tabs)/index";

  const isAnnounce = pathnameAtual === "(tabs)/announce";
  const isMensagens = pathnameAtual === "mensagens";
  const isTrocas = pathnameAtual === "trocas";
  const isPerfil = pathnameAtual === "perfil";

  const showNavigation =
    !estaNoAuth &&
    (
      isHome ||
      isAnnounce ||
      isMensagens ||
      isTrocas ||
      isPerfil
    );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>

      {showNavigation && (
        <View
          style={[
            styles.bottomNav,
            {
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* INÍCIO */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.7}
          >
            <Feather
              name="home"
              size={24}
              color={isHome ? "#005386" : "#777777"}
            />
          </TouchableOpacity>

          {/* MENSAGENS */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/mensagens")}
            activeOpacity={0.7}
          >
            <View style={styles.messagesTouchArea}>
              <Feather
                name="message-circle"
                size={24}
                color={isMensagens ? "#005386" : "#777777"}
              />
            </View>
          </TouchableOpacity>

          {/* ANUNCIAR */}
          <TouchableOpacity
            style={styles.navItemCenter}
            onPress={() => router.push("/(tabs)/announce")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#003B66", "#005386", "#0099FF"]}
              locations={[0, 0.45, 1]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.announceButton}
            >
              <Feather
                name="plus"
                size={28}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* TROCAS */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/trocas")}
            activeOpacity={0.7}
          >
            <Feather
              name="repeat"
              size={24}
              color={isTrocas ? "#005386" : "#777777"}
            />
          </TouchableOpacity>

          {/* PERFIL */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/perfil")}
            activeOpacity={0.7}
          >
            <Feather
              name="user"
              size={24}
              color={isPerfil ? "#005386" : "#777777"}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  splashContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  splashLogo: {
    width: 280,
    height: 280,
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flex: 1,
  },

  bottomNav: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    overflow: "visible",
  },

  navItem: {
    flex: 1,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  messagesTouchArea: {
    width: 74,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  navItemCenter: {
    flex: 1,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },

  announceButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -15,

    ...Platform.select({
      web: {
        boxShadow: "0px 5px 9px rgba(0, 83, 134, 0.30)",
      },
      default: {
        shadowColor: "#005386",
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 9,
        elevation: 7,
      },
    }),
  },
});
