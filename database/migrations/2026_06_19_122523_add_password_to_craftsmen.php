<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('craftsmen', function (Blueprint $table) {
            // نخزّن الباسورد اللي كتبه الحرفي وقت التسجيل
            // عشان نستخدمها لما الأدمن يوافق عليه (approve) في إنشاء حساب User
            $table->string('password')->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('craftsmen', function (Blueprint $table) {
            $table->dropColumn('password');
        });
    }
};
