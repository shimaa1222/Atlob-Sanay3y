<?php

namespace App\Http\Controllers\API\Notification;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications  🔒
     *
     * قائمة إشعارات المستخدم
     *
     * Query Params:
     *   ?unread_only=true    ← اختياري - الغير مقروء فقط
     *   ?per_page=20         ← default 20
     *
     * Response 200:
     * {
     *   "notifications": [
     *     {
     *       "id": "uuid-123",
     *       "type": "NewBookingNotification",
     *       "data": {
     *         "message": "حجز جديد من محمد أحمد",
     *         "booking_id": 5
     *       },
     *       "is_read": false,
     *       "created_at": "منذ 5 دقائق"
     *     }
     *   ],
     *   "unread_count": 3,
     *   "meta": {
     *     "total": 15,
     *     "current_page": 1,
     *     "last_page": 1,
     *     "per_page": 20
     *   }
     * }
     *
     * أنواع الإشعارات (type):
     *   NewBookingNotification                ← حجز جديد (حرفي)
     *   BookingStatusUpdatedNotification      ← تحديث حالة حجز (عميل)
     *   NewCraftsmanRegistrationNotification  ← طلب حرفي جديد (أدمن)
     *   NewServicePostNotification            ← منشور جديد (حرفي)
     *   NewPostResponseNotification           ← رد على منشور (عميل)
     *   NewMessageNotification                ← رسالة جديدة
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = $request->boolean('unread_only')
            ? $user->unreadNotifications()
            : $user->notifications();

        $notifications = $query->paginate($request->get('per_page', 20));

        $formatted = $notifications->getCollection()->map(fn($n) => [
            'id'         => $n->id,
            // 'type'       => class_basename($n->type),
            'type' => $n->data['type'] ?? class_basename($n->type),
            'data'       => $n->data,
            'is_read'    => !is_null($n->read_at),
            'created_at' => $n->created_at->diffForHumans(),
        ]);

        return response()->json([
            'notifications' => $formatted,
            'unread_count'  => $user->unreadNotifications()->count(),
            'meta'          => [
                'total'        => $notifications->total(),
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'per_page'     => $notifications->perPage(),
            ],
        ]);
    }

    // ================================================================

    /**
     * GET /api/notifications/count  🔒
     *
     * عدد الإشعارات غير المقروءة (للـ badge في الـ UI)
     *
     * Response 200:
     *   { "unread_count": 7 }
     */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    // ================================================================

    /**
     * PATCH /api/notifications/{id}/read  🔒
     *
     * تحديد إشعار كمقروء
     *
     * Response 200:
     *   { "message": "تم تحديد الإشعار كمقروء" }
     *
     * Response 404:
     *   { "message": "الإشعار غير موجود" }
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['message' => 'تم تحديد الإشعار كمقروء']);
    }

    // ================================================================

    /**
     * POST /api/notifications/read-all  🔒
     *
     * تحديد جميع الإشعارات كمقروءة
     *
     * Response 200:
     *   { "message": "تم تحديد 5 إشعارات كمقروءة", "count": 5 }
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $request->user()->unreadNotifications()->count();
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'message' => "تم تحديد {$count} إشعارات كمقروءة",
            'count'   => $count,
        ]);
    }

    // ================================================================

    /**
     * DELETE /api/notifications/{id}  🔒
     *
     * حذف إشعار واحد
     *
     * Response 200:
     *   { "message": "تم حذف الإشعار" }
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return response()->json(['message' => 'تم حذف الإشعار']);
    }

    // ================================================================

    /**
     * DELETE /api/notifications  🔒
     *
     * حذف جميع الإشعارات المقروءة
     *
     * Response 200:
     *   { "message": "تم حذف 10 إشعارات", "count": 10 }
     */
    public function clearAll(Request $request): JsonResponse
    {
        $count = $request->user()->readNotifications()->count();
        $request->user()->readNotifications()->delete();

        return response()->json([
            'message' => "تم حذف {$count} إشعارات",
            'count'   => $count,
        ]);
    }
}
