
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tb_avaliacao')) {
            return;
        }

        Schema::table('tb_avaliacao', function (Blueprint $table) {
            if (Schema::hasColumn('tb_avaliacao', 'id_usuario')) {
                $table->integer('id_usuario')->nullable()->change();
            }

            if (Schema::hasColumn('tb_avaliacao', 'id_produto')) {
                $table->integer('id_produto')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tb_avaliacao')) {
            return;
        }

        Schema::table('tb_avaliacao', function (Blueprint $table) {
            if (Schema::hasColumn('tb_avaliacao', 'id_usuario')) {
                $table->integer('id_usuario')->nullable(false)->change();
            }

            if (Schema::hasColumn('tb_avaliacao', 'id_produto')) {
                $table->integer('id_produto')->nullable(false)->change();
            }
        });
    }
};
