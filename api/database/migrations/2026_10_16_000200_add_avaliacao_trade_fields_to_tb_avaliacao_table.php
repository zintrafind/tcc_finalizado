
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tb_avaliacao')) {
            return;
        }

        // Adiciona somente as colunas que ainda não existem.
        Schema::table('tb_avaliacao', function (Blueprint $table) {
            if (!Schema::hasColumn('tb_avaliacao', 'id_proposta')) {
                $table->integer('id_proposta')->nullable()->after('id_avaliacao');
                $table->index('id_proposta');
            }

            if (!Schema::hasColumn('tb_avaliacao', 'id_avaliador')) {
                $table->integer('id_avaliador')->nullable()->after('id_proposta');
                $table->index('id_avaliador');
            }

            if (!Schema::hasColumn('tb_avaliacao', 'id_avaliado')) {
                $table->integer('id_avaliado')->nullable()->after('id_avaliador');
                $table->index('id_avaliado');
            }
        });

        // Verifica se cada chave estrangeira já existe.
        $foreignKeyExists = function ($column) {
            return DB::table('information_schema.KEY_COLUMN_USAGE')
                ->whereRaw('TABLE_SCHEMA = DATABASE()')
                ->where('TABLE_NAME', 'tb_avaliacao')
                ->where('COLUMN_NAME', $column)
                ->whereNotNull('REFERENCED_TABLE_NAME')
                ->exists();
        };

        if (!$foreignKeyExists('id_proposta')) {
            Schema::table('tb_avaliacao', function (Blueprint $table) {
                $table->foreign('id_proposta', 'fk_avaliacao_proposta')
                    ->references('id_proposta')
                    ->on('tb_proposta')
                    ->onDelete('cascade');
            });
        }

        if (!$foreignKeyExists('id_avaliador')) {
            Schema::table('tb_avaliacao', function (Blueprint $table) {
                $table->foreign('id_avaliador', 'fk_avaliacao_avaliador')
                    ->references('id_usuario')
                    ->on('tb_usuario')
                    ->onDelete('cascade');
            });
        }

        if (!$foreignKeyExists('id_avaliado')) {
            Schema::table('tb_avaliacao', function (Blueprint $table) {
                $table->foreign('id_avaliado', 'fk_avaliacao_avaliado')
                    ->references('id_usuario')
                    ->on('tb_usuario')
                    ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('tb_avaliacao')) {
            return;
        }

        $foreignKeys = [
            'id_proposta' => 'fk_avaliacao_proposta',
            'id_avaliador' => 'fk_avaliacao_avaliador',
            'id_avaliado' => 'fk_avaliacao_avaliado',
        ];

        foreach ($foreignKeys as $column => $constraint) {
            $exists = DB::table('information_schema.KEY_COLUMN_USAGE')
                ->whereRaw('TABLE_SCHEMA = DATABASE()')
                ->where('TABLE_NAME', 'tb_avaliacao')
                ->where('CONSTRAINT_NAME', $constraint)
                ->exists();

            if ($exists) {
                Schema::table('tb_avaliacao', function (Blueprint $table) use ($constraint) {
                    $table->dropForeign($constraint);
                });
            }
        }

        $columns = [];

        foreach (array_keys($foreignKeys) as $column) {
            if (Schema::hasColumn('tb_avaliacao', $column)) {
                $columns[] = $column;
            }
        }

        if (!empty($columns)) {
            Schema::table('tb_avaliacao', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};
