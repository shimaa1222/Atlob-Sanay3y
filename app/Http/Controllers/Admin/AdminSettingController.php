<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use App\Models\Booking;
use App\Models\Craftsman;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminSettingsController extends Controller
{
    /**
     * GET /api/admin/settings  🔒👑
     *
     * جلب جميع إعدادات الموقع
     *
     * Response 200:
     * {
     *   "settings": {
     *     "platform_fee_percent": "10",
     *     "booking_cancellation_hours": "24",
     *     "max_images_per_post": "5",
     *     "auto_approve_craftsmen": "0",
     *     "maintenance_mode": "0",
     *     "support_email": "support@sanay3y.com",
     *     "support_phone": "+966500000000",
     *     "otp_expiry_minutes": "5",
     *     "max_otp_attempts": "3",
     *     "max_portfolio_images": "12",
     *     "featured_craftsmen_limit": "8"
     *   }
     * }
     */
    public function index(): JsonResponse
    {
        $settings = Cache::remember('admin_settings', 3600, function () {
            return AdminSetting::pluck('value', 'key');
        });

        return response()->json(['settings' => $settings]);
    }

    // ================================================================

    /**
     * PUT /api/admin/settings  🔒👑
     *
     * تحديث إعدادات الموقع
     *
     * Request (يمكن إرسال أي مجموعة من هذه الحقول):
     * {
     *   "platform_fee_percent":       10,
     *   "booking_cancellation_hours": 24,
     *   "max_images_per_post":        5,
     *   "auto_approve_craftsmen":     false,
     *   "maintenance_mode":           false,
     *   "support_email":              "support@sanay3y.com",
     *   "support_phone":              "+966500000000",
     *   "otp_expiry_minutes":         5,
     *   "max_otp_attempts":           3,
     *   "max_portfolio_images":       12,
     *   "featured_craftsmen_limit":   8
     * }
     *
     * Response 200:
     * {
     *   "message": "تم حفظ الإعدادات بنجاح",
     *   "settings": { ... }
     * }
     */
    public function update(Request $request): JsonResponse
    {
        $validated=$request->validate([
            'platform_fee_percent'       => 'nullable|numeric|min:0|max:50',
            'booking_cancellation_hours' => 'nullable|integer|min:1|max:168',
            'max_images_per_post'        => 'nullable|integer|min:1|max:20',
            'auto_approve_craftsmen'     => 'nullable|boolean',
            'maintenance_mode'           => 'nullable|boolean',
            'support_email'              => 'nullable|email',
            'support_phone'              => 'nullable|string|max:20',
            'otp_expiry_minutes'         => 'nullable|integer|min:1|max:30',
            'max_otp_attempts'           => 'nullable|integer|min:1|max:10',
            'max_portfolio_images'       => 'nullable|integer|min:1|max:50',
            'featured_craftsmen_limit'   => 'nullable|integer|min:1|max:20',
        ]);
        foreach ($validated as $key => $value) {
            if ($value === null) continue;
            AdminSetting::updateOrCreate(
                ['key'   => $key],
                ['value' => is_bool($value) ? (int)$value : $value]
            );
        }

        Cache::forget('admin_settings');

        return response()->json([
            'message'  => 'تم حفظ الإعدادات بنجاح',
            'settings' => AdminSetting::pluck('value', 'key'),
        ]);
    }

    // ================================================================

    /**
     * GET /api/admin/settings/stats  🔒👑
     *
     * إحصائيات متقدمة للأدمن
     *
     * Response 200:
     * {
     *   "revenue": {
     *     "total": 50000,
     *     "this_month": 8000,
     *     "last_month": 7200,
     *     "growth_percent": 11.1
     *   },
     *   "users": {
     *     "total": 500,
     *     "new_this_week": 23,
     *     "clients": 420,
     *     "craftsmen": 80
     *   },
     *   "bookings": {
     *     "total": 350,
     *     "completed": 274,
     *     "completion_rate": 78.3
     *   },
     *   "top_craftsmen": [
     *     { "id":1, "first_name":"أحمد", "last_name":"النجار", "rating":4.9, "city":"الرياض", "completed_count":45 }
     *   ]
     * }
     */
    public function advancedStats(): JsonResponse
    {
        $thisMonthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd   = now()->subMonth()->endOfMonth();

        $revenueThis = Booking::where('status', 'completed')
            ->where('created_at', '>=', $thisMonthStart)
            ->sum('platform_fee');

        $revenueLast = Booking::where('status', 'completed')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('platform_fee');

        $growth = $revenueLast > 0
            ? round((($revenueThis - $revenueLast) / $revenueLast) * 100, 1)
            : 0;

        $totalBookings     = Booking::count();
        $completedBookings = Booking::where('status', 'completed')->count();

        $topCraftsmen = Craftsman::approved()
            ->withCount(['bookings as completed_count' => fn($q) => $q->where('status', 'completed')])
            ->orderByDesc('completed_count')
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'rating', 'city']);

        return response()->json([
            'revenue' => [
                'total'          => Booking::where('status', 'completed')->sum('platform_fee'),
                'this_month'     => $revenueThis,
                'last_month'     => $revenueLast,
                'growth_percent' => $growth,
            ],
            'users' => [
                'total'         => User::count(),
                'new_this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
                'clients'       => User::where('role', 'client')->count(),
                'craftsmen'     => User::where('role', 'craftsman')->count(),
            ],
            'bookings' => [
                'total'           => $totalBookings,
                'completed'       => $completedBookings,
                'completion_rate' => $totalBookings > 0
                    ? round(($completedBookings / $totalBookings) * 100, 1)
                    : 0,
            ],
            'top_craftsmen' => $topCraftsmen,
        ]);
    }

    // ================================================================

    /**
     * POST /api/admin/users/{id}/impersonate  🔒👑
     *
     * الأدمن يدخل كمستخدم آخر (للدعم الفني)
     *
     * Response 200:
     * {
     *   "message": "تم إنشاء جلسة مؤقتة لـ محمد أحمد",
     *   "token": "3|impersonate_token...",
     *   "user": { "id": 5, "name": "محمد أحمد", "role": "client" },
     *   "expires": "ساعة واحدة"
     * }
     */
    public function impersonate(int $userId): JsonResponse
    {
        $user  = User::findOrFail($userId);
        $token = $user->createToken('admin_impersonate', ['*'], now()->addHour())
                      ->plainTextToken;

        return response()->json([
            'message' => 'تم إنشاء جلسة مؤقتة لـ ' . $user->name,
            'token'   => $token,
            'user'    => ['id' => $user->id, 'name' => $user->name, 'role' => $user->role],
            'expires' => 'ساعة واحدة',
        ]);
    }
}
