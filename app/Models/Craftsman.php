<?php

namespace App\Models;
use Illuminate\Support\Facades\Log;
use App\Mail\CraftsmanApprovedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Mail\CraftsmanRejectedMail;
use Illuminate\Notifications\Notifiable;
use App\Notifications\CraftsmanApprovedNotification;
class Craftsman extends Model
{
    use HasFactory, SoftDeletes,Notifiable;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'national_id_front',
        'national_id_back',
        'profile_photo',
        'country',
        'city',
        'district',
        'full_address',
        'bio',
        'hourly_rate',
        'rating',
        'reviews_count',
        'status',
        'rejection_reason',
        'approved_at',
        'approved_by',
        'is_featured',
        'is_available',
        'district',
         'latitude',
         'longitude',
    ];

    // مهم: لازم نخفي الباسورد المُشفّرة من أي استجابة JSON
    // عشان مش هتظهر في حاجة زي ملف الحرفي الشخصي أو لوحة الأدمن
    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'approved_at'  => 'datetime',
        'is_featured'  => 'boolean',
        'is_available' => 'boolean',
        'rating'       => 'decimal:2',
        'hourly_rate'  => 'decimal:2',
    ];

    // ========================
    // Relationships
    // ========================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function crafts()
    {
        return $this->belongsToMany(Craft::class, 'craftsman_crafts')
                    ->withPivot('is_primary')
                    ->withTimestamps();
    }

    public function primaryCraft()
    {
        return $this->belongsToMany(Craft::class, 'craftsman_crafts')
                    ->wherePivot('is_primary', true)
                    ->withTimestamps();
    }

    public function skills()
    {
        return $this->hasMany(CraftsmanSkill::class);
    }

    public function portfolio()
    {
        return $this->hasMany(CraftsmanPortfolio::class);
    }

    public function services()
    {
        return $this->hasMany(CraftsmanService::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function postResponses()
    {
        return $this->hasMany(PostResponse::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ========================
    // Scopes
    // ========================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('status', 'approved');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)->where('status', 'approved');
    }

    // ========================
    // Helpers
    // ========================

    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getProfilePhotoUrlAttribute(): string
    {
        if ($this->profile_photo) {
            return asset('storage/' . $this->profile_photo);
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->full_name) . '&color=2563eb&background=dbeafe';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * يتم استدعاؤها عند موافقة الأدمن على الحرفي
     * تقوم بإنشاء حساب User وإرسال إشعار بالموافقة بالإيميل
     * تستخدم نفس كلمة المرور اللي اختارها الحرفي وقت التسجيل
     *
     * ملاحظة مهمة: موديل User فيه cast 'password' => 'hashed'، يعني لو استخدمنا
     * User::create() هتتشفّر الباسورد تاني فوق التشفير الأصلي (تشفير مزدوج)
     * وده هيكسر تسجيل الدخول بعدين. عشان كذا بنستخدم DB::table()->insert()
     * مباشرة هنا، لأن الباسورد المخزّنة في جدول craftsmen أصلاً متشفّرة بالفعل.
     */
    public function approve(int $adminId): bool
    {
        // الباسورد محفوظة بالفعل مُشفّرة (hashed) من وقت التسجيل
        // لو لأي سبب كانت غير موجودة (بيانات قديمة قبل هذا التعديل)، نولّد باسورد عشوائية كحل بديل
        $hashedPassword = $this->password ?: bcrypt(\Illuminate\Support\Str::random(10));

        $userId = \Illuminate\Support\Facades\DB::table('users')->insertGetId([
            'name'       => $this->full_name,
            'email'      => $this->email,
            'password'   => $hashedPassword,
            'role'       => 'craftsman',
            'phone'      => $this->phone,
            'is_active'  => true,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // تحديث بيانات الحرفي
        $this->update([
            'user_id'     => $userId,
            'status'      => 'approved',
            'approved_at' => now(),
            'approved_by' => $adminId,
        ]);
   $this->notify(new CraftsmanApprovedNotification());

        // إرسال إشعار الموافقة بالإيميل (بدون كلمة المرور، لأنه هو اللي اختارها بنفسه)
    //    Mail::to($this->email)
    //      ->send(new CraftsmanApprovedMail($this));
     return true;
    }

    /**
     * رفض تسجيل الحرفي مع سبب الرفض
     */
   public function reject(string $reason, int $adminId): bool
{
    $this->update([
        'status'           => 'rejected',
        'rejection_reason' => $reason,
        'approved_by'      => $adminId,
    ]);

    try {
        Mail::to($this->email)
            ->send(new CraftsmanRejectedMail($this->fresh(), $reason));
    } catch (\Exception $e) {
       Log::error('Mail failed: ' . $e->getMessage());
    }

    return true;
}

    /**
     * تحديث التقييم الإجمالي للحرفي
     */
    public function updateRating(): void
    {
        $avg   = $this->reviews()->avg('rating') ?? 0;
        $count = $this->reviews()->count();
        $this->update([
            'rating'        => round($avg, 2),
            'reviews_count' => $count,
        ]);
    }
    public function routeNotificationForMail()
{
    return $this->email;
}
}
