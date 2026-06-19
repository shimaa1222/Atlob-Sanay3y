<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_codes', function (Blueprint $table) {

            $table->id();

            // البريد الذي تم إرسال OTP له
            $table->string('email')->index();

            // كود OTP (6 أرقام)
            $table->string('code', 6);

            // مدة صلاحية الكود
            $table->timestamp('expires_at');

            // هل تم استخدام الكود أم لا
            $table->boolean('used')
                ->default(false);

            // عدد المحاولات الخاطئة
            $table->unsignedTinyInteger('attempts')
                ->default(0);

            $table->timestamps();


            // يساعد في البحث عن آخر OTP فعال للإيميل
            $table->index([
                'email',
                'used'
            ]);

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};
