<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
        'is_active',
        'phone_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    // ========================
    // Relationships
    // ========================

    public function craftsman()
    {
        return $this->hasOne(Craftsman::class);
    }

    public function bookingsAsClient()
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function servicePosts()
    {
        return $this->hasMany(ServicePost::class, 'client_id');
    }

    // ========================
    // Helpers
    // ========================

    public function isAdmin(): bool      { return $this->role === 'admin'; }
    public function isClient(): bool     { return $this->role === 'client'; }
    public function isCraftsman(): bool  { return $this->role === 'craftsman'; }

    public function hasVerifiedPhone(): bool
    {
        return !is_null($this->phone_verified_at);
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name)
             . '&color=2563eb&background=dbeafe&size=128';
    }

    // ========================
    // MustVerifyEmail override
    // ========================

    /**
     * نتخطى الـ email verification للأدمن فقط
     */
    public function hasVerifiedEmail(): bool
    {
        if ($this->isAdmin()) return true;
        return parent::hasVerifiedEmail();
    }
}
