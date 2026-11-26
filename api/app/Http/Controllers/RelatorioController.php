<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RelatorioController extends Controller
{
    public function index(Request $request)
    {
        /* ================= PERMISSÃO ================= */

        $administrador = $request->user();

        abort_unless(
            $administrador &&
            $administrador->tp_usuario === 'A' &&
            $administrador->st_usuario === 'A',
            403,
            'Somente administradores ativos podem acessar os relatórios.'
        );

        /* ================= USUÁRIOS ================= */

        $usuarios = DB::table('tb_usuario')
            ->select(
                'id_usuario',
                'nm_usuario',
                'email',
                'st_usuario',
                'created_at'
            )
            ->orderByDesc('created_at')
            ->orderByDesc('id_usuario')
            ->get();

        /* ================= ANÚNCIOS ================= */

        $anuncios = DB::table('tb_produto as p')
            ->leftJoin(
                'tb_usuario as u',
                'u.id_usuario',
                '=',
                'p.id_usuario'
            )
            ->leftJoin(
                'tb_categoria as c',
                'c.id_categoria',
                '=',
                'p.id_categoria'
            )
            ->select(
                'p.id_produto',
                'p.nm_produto',
                'p.st_status',
                'p.created_at'
            )
            ->selectRaw(
                "COALESCE(u.nm_usuario, 'Usuário indisponível')
                as dono_anuncio"
            )
            ->selectRaw(
                "COALESCE(c.nm_categoria, 'Sem categoria')
                as nome_categoria"
            )
            ->orderByDesc('p.created_at')
            ->orderByDesc('p.id_produto')
            ->get();

        /* ================= RESPOSTA ================= */

        return response()->json([
            'usuarios' => $usuarios,
            'anuncios' => $anuncios,
        ])->header('Cache-Control', 'no-store');
    }
}
