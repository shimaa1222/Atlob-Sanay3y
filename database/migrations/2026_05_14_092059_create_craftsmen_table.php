<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('craftsmen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone', 20);
            $table->string('national_id_front'); // مسار صورة الوجه الأمامي للهوية
            $table->string('national_id_back');  // مسار صورة الوجه الخلفي للهوية
            $table->string('profile_photo')->nullable();
            $table->string('country')->default('مصر');
            $table->string('city');
            $table->string('district')->nullable(); // الحي / الحي
            $table->string('full_address')->nullable();
            $table->text('bio')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            // pending = في انتظار موافقة الأدمن
            // approved = تمت الموافقة، يتم إنشاء حساب المستخدم
            // rejected = تم الرفض
            $table->string('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('crafts', function (Blueprint $table) {
            $table->id();
            $table->string('name');          // اسم المهنة (سباكة، كهرباء، نجارة...)
            $table->string('name_en')->nullable();
            $table->string('icon')->nullable(); // أيقونة المهنة
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // جدول ربط الحرفيين بالمهن (حرفي واحد يمكنه أن يمتلك أكثر من مهنة)
        Schema::create('craftsman_crafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('craftsman_id')->constrained()->onDelete('cascade');
            $table->foreignId('craft_id')->constrained()->onDelete('cascade');
            $table->boolean('is_primary')->default(false); // المهنة الرئيسية
            $table->timestamps();
            $table->unique(['craftsman_id', 'craft_id']);
        });

        // مهارات الحرفي
        Schema::create('craftsman_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('craftsman_id')->constrained()->onDelete('cascade');
            $table->string('skill'); // تركيب أنابيب، إصلاح تسربات...
            $table->timestamps();
        });

        // معرض أعمال الحرفي
        Schema::create('craftsman_portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('craftsman_id')->constrained()->onDelete('cascade');
            $table->string('image');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // الخدمات التي يقدمها الحرفي
        Schema::create('craftsman_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('craftsman_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price_from', 10, 2);
            $table->string('price_label')->nullable(); // "يبدأ من"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('craftsman_services');
        Schema::dropIfExists('craftsman_portfolios');
        Schema::dropIfExists('craftsman_skills');
        Schema::dropIfExists('craftsman_crafts');
        Schema::dropIfExists('crafts');
        Schema::dropIfExists('craftsmen');
    }
};
