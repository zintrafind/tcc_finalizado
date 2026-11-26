<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
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

        /* ================= CONSULTAS BASE ================= */

        // Anúncios excluídos não entram nos totais e gráficos.
        $produtos = DB::table('tb_produto')
            ->where('st_status', '!=', 'E');

        $usuarios = DB::table('tb_usuario');

        /* ================= USUÁRIOS RECENTES ================= */

        $usuariosAtividades = (clone $usuarios)
            ->select(
                'id_usuario',
                'nm_usuario',
                'st_usuario',
                'created_at'
            )
            ->orderByDesc('created_at')
            ->orderByDesc('id_usuario')
            ->limit(6)
            ->get();

        /* ================= ANÚNCIOS RECENTES ================= */

        $anunciosRecentes = (clone $produtos)
            ->select(
                'id_produto',
                'nm_produto',
                'created_at'
            )
            ->orderByDesc('created_at')
            ->orderByDesc('id_produto')
            ->limit(6)
            ->get();

        /* ================= DENÚNCIAS RECENTES ================= */

        $denunciasRecentes = DB::table('tb_denuncia as d')
            ->leftJoin(
                'tb_produto as p',
                'p.id_produto',
                '=',
                'd.id_produto'
            )
            ->select(
                'd.id_denuncia',
                'd.id_produto',
                'd.ds_motivo',
                'd.ds_denuncia',
                'd.st_denuncia',
                'd.created_at',
                'p.nm_produto'
            )
            ->orderByDesc('d.created_at')
            ->orderByDesc('d.id_denuncia')
            ->limit(6)
            ->get();

        /* ================= ATIVIDADES RECENTES ================= */

        // Reúne eventos de cadastro, publicação e recebimento de denúncias.
        $atividades = collect();

        foreach ($usuariosAtividades as $usuario) {
            $atividades->push([
                'titulo' => 'Novo usuário cadastrado',

                'descricao' =>
                    $usuario->nm_usuario .
                    ' se cadastrou na plataforma.',

                'created_at' => $usuario->created_at,
            ]);
        }

        foreach ($anunciosRecentes as $anuncio) {
            $atividades->push([
                'titulo' => 'Novo anúncio publicado',

                'descricao' =>
                    'O anúncio "' .
                    $anuncio->nm_produto .
                    '" foi publicado.',

                'created_at' => $anuncio->created_at,
            ]);
        }

        foreach ($denunciasRecentes as $denuncia) {
            $descricao = $denuncia->id_produto !== null
                ? 'Denúncia sobre o anúncio "' .
                    ($denuncia->nm_produto ?? 'indisponível') .
                    '".'
                : 'Uma denúncia de usuário foi recebida.';

            if (!empty($denuncia->ds_motivo)) {
                $descricao .= ' Motivo: ' . $denuncia->ds_motivo;
            }

            $atividades->push([
                'titulo' => 'Nova denúncia recebida',
                'descricao' => $descricao,
                'created_at' => $denuncia->created_at,
            ]);
        }

        /* ================= ANÚNCIOS POR CATEGORIA ================= */

        $categorias = DB::table('tb_categoria as c')
            ->leftJoin('tb_produto as p', function ($join) {
                $join
                    ->on(
                        'p.id_categoria',
                        '=',
                        'c.id_categoria'
                    )
                    ->where('p.st_status', '!=', 'E');
            })
            ->select(
                'c.id_categoria',
                'c.nm_categoria'
            )
            ->selectRaw('COUNT(p.id_produto) as total')
            ->groupBy(
                'c.id_categoria',
                'c.nm_categoria'
            )
            ->orderByDesc('total')
            ->orderBy('c.id_categoria')
            ->get();

        $semCategoria = (clone $produtos)
            ->where(function ($query) {
                $query
                    ->whereNull('id_categoria')
                    ->orWhereNotIn(
                        'id_categoria',
                        DB::table('tb_categoria')
                            ->select('id_categoria')
                    );
            })
            ->count();

        if ($semCategoria > 0) {
            $categorias->push((object) [
                'id_categoria' => null,
                'nm_categoria' => 'Sem categoria',
                'total' => $semCategoria,
            ]);
        }

        /* ================= STATUS DOS ANÚNCIOS ================= */

        // A = Disponível
        // N = Em negociação
        // T = Trocado
        // S = Suspenso
        // E = Excluído (não incluído)

        $statusAnuncios = (clone $produtos)
            ->select('st_status')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('st_status')
            ->get();

        /* ================= USUÁRIOS POR MÊS ================= */

        // Últimos seis meses, incluindo o mês atual.
        $mesAtual = now()->startOfMonth();

        $inicioPeriodo = $mesAtual
            ->copy()
            ->subMonths(5);

        $fimPeriodo = $mesAtual
            ->copy()
            ->addMonth();

        $cadastrosPorMes = (clone $usuarios)
            ->selectRaw(
                "DATE_FORMAT(created_at, '%Y-%m') as mes"
            )
            ->selectRaw('COUNT(*) as total')
            ->where('created_at', '>=', $inicioPeriodo)
            ->where('created_at', '<', $fimPeriodo)
            ->groupByRaw(
                "DATE_FORMAT(created_at, '%Y-%m')"
            )
            ->pluck('total', 'mes');

        $nomesMeses = [
            1 => 'Jan',
            2 => 'Fev',
            3 => 'Mar',
            4 => 'Abr',
            5 => 'Mai',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Ago',
            9 => 'Set',
            10 => 'Out',
            11 => 'Nov',
            12 => 'Dez',
        ];

        $usuariosPorMes = [];

        for ($indice = 0; $indice < 6; $indice++) {
            $mes = $inicioPeriodo
                ->copy()
                ->addMonths($indice);

            $chave = $mes->format('Y-m');

            $usuariosPorMes[] = [
                'mes' => $chave,

                'nome' =>
                    $nomesMeses[$mes->month] .
                    '/' .
                    $mes->year,

                'total' => (int) (
                    $cadastrosPorMes[$chave] ?? 0
                ),
            ];
        }

        /* ================= RESPOSTA ================= */

        return response()->json([
            'resumo' => [
                'totalUsuarios' => (clone $usuarios)
                    ->count(),

                'usuariosAtivos' => (clone $usuarios)
                    ->where('st_usuario', 'A')
                    ->count(),

                'totalAnuncios' => (clone $produtos)
                    ->count(),

                'anunciosDisponiveis' => (clone $produtos)
                    ->where('st_status', 'A')
                    ->count(),
            ],

            'usuarios' => $usuariosAtividades
                ->take(5)
                ->values(),

            'denuncias' => $denunciasRecentes
                ->take(5)
                ->values(),

            'atividades' => $atividades
                ->sortByDesc('created_at')
                ->take(6)
                ->values(),

            'usuariosPorMes' => $usuariosPorMes,

            'categorias' => $categorias,

            'status' => $statusAnuncios,
        ])->header('Cache-Control', 'no-store');
    }
}
