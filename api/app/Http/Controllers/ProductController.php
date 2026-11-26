<?php
namespace App\Http\Controllers;

use App\Models\ImagemProduto;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Lista produtos disponíveis, com pesquisa, filtros e paginação opcional.
     */
    public function index(Request $request)
    {
        $avaliacoesPorUsuario = DB::table('tb_avaliacao')
            ->select('id_avaliado')
            ->selectRaw('AVG(nr_nota) as media_avaliacoes')
            ->selectRaw('COUNT(*) as quantidade_avaliacoes')
            ->whereNotNull('id_avaliado')
            ->groupBy('id_avaliado');

        $query = Product::query()
            ->leftJoinSub($avaliacoesPorUsuario, 'reputacao_usuario', function ($join) {
                $join->on(
                    'tb_produto.id_usuario',
                    '=',
                    'reputacao_usuario.id_avaliado'
                );
            })
            ->select('tb_produto.*')
            ->selectRaw(
                'CASE
                    WHEN reputacao_usuario.media_avaliacoes >= 4.5
                    AND reputacao_usuario.quantidade_avaliacoes >= 3
                    THEN 1
                    ELSE 0
                END as usuario_bem_avaliado'
            )
            ->with($this->relacoes())
            ->where('tb_produto.st_status', 'A');

        // Pesquisa pelo nome ou descrição.
        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('tb_produto.nm_produto', 'LIKE', "%{$search}%")
                    ->orWhere('tb_produto.ds_produto', 'LIKE', "%{$search}%");
            });
        }

        // Filtro por categoria.
        if ($request->filled('category')) {
            $query->where(
                'tb_produto.id_categoria',
                $request->input('category')
            );
        }

        // Filtro por condição.
        if ($request->filled('condition')) {
            $query->where(
                'tb_produto.st_condicao',
                $request->input('condition')
            );
        }

        $query->latest('tb_produto.created_at');

        /*
         * A Home solicita paginate=1.
         * As demais telas continuam recebendo um array normal.
         */
        if ($request->boolean('paginate')) {
            $perPage = (int) $request->input('per_page', 20);

            // Mínimo de 1 e máximo de 50 produtos por página.
            $perPage = max(1, min($perPage, 50));

            return response()->json(
                $query->paginate($perPage),
                200
            );
        }

        return response()->json(
            $query->get(),
            200
        );
    }

    /**
     * Retorna os detalhes e todas as imagens do produto.
     */
    public function show($id)
    {
        $produto = Product::with($this->relacoes())
            ->where('id_produto', $id)
            ->where('st_status', 'A')
            ->first();

        if (!$produto) {
            return response()->json([
                'message' => 'Produto não encontrado.',
            ], 404);
        }

        return response()->json($produto, 200);
    }

    /**
     * Cadastra um produto com uma a cinco imagens.
     *
     * Aceita imagens[] ou o campo antigo imagem.
     */
    public function store(Request $request)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $dados = $request->validate([
            'id_categoria' =>
                'required|integer|exists:tb_categoria,id_categoria',

            'nm_produto' =>
                'required|string|max:100',

            'ds_produto' =>
                'nullable|string|max:255',

            'st_condicao' =>
                'required|in:N,S,U,Q',

            'st_status' =>
                'required|in:A,N,T',

            'imagens' =>
                'nullable|array|max:5',

            'imagens.*' =>
                'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',

            'imagem' =>
                'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ], $this->mensagensValidacao());

        $imagens = array_values(
            $request->file('imagens', [])
        );

        if ($request->hasFile('imagem')) {
            if (count($imagens) > 0) {
                throw ValidationException::withMessages([
                    'imagens' =>
                        'Envie imagens[] ou imagem, sem misturar os dois campos.',
                ]);
            }

            $imagens = [$request->file('imagem')];
        }

        if (count($imagens) < 1) {
            throw ValidationException::withMessages([
                'imagens' =>
                    'Adicione pelo menos uma imagem do produto.',
            ]);
        }

        unset($dados['imagem'], $dados['imagens']);

        $dados['id_usuario'] = $usuario->getAuthIdentifier();

        $arquivosNovos = [];

        try {
            $produto = DB::transaction(function () use (
                $dados,
                $imagens,
                &$arquivosNovos
            ) {
                $produto = Product::create($dados);

                foreach ($imagens as $indice => $arquivo) {
                    $caminho = $arquivo->store(
                        'products',
                        'public'
                    );

                    if (!$caminho) {
                        throw new \RuntimeException(
                            'Não foi possível salvar uma das imagens.'
                        );
                    }

                    $arquivosNovos[] = $caminho;

                    ImagemProduto::create([
                        'id_produto' => $produto->id_produto,
                        'ds_imagem' => $caminho,
                        'nr_ordem' => $indice + 1,
                    ]);
                }

                return $produto;
            });
        } catch (\Throwable $erro) {
            $this->excluirArquivos($arquivosNovos);

            throw $erro;
        }

        $produto->load($this->relacoes());

        return response()->json([
            'message' => 'Produto cadastrado com sucesso!',
            'product' => $produto,
        ], 201);
    }

    /**
     * Lista os anúncios de outro usuário.
     */
    public function productsByUser($id)
    {
        if (!User::find($id)) {
            return response()->json([
                'message' => 'Usuário não encontrado.',
            ], 404);
        }

        $produtos = Product::with($this->relacoes())
            ->where('id_usuario', $id)
            ->whereIn('st_status', ['A', 'N', 'T'])
            ->latest()
            ->get();

        return response()->json($produtos, 200);
    }

    /**
     * Lista os anúncios do usuário autenticado.
     */
    public function myProducts(Request $request)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $query = Product::with($this->relacoes())
            ->where(
                'id_usuario',
                $usuario->getAuthIdentifier()
            );

        if ($request->filled('status')) {
            $status = strtoupper(
                (string) $request->input('status')
            );

            if (!in_array($status, ['A', 'N', 'T'], true)) {
                return response()->json([
                    'message' => 'Status inválido.',
                ], 422);
            }

            $query->where('st_status', $status);
        } else {
            $query->whereIn('st_status', ['A', 'N']);
        }

        return response()->json(
            $query->latest()->get(),
            200
        );
    }

    /**
     * Atualiza a disponibilidade do produto.
     */
    public function updateStatus(Request $request, $id)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $dados = $request->validate([
            'st_status' => 'required|in:A,N,T',
        ], [
            'st_status.required' =>
                'Selecione o status de disponibilidade.',

            'st_status.in' =>
                'Selecione um status válido.',
        ]);

        $produto = DB::transaction(function () use (
            $id,
            $usuario,
            $dados
        ) {
            $produto = Product::where('id_produto', $id)
                ->lockForUpdate()
                ->first();

            if (!$produto) {
                abort(404, 'Produto não encontrado.');
            }

            $this->verificarProprietario($produto, $usuario);

            if ($produto->st_status === 'E') {
                throw ValidationException::withMessages([
                    'st_status' =>
                        'Não é possível alterar um anúncio excluído.',
                ]);
            }

            $produto->update([
                'st_status' => $dados['st_status'],
            ]);

            return $produto;
        });

        $produto->load($this->relacoes());

        return response()->json([
            'message' => 'Status do produto atualizado com sucesso!',
            'product' => $produto,
        ], 200);
    }

    /**
     * Edita dados, adiciona imagens e remove fotos escolhidas.
     */
    public function update(Request $request, $id)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        $dados = $request->validate([
            'id_categoria' =>
                'required|integer|exists:tb_categoria,id_categoria',

            'nm_produto' =>
                'required|string|max:100',

            'ds_produto' =>
                'nullable|string|max:255',

            'st_condicao' =>
                'required|in:N,S,U,Q',

            'st_status' =>
                'required|in:A,N',

            'imagens' =>
                'nullable|array|max:5',

            'imagens.*' =>
                'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',

            'imagens_removidas' =>
                'nullable|array|max:5',

            'imagens_removidas.*' =>
                'required|integer|distinct',
        ], $this->mensagensValidacao());

        $novasImagens = array_values(
            $request->file('imagens', [])
        );

        $idsRemovidos = array_map(
            'intval',
            $dados['imagens_removidas'] ?? []
        );

        unset(
            $dados['imagens'],
            $dados['imagens_removidas']
        );

        $arquivosNovos = [];
        $arquivosRemovidos = [];

        try {
            $produto = DB::transaction(function () use (
                $id,
                $usuario,
                $dados,
                $novasImagens,
                $idsRemovidos,
                &$arquivosNovos,
                &$arquivosRemovidos
            ) {
                $produto = Product::where('id_produto', $id)
                    ->lockForUpdate()
                    ->first();

                if (!$produto) {
                    abort(404, 'Produto não encontrado.');
                }

                $this->verificarProprietario($produto, $usuario);

                if (in_array($produto->st_status, ['T', 'E'], true)) {
                    throw ValidationException::withMessages([
                        'produto' =>
                            'Um anúncio trocado ou excluído não pode ser editado.',
                    ]);
                }

                $imagensAtuais = ImagemProduto::where(
                    'id_produto',
                    $produto->id_produto
                )
                    ->orderBy('nr_ordem')
                    ->orderBy('id_imagem')
                    ->lockForUpdate()
                    ->get();

                $idsAtuais = $imagensAtuais
                    ->pluck('id_imagem')
                    ->map(fn ($idImagem) => (int) $idImagem)
                    ->all();

                if (count(array_diff($idsRemovidos, $idsAtuais)) > 0) {
                    throw ValidationException::withMessages([
                        'imagens_removidas' =>
                            'Uma das imagens não pertence a este anúncio.',
                    ]);
                }

                $imagensMantidas = $imagensAtuais
                    ->reject(function ($imagem) use ($idsRemovidos) {
                        return in_array(
                            (int) $imagem->id_imagem,
                            $idsRemovidos,
                            true
                        );
                    })
                    ->values();

                $totalFinal =
                    $imagensMantidas->count() +
                    count($novasImagens);

                if ($totalFinal < 1 || $totalFinal > 5) {
                    throw ValidationException::withMessages([
                        'imagens' =>
                            'O anúncio precisa ter de uma a cinco imagens.',
                    ]);
                }

                $produto->update([
                    'id_categoria' => $dados['id_categoria'],
                    'nm_produto' => $dados['nm_produto'],
                    'ds_produto' => $dados['ds_produto'] ?? null,
                    'st_condicao' => $dados['st_condicao'],
                    'st_status' => $dados['st_status'],
                ]);

                foreach ($imagensAtuais as $imagem) {
                    if (
                        in_array(
                            (int) $imagem->id_imagem,
                            $idsRemovidos,
                            true
                        )
                    ) {
                        $arquivosRemovidos[] = $imagem->ds_imagem;
                        $imagem->delete();
                    }
                }

                // Mantém a ordem das fotos restantes.
                $ordem = 1;

                foreach ($imagensMantidas as $imagem) {
                    $imagem->update([
                        'nr_ordem' => $ordem,
                    ]);

                    $ordem++;
                }

                // Acrescenta todas as imagens novas.
                foreach ($novasImagens as $arquivo) {
                    $caminho = $arquivo->store(
                        'products',
                        'public'
                    );

                    if (!$caminho) {
                        throw new \RuntimeException(
                            'Não foi possível salvar uma das imagens.'
                        );
                    }

                    $arquivosNovos[] = $caminho;

                    ImagemProduto::create([
                        'id_produto' => $produto->id_produto,
                        'ds_imagem' => $caminho,
                        'nr_ordem' => $ordem,
                    ]);

                    $ordem++;
                }

                return $produto;
            });
        } catch (\Throwable $erro) {
            $this->excluirArquivos($arquivosNovos);

            throw $erro;
        }

        $this->excluirArquivos($arquivosRemovidos);

        $produto->load($this->relacoes());

        return response()->json([
            'message' => 'Anúncio e fotos atualizados com sucesso!',
            'product' => $produto,
        ], 200);
    }

    /**
     * Exclui o anúncio logicamente.
     */
    public function destroy(Request $request, $id)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuário não autenticado.',
            ], 401);
        }

        DB::transaction(function () use ($id, $usuario) {
            $produto = Product::where('id_produto', $id)
                ->lockForUpdate()
                ->first();

            if (!$produto) {
                abort(404, 'Produto não encontrado.');
            }

            $this->verificarProprietario($produto, $usuario);

            $produto->update([
                'st_status' => 'E',
            ]);
        });

        return response()->json([
            'message' => 'Anúncio excluído com sucesso!',
        ], 200);
    }

    /**
     * Relações retornadas pela API.
     */
    private function relacoes(): array
    {
        return [
            'user:id_usuario,nm_usuario,ds_foto_perfil,ds_localizacao',

            'categoria',

            'images' => function ($query) {
                $query->orderBy('nr_ordem')
                    ->orderBy('id_imagem');
            },
        ];
    }

    /**
     * Confere a propriedade do anúncio.
     */
    private function verificarProprietario(
        Product $produto,
        $usuario
    ): void {
        if (
            (string) $produto->id_usuario !==
            (string) $usuario->getAuthIdentifier()
        ) {
            abort(403, 'Você não pode alterar este produto.');
        }
    }

    /**
     * Exclui arquivos sem transformar uma falha de limpeza
     * em erro de uma alteração já confirmada no banco.
     */
    private function excluirArquivos(array $caminhos): void
    {
        foreach (array_unique($caminhos) as $caminho) {
            if (!$caminho) {
                continue;
            }

            $caminho = preg_replace(
                '#^/?storage/#',
                '',
                $caminho
            );

            $caminho = ltrim($caminho, '/');

            try {
                if (!Storage::disk('public')->delete($caminho)) {
                    report(new \RuntimeException(
                        'Não foi possível excluir o arquivo: ' . $caminho
                    ));
                }
            } catch (\Throwable $erro) {
                report($erro);
            }
        }
    }

    /**
     * Mensagens personalizadas de validação.
     */
    private function mensagensValidacao(): array
    {
        return [
            'id_categoria.required' =>
                'A categoria é obrigatória.',

            'id_categoria.exists' =>
                'A categoria selecionada não existe.',

            'nm_produto.required' =>
                'Informe o nome do produto.',

            'nm_produto.max' =>
                'O nome deve ter no máximo 100 caracteres.',

            'ds_produto.max' =>
                'A descrição deve ter no máximo 255 caracteres.',

            'st_condicao.required' =>
                'Selecione o estado de conservação.',

            'st_condicao.in' =>
                'Selecione um estado de conservação válido.',

            'st_status.required' =>
                'Informe o status do anúncio.',

            'st_status.in' =>
                'O status informado não é permitido nesta operação.',

            'imagens.array' =>
                'Envie as imagens como uma lista de arquivos.',

            'imagens.max' =>
                'Você pode enviar no máximo cinco imagens.',

            'imagens.*.required' =>
                'Uma das imagens não foi enviada corretamente.',

            'imagens.*.image' =>
                'Todos os arquivos devem ser imagens válidas.',

            'imagens.*.mimes' =>
                'Use imagens JPG, JPEG, PNG, GIF ou WEBP.',

            'imagens.*.max' =>
                'Cada imagem deve ter no máximo 5 MB.',

            'imagem.image' =>
                'Envie uma imagem válida.',

            'imagem.mimes' =>
                'Use uma imagem JPG, JPEG, PNG, GIF ou WEBP.',

            'imagem.max' =>
                'A imagem deve ter no máximo 5 MB.',

            'imagens_removidas.array' =>
                'Envie os IDs das imagens removidas como uma lista.',

            'imagens_removidas.max' =>
                'Você pode remover no máximo cinco imagens.',

            'imagens_removidas.*.integer' =>
                'O ID de uma imagem removida é inválido.',

            'imagens_removidas.*.distinct' =>
                'Uma imagem foi informada mais de uma vez para remoção.',
        ];
    }
}
