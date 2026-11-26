<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class HistoricoInteracaoController extends Controller
{
    public function index(Request $request)
    {
        /* ================= ACESSO DO ADMINISTRADOR ================= */

        abort_unless(
            $request->user() &&
            $request->user()->tp_usuario === 'A',
            403,
            'Acesso exclusivo do administrador.'
        );

        /* ================= VALIDAÇÃO DOS FILTROS ================= */

        $regras = [
            'busca' => [
                'nullable',
                'string',
                'max:200',
            ],

            'tipo' => [
                'nullable',
                Rule::in([
                    'usuario',
                    'anuncio',
                    'troca',
                    'interacao',
                ]),
            ],

            'inicio' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'fim' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'page' => [
                'nullable',
                'integer',
                'min:1',
            ],
        ];

        if ($request->filled('inicio')) {
            $regras['fim'][] = 'after_or_equal:inicio';
        }

        $filtros = $request->validate(
            $regras,
            [
                'tipo.in' =>
                    'Selecione um tipo de atividade válido.',

                'inicio.date_format' =>
                    'Informe uma data inicial válida.',

                'fim.date_format' =>
                    'Informe uma data final válida.',

                'fim.after_or_equal' =>
                    'A data final deve ser igual ou posterior à data inicial.',

                'busca.max' =>
                    'A pesquisa deve ter no máximo 200 caracteres.',

                'page.integer' =>
                    'A página deve ser um número inteiro.',

                'page.min' =>
                    'A página deve ser maior ou igual a 1.',
            ]
        );

        /* ================= CADASTROS DE USUÁRIOS ================= */

        $usuarios = DB::table('tb_usuario as u')
            ->selectRaw("
                CONCAT('usuario-', u.id_usuario) AS id,
                'usuario' AS tipo,
                'Novo usuário cadastrado' AS titulo,
                COALESCE(u.nm_usuario, 'Usuário indisponível') AS usuario,
                'Cadastro de conta na plataforma.' AS descricao,
                u.created_at AS data
            ");

        /* ================= PUBLICAÇÕES DE ANÚNCIOS ================= */

        $anuncios = DB::table('tb_produto as p')
            ->leftJoin(
                'tb_usuario as u',
                'u.id_usuario',
                '=',
                'p.id_usuario'
            )
            ->selectRaw("
                CONCAT('anuncio-', p.id_produto) AS id,
                'anuncio' AS tipo,
                'Novo anúncio publicado' AS titulo,
                COALESCE(u.nm_usuario, 'Usuário indisponível') AS usuario,
                CONCAT(
                    'Publicação do anúncio: ',
                    COALESCE(p.nm_produto, 'Sem nome'),
                    '.'
                ) AS descricao,
                p.created_at AS data
            ");

        /* ================= SOLICITAÇÕES DE TROCA ================= */

        $trocas = DB::table('tb_proposta as p')
            ->leftJoin(
                'tb_usuario as solicitante',
                'solicitante.id_usuario',
                '=',
                'p.id_solicitante'
            )
            ->leftJoin(
                'tb_usuario as destinatario',
                'destinatario.id_usuario',
                '=',
                'p.id_destinatario'
            )
            ->selectRaw("
                CONCAT('troca-', p.id_proposta) AS id,
                'troca' AS tipo,
                'Nova solicitação de troca' AS titulo,
                COALESCE(
                    solicitante.nm_usuario,
                    'Usuário indisponível'
                ) AS usuario,
                CONCAT(
                    'Proposta #',
                    p.id_proposta,
                    ' enviada para ',
                    COALESCE(
                        destinatario.nm_usuario,
                        'usuário indisponível'
                    ),
                    '.'
                ) AS descricao,
                p.created_at AS data
            ");

        /* ================= INTERAÇÕES REGISTRADAS ================= */

        $interacoes = DB::table('tb_historico_interacao as h')
            ->leftJoin(
                'tb_usuario as u',
                'u.id_usuario',
                '=',
                'h.id_usuario'
            )
            ->leftJoin(
                'tb_produto as p',
                'p.id_produto',
                '=',
                'h.id_produto'
            )
            ->selectRaw("
                CONCAT('interacao-', h.id_historico) AS id,
                'interacao' AS tipo,
                'Interação registrada' AS titulo,
                COALESCE(u.nm_usuario, 'Usuário indisponível') AS usuario,
                CONCAT(
                    'Tipo registrado: ',
                    COALESCE(h.tp_interacao, 'Não informado'),
                    '. Anúncio: ',
                    COALESCE(p.nm_produto, 'Indisponível'),
                    '.'
                ) AS descricao,
                h.created_at AS data
            ");

        /* ================= REUNIR OS EVENTOS ================= */

        $eventos = $usuarios
            ->unionAll($anuncios)
            ->unionAll($trocas)
            ->unionAll($interacoes);

        $consulta = DB::query()
            ->fromSub($eventos, 'eventos')
            ->select('eventos.*');

        /* ================= FILTRAR POR TIPO ================= */

        if (!empty($filtros['tipo'])) {
            $consulta->where(
                'eventos.tipo',
                $filtros['tipo']
            );
        }

        /* ================= FILTRAR POR PESQUISA ================= */

        $busca = trim($filtros['busca'] ?? '');

        if ($busca !== '') {
            // Trata %, _ e ! como caracteres da pesquisa.
            $buscaEscapada = str_replace(
                ['!', '%', '_'],
                ['!!', '!%', '!_'],
                $busca
            );

            $termo = '%' . $buscaEscapada . '%';

            $consulta->where(function ($query) use ($termo) {
                $query
                    ->whereRaw(
                        "eventos.usuario LIKE ? ESCAPE '!'",
                        [$termo]
                    )
                    ->orWhereRaw(
                        "eventos.titulo LIKE ? ESCAPE '!'",
                        [$termo]
                    )
                    ->orWhereRaw(
                        "eventos.descricao LIKE ? ESCAPE '!'",
                        [$termo]
                    );
            });
        }

        /* ================= FILTRAR POR DATA INICIAL ================= */

        if (!empty($filtros['inicio'])) {
            $inicio = Carbon::parse(
                $filtros['inicio']
            )->startOfDay();

            $consulta->where(
                'eventos.data',
                '>=',
                $inicio
            );
        }

        /* ================= FILTRAR POR DATA FINAL ================= */

        if (!empty($filtros['fim'])) {
            // Inclui todo o dia final selecionado.
            $fimExclusivo = Carbon::parse(
                $filtros['fim']
            )
                ->startOfDay()
                ->addDay();

            $consulta->where(
                'eventos.data',
                '<',
                $fimExclusivo
            );
        }

        /* ================= ORDENAÇÃO E PAGINAÇÃO ================= */

        $historico = $consulta
            ->orderByDesc('eventos.data')
            ->orderByDesc('eventos.id')
            ->paginate(10)
            ->withQueryString();

        /* ================= RESPOSTA ================= */

        return response()
            ->json($historico)
            ->header('Cache-Control', 'no-store');
    }
}
