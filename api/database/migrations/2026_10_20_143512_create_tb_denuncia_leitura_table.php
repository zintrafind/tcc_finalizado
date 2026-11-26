
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tb_denuncia_leitura')) {
            return;
        }

        Schema::create('tb_denuncia_leitura', function (Blueprint $table) {
            // Administrador que leu a denúncia.
            // Mesmo tipo de tb_usuario.id_usuario.
            $table->integer('id_administrador');

            // Denúncia correspondente.
            // Mesmo tipo de tb_denuncia.id_denuncia.
            $table->integer('id_denuncia');

            // Data e hora da leitura.
            $table->timestamp('lida_em')->useCurrent();

            // Uma leitura por administrador e denúncia.
            $table->primary(
                ['id_administrador', 'id_denuncia'],
                'pk_denuncia_leitura'
            );

            $table->index('id_denuncia', 'idx_denuncia_leitura');

            $table->foreign(
                'id_administrador',
                'fk_denuncia_leitura_administrador'
            )
                ->references('id_usuario')
                ->on('tb_usuario')
                ->onDelete('cascade');

            $table->foreign(
                'id_denuncia',
                'fk_denuncia_leitura_denuncia'
            )
                ->references('id_denuncia')
                ->on('tb_denuncia')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_denuncia_leitura');
    }
};
