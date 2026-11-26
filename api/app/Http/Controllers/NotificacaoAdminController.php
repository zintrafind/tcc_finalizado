<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class NotificacaoAdminController extends Controller
{
    /* ================= VERIFICAR ADMINISTRADOR ================= */

    private function administrador(Request $request)
    {
        $usuario = $request->user();

        abort_unless(
            $usuario &&
            $usuario->tp_usuario === 'A' &&
            $usuario->st_usuario === 'A',
            403,
            'Acesso exclusivo de administradores ativos.'
        );

        return $usuario;
    }

    /* ================= CONSULTA DAS NOTIFICAÇÕES ================= */

    private function consulta(int $idAdministrador)
    {
        return DB::table('tb_denuncia as d')
            ->leftJoin(
                'tb_usuario as denunciado',
                'denunciado.id_usuario',
                '=',
                'd.id_usuario_denunciado'
            )
            ->leftJoin(
                'tb_denuncia_leitura as leitura',
                function ($join) use ($idAdministrador) {
                    $join
                        ->on(
                            'leitura.id_denuncia',
                            '=',
                            'd.id_denuncia'
                        )
                        ->where(
                            'leitura.id_administrador',
                            '=',
                            $idAdministrador
                        );
                }
            )
            // Notificações referentes a denúncias de usuários.
            ->whereNotNull('d.id_usuario_denunciado');
    }

    /* ================= LISTAR E CONTAR ================= */

    public function index(Request $request)
    {
        $administrador = $this->administrador($request);

        $consulta = $this->consulta(
            (int) $administrador->id_usuario
        );

        $naoLidas = (clone $consulta)
            ->whereNull('leitura.id_denuncia')
            ->count();

        $notificacoes = (clone $consulta)
            ->select(
                'd.id_denuncia',
                'd.id_usuario_denunciado',
                'd.ds_motivo',
                'd.ds_denuncia',
                'd.st_denuncia',
                'd.created_at',
                'denunciado.nm_usuario as nome_denunciado',
                'leitura.lida_em'
            )
            // Mostra primeiro as não lidas.
            ->orderByRaw(
                'CASE WHEN leitura.id_denuncia IS NULL THEN 0 ELSE 1 END'
            )
            ->orderByDesc('d.created_at')
            ->orderByDesc('d.id_denuncia')
            ->limit(20)
            ->get()
            ->map(function ($denuncia) {
                return [
                    'id' => $denuncia->id_denuncia,

                    'titulo' => 'Nova denúncia de usuário',

                    'usuario_denunciado' =>
                        $denuncia->nome_denunciado ??
                        'Usuário indisponível',

                    'id_usuario_denunciado' =>
                        $denuncia->id_usuario_denunciado,

                    'motivo' => $denuncia->ds_motivo,

                    'descricao' => $denuncia->ds_denuncia,

                    'status_denuncia' => $denuncia->st_denuncia,

                    'data' => $denuncia->created_at,

                    'lida' => $denuncia->lida_em !== null,

                    'lida_em' => $denuncia->lida_em,
                ];
            });

        return response()->json([
            // Total de não lidas, mesmo além dos 20 itens exibidos.
            'nao_lidas' => $naoLidas,
            'notificacoes' => $notificacoes,
        ])->header('Cache-Control', 'no-store');
    }

    /* ================= MARCAR COMO LIDA ================= */

    public function marcarLida(Request $request, string $id)
    {
        $administrador = $this->administrador($request);

        $denuncia = DB::table('tb_denuncia')
            ->where('id_denuncia', $id)
            ->whereNotNull('id_usuario_denunciado')
            ->first();

        abort_unless(
            $denuncia,
            404,
            'Notificação não encontrada.'
        );

        // A chave composta impede leituras duplicadas.
        // Se já estiver lida, mantém a data original.
        DB::table('tb_denuncia_leitura')->insertOrIgnore([
            'id_administrador' => $administrador->id_usuario,
            'id_denuncia' => $denuncia->id_denuncia,
            'lida_em' => now(),
        ]);

        $naoLidas = $this->consulta(
            (int) $administrador->id_usuario
        )
            ->whereNull('leitura.id_denuncia')
            ->count();

        return response()->json([
            'message' => 'Notificação marcada como lida.',
            'id' => $denuncia->id_denuncia,
            'lida' => true,
            'nao_lidas' => $naoLidas,
        ])->header('Cache-Control', 'no-store');
    }

    /* ================= DETALHES DA DENÚNCIA ================= */

public function show(Request $request, string $id)
{
    $administrador = $this->administrador($request);

    $denuncia = DB::table('tb_denuncia as d')
        ->leftJoin(
            'tb_usuario as denunciado',
            'denunciado.id_usuario',
            '=',
            'd.id_usuario_denunciado'
        )
        ->leftJoin(
            'tb_denuncia_leitura as leitura',
            function ($join) use ($administrador) {
                $join
                    ->on(
                        'leitura.id_denuncia',
                        '=',
                        'd.id_denuncia'
                    )
                    ->where(
                        'leitura.id_administrador',
                        '=',
                        $administrador->id_usuario
                    );
            }
        )
        ->where('d.id_denuncia', $id)
        ->whereNotNull('d.id_usuario_denunciado')
        ->select(
            'd.id_denuncia',
            'd.id_usuario_denunciado',
            'd.ds_motivo',
            'd.ds_denuncia',
            'd.st_denuncia',
            'd.created_at',
            'denunciado.nm_usuario as nome_denunciado',
            'leitura.lida_em'
        )
        ->first();

    abort_unless(
        $denuncia,
        404,
        'Denúncia não encontrada.'
    );

    $imagens = DB::table('tb_imagem_denuncia')
        ->where('id_denuncia', $denuncia->id_denuncia)
        ->orderBy('nr_ordem')
        ->get()
        ->map(function ($imagem) use ($denuncia) {
            return [
                'ordem' => (int) $imagem->nr_ordem,

                // O JavaScript buscará este endereço com o token.
                'caminho' =>
                    '/admin/notificacoes/' .
                    $denuncia->id_denuncia .
                    '/imagens/' .
                    $imagem->nr_ordem,
            ];
        });

    return response()->json([
        'id' => $denuncia->id_denuncia,

        'titulo' => 'Denúncia de usuário',

        'id_usuario_denunciado' =>
            $denuncia->id_usuario_denunciado,

        'usuario_denunciado' =>
            $denuncia->nome_denunciado ??
            'Usuário indisponível',

        'motivo' => $denuncia->ds_motivo,

        'descricao' => $denuncia->ds_denuncia,

        'status_denuncia' => $denuncia->st_denuncia,

        'data' => $denuncia->created_at,

        'lida' => $denuncia->lida_em !== null,

        'imagens' => $imagens,
    ])->header('Cache-Control', 'no-store');
}

/* ================= VISUALIZAR EVIDÊNCIA ================= */

public function imagem(
    Request $request,
    string $id,
    string $ordem
) {
    $this->administrador($request);

    $denunciaExiste = DB::table('tb_denuncia')
        ->where('id_denuncia', $id)
        ->whereNotNull('id_usuario_denunciado')
        ->exists();

    abort_unless(
        $denunciaExiste,
        404,
        'Denúncia não encontrada.'
    );

    // Busca somente a imagem pertencente à denúncia selecionada.
    $imagem = DB::table('tb_imagem_denuncia')
        ->where('id_denuncia', $id)
        ->where('nr_ordem', $ordem)
        ->first();

    abort_unless(
        $imagem,
        404,
        'Imagem não encontrada.'
    );

    $caminho = (string) $imagem->ds_imagem;

    // Aceita o formato gerado pelo store():
    // ID_DA_DENUNCIA/nome-do-arquivo.extensao
    $partes = explode('/', $caminho);

    abort_unless(
        count($partes) === 2 &&
        $partes[0] === (string) $id &&
        $partes[1] !== '' &&
        $partes[1] !== '.' &&
        $partes[1] !== '..' &&
        !str_contains($caminho, '\\') &&
        !str_contains($caminho, "\0"),
        404,
        'Caminho da imagem inválido.'
    );

    $disco = Storage::disk('denuncias');

    abort_unless(
        $disco->exists($caminho),
        404,
        'O arquivo da imagem não está disponível.'
    );

    $mime = $disco->mimeType($caminho);

    abort_unless(
        in_array(
            $mime,
            [
                'image/jpeg',
                'image/png',
                'image/webp',
            ],
            true
        ),
        415,
        'Formato de imagem não permitido.'
    );

    return $disco->response(
        $caminho,
        basename($caminho),
        [
            'Content-Type' => $mime,
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ],
        'inline'
    );
}
}
