
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// Interceptador para enviar o token de autenticação
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Permite que o Axios configure o Content-Type
    // automaticamente quando utiliza FormData.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para identificar erros da API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", {
      url: error.config?.url,
      metodo: error.config?.method,
      mensagem: error.message,
      status: error.response?.status,
      resposta: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default api;
