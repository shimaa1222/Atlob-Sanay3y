<?php

namespace App\Models;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    protected $fillable = [
        'email',
        'code',
        'expires_at',
        'used',
        'attempts',
    ];


    protected $casts = [
        'expires_at' => 'datetime',
        'used'       => 'boolean',
    ];


    /**
     * هل الكود انتهت صلاحيته؟
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }


    /**
     * هل الكود صالح للاستخدام؟
     */
    public function isValid(): bool
    {
        return !$this->used
            && !$this->isExpired()
            && $this->attempts < 5;
    }


    /**
     * تعليم الكود كمستخدم
     */
    public function markAsUsed(): void
    {
        $this->update([
            'used' => true
        ]);
    }


    /**
     * حذف الأكواد القديمة
     */
    public static function cleanup(): int
    {
        // return static::where('expires_at','<',now()->subHour())->delete();
        $query = static::where('expires_at', '<', now()->subHour());

return $query->delete();
    }
}
