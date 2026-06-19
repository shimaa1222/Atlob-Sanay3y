<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('otp_codes');
    }


    public function down(): void
    {
        // لو احتجت ترجع الجدول
        Schema::create('otp_codes', function (Blueprint $table) {

            $table->id();
            $table->string('email')->index();
            $table->string('code', 6);
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamps();

        });
    }
};
