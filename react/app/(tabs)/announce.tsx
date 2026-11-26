import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import api from "../../services/api.js";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LIMITE_IMAGENS = 5;


export default function AnnounceScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [successModalVisible, setSuccessModalVisible] =
    useState(false);

  const [errorModalVisible, setErrorModalVisible] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [categoryModalVisible, setCategoryModalVisible] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [conditionModalVisible, setConditionModalVisible] =
    useState(false);

  const [selectedCondition, setSelectedCondition] =
    useState("");

  // ============================================================
  // IMAGENS
  // ============================================================

  const [images, setImages] = useState<any[]>([]);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [larguraCarrossel, setLarguraCarrossel] = useState(0);
  const [imagemParaRemover, setImagemParaRemover] = useState<number | null>(null);

  const carouselRef = useRef<FlatList<any>>(null);

  // ============================================================
  // CATEGORIAS
  // ============================================================

  const categories = [
    { id: 1, nome: "Hardware" },
    { id: 2, nome: "Computador e notebook" },
    { id: 3, nome: "Celular e tablet" },
    { id: 4, nome: "Memórias e pen drives" },
    { id: 5, nome: "Fontes e carregadores" },
    { id: 6, nome: "Impressoras e adaptadores" },
    { id: 7, nome: "Consoles e videogames" },
    { id: 8, nome: "Câmeras" },
    { id: 9, nome: "Outros" },
  ];

  // ============================================================
  // CONDIÇÕES
  // ============================================================

  const conditionOptions = [
    "Novo",
    "Seminovo",
    "Usado",
    "Quebrado",
  ];

  // ============================================================
  // SELECIONAR IMAGENS
  // ============================================================

  async function pickImages() {
    const quantidadeDisponivel = LIMITE_IMAGENS - images.length;

    if (quantidadeDisponivel <= 0) {
      setErrorMessage(`Você pode adicionar no máximo ${LIMITE_IMAGENS} imagens por anúncio.`);
      setErrorModalVisible(true);
      return;
    }

    try {
      if (Platform.OS !== "web") {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissao.granted) {
          setErrorMessage("Permita o acesso à galeria para escolher as fotos.");
          setErrorModalVisible(true);
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: quantidadeDisponivel,
        quality: 1,
      });

      if (result.canceled) return;

      const novasImagens = (result.assets || []).slice(0, quantidadeDisponivel);
      const limiteBytes = 5 * 1024 * 1024;

      const imagemMuitoGrande = novasImagens.some(
        (image) => (image.file?.size ?? image.fileSize ?? 0) > limiteBytes
      );

      if (imagemMuitoGrande) {
        throw new Error("Cada imagem deve ter no máximo 5 MB.");
      }

      setImages((anteriores) =>
        [...anteriores, ...novasImagens].slice(0, LIMITE_IMAGENS)
      );
    } catch (error: any) {
      console.log("Erro ao selecionar imagens:", error);
      setErrorMessage(error?.message || "Não foi possível selecionar as imagens.");
      setErrorModalVisible(true);
    }
  }

  // ============================================================
  // REMOVER IMAGEM
  // ============================================================

  function solicitarRemocao() {
    if (images[imagemAtual]) setImagemParaRemover(imagemAtual);
  }

  function confirmarRemocao() {
    if (imagemParaRemover === null) return;

    const indiceRemovido = imagemParaRemover;
    const novasImagens = images.filter((_, index) => index !== indiceRemovido);

    let novoIndice = imagemAtual;
    if (indiceRemovido < imagemAtual) novoIndice -= 1;

    novoIndice = Math.min(
      Math.max(novoIndice, 0),
      Math.max(novasImagens.length - 1, 0)
    );

    setImages(novasImagens);
    setImagemAtual(novoIndice);
    setImagemParaRemover(null);

    requestAnimationFrame(() => {
      if (novasImagens.length > 0 && larguraCarrossel > 0) {
        carouselRef.current?.scrollToOffset({
          offset: novoIndice * larguraCarrossel,
          animated: false,
        });
      }
    });
  }

  // ============================================================
  // NAVEGAÇÃO DO CARROSSEL
  // ============================================================

  function irParaImagem(index: number) {
    if (larguraCarrossel <= 0 || index < 0 || index >= images.length) return;

    setImagemAtual(index);
    carouselRef.current?.scrollToOffset({
      offset: index * larguraCarrossel,
      animated: true,
    });
  }

  function handleScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    if (larguraCarrossel <= 0) return;

    const index = Math.round(
      event.nativeEvent.contentOffset.x / larguraCarrossel
    );

    setImagemAtual(
      Math.min(Math.max(index, 0), Math.max(images.length - 1, 0))
    );
  }

  async function handlePublish() {
  if (loading) return;

  if (
    !title.trim() ||
    !selectedCategory ||
    !selectedCondition
  ) {
    setErrorMessage(
      "Preencha o título, a categoria e a condição da peça."
    );
    setErrorModalVisible(true);
    return;
  }

  if (images.length === 0) {
    setErrorMessage(
      "Adicione pelo menos uma imagem do produto."
    );
    setErrorModalVisible(true);
    return;
  }

  if (images.length > LIMITE_IMAGENS) {
    setErrorMessage(
      `Você pode adicionar no máximo ${LIMITE_IMAGENS} imagens.`
    );
    setErrorModalVisible(true);
    return;
  }

  const limiteBytes = 5 * 1024 * 1024;

  const imagemMuitoGrande = images.some(
    (image) =>
      (image.file?.size ?? image.fileSize ?? 0) >
      limiteBytes
  );

  if (imagemMuitoGrande) {
    setErrorMessage(
      "Cada imagem deve ter no máximo 5 MB."
    );
    setErrorModalVisible(true);
    return;
  }

  setLoading(true);

  try {
    const token =
      (await AsyncStorage.getItem("token")) ||
      (await AsyncStorage.getItem("userToken"));

    if (!token) {
      setErrorMessage(
        "Entre na sua conta para publicar um anúncio."
      );
      setErrorModalVisible(true);
      return;
    }

    const categoryFound = categories.find(
      (cat) => cat.nome === selectedCategory
    );

    if (!categoryFound) {
      setErrorMessage(
        "Selecione uma categoria válida."
      );
      setErrorModalVisible(true);
      return;
    }

    const conditionMap: Record<string, string> = {
      Novo: "N",
      Seminovo: "S",
      Usado: "U",
      Quebrado: "Q",
    };

    const stCondicao =
      conditionMap[selectedCondition];

    if (!stCondicao) {
      setErrorMessage(
        "Selecione uma condição válida."
      );
      setErrorModalVisible(true);
      return;
    }

    const formData = new FormData();

    formData.append(
      "id_categoria",
      String(categoryFound.id)
    );

    formData.append(
      "nm_produto",
      title.trim()
    );

    formData.append(
      "ds_produto",
      description.trim()
    );

    formData.append(
      "st_condicao",
      stCondicao
    );

    formData.append(
      "st_status",
      "A"
    );

    // ========================================================
    // ENVIAR TODAS AS IMAGENS
    // ========================================================

    for (const [index, image] of images.entries()) {
      const nomeArquivo =
        image.fileName ||
        `produto-${index + 1}.jpg`;

      if (image.file) {
        // Expo Web: arquivo selecionado pelo navegador.
        formData.append(
          "imagens[]",
          image.file
        );
      } else if (
        image.uri.startsWith("blob:") ||
        image.uri.startsWith("http") ||
        image.uri.startsWith("data:")
      ) {
        // Converte a URI em um arquivo para envio.
        const response = await fetch(image.uri);
        const blob = await response.blob();

        if (blob.size > limiteBytes) {
          throw new Error(
            `A imagem ${index + 1} ultrapassa o limite de 5 MB.`
          );
        }

        formData.append(
          "imagens[]",
          blob,
          nomeArquivo
        );
      } else {
        // Expo Go: arquivo local do celular.
        formData.append(
          "imagens[]",
          {
            uri: image.uri,
            name: nomeArquivo,
            type:
              image.mimeType ||
              "image/jpeg",
          } as any
        );
      }
    }

    // ========================================================
    // PUBLICAR PRODUTO
    // ========================================================

    await api.post(
      "/products",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ========================================================
    // LIMPAR FORMULÁRIO
    // ========================================================

    setTitle("");
    setDescription("");
    setSelectedCategory("");
    setSelectedCondition("");
    setImages([]);
    setImagemAtual(0);

    carouselRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
    setImagemParaRemover(null);
    setLarguraCarrossel(0);

    setSuccessModalVisible(true);
  } catch (error: any) {
    console.log(
      "ERRO SERVIDOR LARAVEL:",
      error.response?.data || error.message
    );

    const errosValidacao =
      error.response?.data?.errors;

    const mensagensValidacao = errosValidacao
      ? Object.values(errosValidacao)
          .flat()
          .join("\n")
      : "";

    const message =
      mensagensValidacao ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Não foi possível publicar o anúncio.";

    setErrorMessage(message);
    setErrorModalVisible(true);
  } finally {
    setLoading(false);
  }
}

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ====================================================== */}
      {/* TÍTULO */}
      {/* ====================================================== */}

      <Text style={styles.mainTitle}>
        Anunciar
      </Text>

      <Text style={styles.mainSubtitle}>
        Preencha as informações para trocar seu componente.
      </Text>

      {/* ====================================================== */}
      {/* TÍTULO DO ANÚNCIO */}
      {/* ====================================================== */}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Título do Anúncio
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Placa de Vídeo"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          maxLength={60}
        />
      </View>

      {/* ====================================================== */}
      {/* CATEGORIA */}
      {/* ====================================================== */}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Categoria
        </Text>

        <TouchableOpacity
          style={styles.inputPicker}
          onPress={() =>
            setCategoryModalVisible(true)
          }
          activeOpacity={0.7}
        >
          <Text
            style={
              selectedCategory
                ? styles.inputText
                : styles.inputPlaceholder
            }
          >
            {selectedCategory ||
              "Selecione uma categoria"}
          </Text>

          <Feather
            name="chevron-down"
            size={18}
            color="#005386"
          />
        </TouchableOpacity>
      </View>

      {/* ====================================================== */}
      {/* ESTADO DE CONSERVAÇÃO */}
      {/* ====================================================== */}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Estado de Conservação
        </Text>

        <TouchableOpacity
          style={styles.inputPicker}
          onPress={() =>
            setConditionModalVisible(true)
          }
          activeOpacity={0.7}
        >
          <Text
            style={
              selectedCondition
                ? styles.inputText
                : styles.inputPlaceholder
            }
          >
            {selectedCondition ||
              "Selecione o estado da peça"}
          </Text>

          <Feather
            name="chevron-down"
            size={18}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* ====================================================== */}
      {/* IMAGENS DO PRODUTO */}
      {/* ====================================================== */}

      <View style={styles.fieldGroup}>
        <View style={styles.imagesTitleRow}>
          <Text style={styles.label}>Imagens do Produto</Text>
          <Text style={styles.imageCounterTop}>
            {images.length} / {LIMITE_IMAGENS}
          </Text>
        </View>

        <Text style={styles.imagesHelpText}>
          Deslize para visualizar as fotos. Você pode adicionar até 5 imagens ao anúncio.
        </Text>

        {images.length > 0 ? (
          <>
            <View
              style={styles.carouselContainer}
              onLayout={(event) => {
                const largura = event.nativeEvent.layout.width;
                if (largura > 0) setLarguraCarrossel(largura);
              }}
            >
              {larguraCarrossel > 0 && (
                <FlatList
                  ref={carouselRef}
                  style={{ flex: 1 }}
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleScrollEnd}
                  onScrollEndDrag={handleScrollEnd}
                  extraData={larguraCarrossel}
                  keyExtractor={(item, index) => `${item.uri}-${index}`}
                  getItemLayout={(_, index) => ({
                    length: larguraCarrossel,
                    offset: larguraCarrossel * index,
                    index,
                  })}
                  renderItem={({ item, index }) => (
                    <View style={[styles.imageSlide, { width: larguraCarrossel }]}>
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                      />

                      {index === 0 && (
                        <View style={styles.mainImageBadge}>
                          <Feather name="star" size={13} color="#FFFFFF" />
                          <Text style={styles.mainImageText}>Foto principal</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={solicitarRemocao}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel={`Remover foto ${index + 1}`}
                      >
                        <Feather name="x" size={21} color="#D32F2F" />
                      </TouchableOpacity>

                      <View style={styles.slideCounter}>
                        <Text style={styles.slideCounterText}>
                          {index + 1} / {images.length}
                        </Text>
                      </View>
                    </View>
                  )}
                />
              )}

              {images.length > 1 && (
                <>
                  {imagemAtual > 0 && (
                    <TouchableOpacity
                      style={[styles.carouselArrow, styles.carouselArrowLeft]}
                      onPress={() => irParaImagem(imagemAtual - 1)}
                      accessibilityLabel="Foto anterior"
                    >
                      <Feather name="chevron-left" size={26} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}

                  {imagemAtual < images.length - 1 && (
                    <TouchableOpacity
                      style={[styles.carouselArrow, styles.carouselArrowRight]}
                      onPress={() => irParaImagem(imagemAtual + 1)}
                      accessibilityLabel="Próxima foto"
                    >
                      <Feather name="chevron-right" size={26} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {images.length > 1 && (
              <View style={styles.pagination}>
                {images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => irParaImagem(index)}
                    style={styles.dotTouchArea}
                    accessibilityLabel={`Ver foto ${index + 1}`}
                  >
                    <View
                      style={[
                        styles.paginationDot,
                        imagemAtual === index && styles.paginationDotActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

          </>
        ) : (
          <View style={styles.emptyImages}>
            <Feather name="image" size={34} color="#0099FF" />
            <Text style={styles.emptyImagesTitle}>Nenhuma imagem</Text>
            <Text style={styles.emptyImagesText}>
              Adicione pelo menos uma foto para apresentar sua peça.
            </Text>
          </View>
        )}

        {images.length < LIMITE_IMAGENS ? (
          <TouchableOpacity
            style={styles.photosButton}
            onPress={pickImages}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={22} color="#005386" />
            <View style={styles.photosButtonInfo}>
              <Text style={styles.photosButtonText}>
                {images.length === 0 ? "Adicionar fotos" : "Adicionar mais fotos"}
              </Text>
              <Text style={styles.photosButtonSubtext}>
                {LIMITE_IMAGENS - images.length}{" "}
                {LIMITE_IMAGENS - images.length === 1
                  ? "foto disponível"
                  : "fotos disponíveis"}
              </Text>
            </View>
            <Feather name="image" size={22} color="#0099FF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.limitMessage}>
            <Feather name="check-circle" size={18} color="#0099FF" />
            <Text style={styles.limitMessageText}>
              Limite de 5 imagens atingido.
            </Text>
          </View>
        )}
      </View>

            {/* ====================================================== */}
      {/* DESCRIÇÃO */}
      {/* ====================================================== */}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Descrição Detalhada
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          placeholder="Descreva o tempo de uso, defeitos (se houver) ou o que aceita na troca..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          maxLength={500}
        />
      </View>

      {/* ====================================================== */}
      {/* PUBLICAR */}
      {/* ====================================================== */}

      <TouchableOpacity
        style={[
          styles.publishButton,
          loading && {
            opacity: 0.7,
          },
        ]}
        activeOpacity={0.8}
        onPress={handlePublish}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator
            color="#fff"
            size="small"
          />
        ) : (
          <Text
            style={
              styles.publishButtonText
            }
          >
            Publicar Anúncio
          </Text>
        )}
      </TouchableOpacity>

      {/* ====================================================== */}
      {/* MODAL CATEGORIA */}
      {/* ====================================================== */}

      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setCategoryModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalContainer}
          >
            <Text
              style={styles.modalTitle}
            >
              Selecione a Categoria
            </Text>

            {categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCategory(
                    item.nome
                  );

                  setCategoryModalVisible(
                    false
                  );
                }}
              >
                <Text
                  style={
                    styles.modalItemText
                  }
                >
                  {item.nome}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={
                styles.modalCloseButton
              }
              onPress={() =>
                setCategoryModalVisible(
                  false
                )
              }
            >
              <Text
                style={
                  styles.modalCloseButtonText
                }
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ====================================================== */}
      {/* MODAL CONDIÇÃO */}
      {/* ====================================================== */}

      <Modal
        visible={
          conditionModalVisible
        }
        animationType="slide"
        transparent
        onRequestClose={() =>
          setConditionModalVisible(
            false
          )
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalContainer}
          >
            <Text
              style={styles.modalTitle}
            >
              Estado de Conservação
            </Text>

            {conditionOptions.map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={
                    styles.modalItem
                  }
                  onPress={() => {
                    setSelectedCondition(
                      item
                    );

                    setConditionModalVisible(
                      false
                    );
                  }}
                >
                  <Text
                    style={
                      styles.modalItemText
                    }
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              style={
                styles.modalCloseButton
              }
              onPress={() =>
                setConditionModalVisible(
                  false
                )
              }
            >
              <Text
                style={
                  styles.modalCloseButtonText
                }
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={imagemParaRemover !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setImagemParaRemover(null)}
      >
        <View style={styles.centeredOverlay}>
          <View style={styles.dialog}>
            <Feather name="trash-2" size={30} color="#D32F2F" />
            <Text style={styles.dialogTitle}>Remover foto?</Text>
            <Text style={styles.dialogMessage}>
              Esta foto será removida do anúncio. Para concluir, publique o anúncio.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogCancelButton]}
                onPress={() => setImagemParaRemover(null)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.deleteButton]}
                onPress={confirmarRemocao}
              >
                <Text style={styles.whiteButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================================== */}
      {/* MODAL SUCESSO */}
      {/* ====================================================== */}

      <Modal
        animationType="fade"
        transparent={true}
        visible={
          successModalVisible
        }
        onRequestClose={() =>
          setSuccessModalVisible(false)
        }
      >
        <View
          style={
            styles.profileModalOverlay
          }
        >
          <View
            style={
              styles.profileModalContent
            }
          >
            <Text
              style={
                styles.logoutModalTitle
              }
            >
              Anúncio publicado!
            </Text>

            <Text
              style={
                styles.logoutModalSubtitle
              }
            >
              Sua peça foi cadastrada com
              sucesso e já está disponível
              para visualização no
              aplicativo.
            </Text>

            <View
              style={
                styles.modalButtonsRowSingle
              }
            >
              <TouchableOpacity
                style={
                  styles.confirmLogoutButton
                }
                onPress={() => {
                  setSuccessModalVisible(
                    false
                  );

                  router.replace("/");
                }}
              >
                <Text
                  style={
                    styles.confirmLogoutText
                  }
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================================== */}
      {/* MODAL ERRO */}
      {/* ====================================================== */}

      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() =>
          setErrorModalVisible(false)
        }
      >
        <View
          style={
            styles.profileModalOverlay
          }
        >
          <View
            style={
              styles.profileModalContent
            }
          >
            <Text
              style={[
                styles.logoutModalTitle,
                {
                  color: "#E53935",
                },
              ]}
            >
              Anúncio não publicado
            </Text>

            <Text
              style={
                styles.logoutModalSubtitle
              }
            >
              {errorMessage}
            </Text>

            <View
              style={
                styles.modalButtonsRowSingle
              }
            >
              <TouchableOpacity
                style={[
                  styles.confirmLogoutButton,
                  {
                    backgroundColor:
                      "#E53935",
                  },
                ]}
                onPress={() =>
                  setErrorModalVisible(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.confirmLogoutText
                  }
                >
                  Entendi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  mainTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 26,
    color: "#005386",
    marginBottom: 4,
  },

  mainSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },

  fieldGroup: {
    marginBottom: 4,
  },

  label: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
  },

  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0099FF",
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#333333",
    marginBottom: 16,
  },

  inputPicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0099FF",
    marginBottom: 16,
  },

  inputText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#333",
  },

  inputPlaceholder: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#777777",
  },

  // ==========================================================
  // IMAGENS
  // ==========================================================

  imagesTitleRow: {
    marginTop: 20,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  imageCounterTop: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#0099FF",
  },

  imagesHelpText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: "#777777",
    marginBottom: 12,
  },

  carouselContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },

  imageSlide: {
    aspectRatio: 16 / 9,
    position: "relative",
    backgroundColor: "#F5F5F5",
  },

  imagePreview: {
    width: "100%",
    height: "100%",
  },

  mainImageBadge: {
    position: "absolute",
    left: 10,
    top: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(0,83,134,0.88)",
  },

  mainImageText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
  },

  removeImageButton: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
    elevation: 3,
  },

  slideCounter: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  slideCounterText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },

  carouselArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 3,
  },

  carouselArrowLeft: {
    left: 10,
  },

  carouselArrowRight: {
    right: 10,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  dotTouchArea: {
    minWidth: 30,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C7DCE8",
  },

  paginationDotActive: {
    width: 18,
    backgroundColor: "#0099FF",
  },

  emptyImages: {
    minHeight: 160,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BBDFF5",
    borderRadius: 12,
    backgroundColor: "#F8FCFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginBottom: 12,
  },

  emptyImagesTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#005386",
    marginTop: 10,
    marginBottom: 5,
  },

  emptyImagesText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#777777",
    textAlign: "center",
    lineHeight: 18,
  },

  photosButton: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FCFF",
    borderWidth: 1,
    borderColor: "#0099FF",
    borderStyle: "dashed",
    borderRadius: 10,
  },

  photosButtonInfo: {
    flex: 1,
    marginLeft: 10,
  },

  photosButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#005386",
  },

  photosButtonSubtext: {
    marginTop: 3,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#777777",
  },

  limitMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FAFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  limitMessageText: {
    marginLeft: 8,
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#005386",
  },

  // ==========================================================
  // DESCRIÇÃO
  // ==========================================================

  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  // ==========================================================
  // PUBLICAR
  // ==========================================================

  publishButton: {
    backgroundColor: "#005386",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
  },

  publishButtonText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#fff",
  },

  // ==========================================================
  // MODAIS
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },

  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },

  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ececec",
  },

  modalItemText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#444",
  },

  modalCloseButton: {
    marginTop: 16,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  modalCloseButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#2e70b4",
  },

  profileModalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  profileModalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  logoutModalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#005386",
    marginBottom: 8,
    textAlign: "center",
  },

  logoutModalSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  modalButtonsRowSingle: {
    flexDirection: "row",
    width: "100%",
  },

  confirmLogoutButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#0099ff",
    justifyContent: "center",
    alignItems: "center",
  },

  confirmLogoutText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#fff",
  },

  centeredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  dialog: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  dialogTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#005386",
    marginTop: 12,
    marginBottom: 10,
    textAlign: "center",
  },

  dialogMessage: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#555555",
    lineHeight: 21,
    textAlign: "center",
  },

  dialogActions: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },

  dialogButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  dialogCancelButton: {
    backgroundColor: "#F0F3F5",
  },

  deleteButton: {
    backgroundColor: "#D32F2F",
  },

  whiteButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },

  cancelButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#005386",
  },
});