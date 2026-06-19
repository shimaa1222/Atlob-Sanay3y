<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Craftsman;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminCraftsmenController extends Controller
{
    /**
     * GET /admin/craftsmen
     * نفس فلترة AdminController::craftsmenList
     */
    public function index(Request $request)
    {
        $query = Craftsman::with(['crafts', 'approvedBy']);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->city) {
            $query->where('city', $request->city);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $craftsmen = $query->latest()->paginate(15)->withQueryString();

        return view('admin.craftsmen.index', compact('craftsmen'));
    }

    /**
     * GET /admin/craftsmen/{id}
     * نفس AdminController::craftsmanDetail
     */
    public function show(int $id)
    {
        $craftsman = Craftsman::with(['crafts', 'skills', 'approvedBy', 'reviews.client'])
            ->findOrFail($id);

        return view('admin.craftsmen.show', compact('craftsman'));
    }

    /**
     * POST /admin/craftsmen/{id}/approve
     * نفس منطق AdminController::approveCraftsman تماماً (نفس الباسوورد الافتراضي)
     */
    public function approve(Request $request,int $id)
    {
        $craftsman = Craftsman::findOrFail($id);

        if ($craftsman->status !== 'pending') {
            return back()->with('error', 'تم التعامل مع هذا الحرفي مسبقاً');
        }

        if (User::where('email', $craftsman->email)->exists()) {
            return back()->with('error', 'يوجد مستخدم مسجل بنفس الإيميل مسبقاً');
        }

       // $password = ;
$craftsman = Craftsman::findOrFail($id);
      $user = User::create([
    'name'      => $craftsman->first_name . ' ' . $craftsman->last_name,
    'email'     => $craftsman->email,
    'password'  => $craftsman->password,
    'role'      => 'craftsman',
    'phone'     => $craftsman->phone,
    'is_active' => true,
    'email_verified_at' => now(),
]);

        $craftsman->update([
            'user_id'     => $user->id,
            'status'      => 'approved',
            'approved_by' => $request->user('web')->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', "تمت الموافقة على {$craftsman->first_name} وتم إرسال بيانات الدخول على إيميله");
    }

    /**
     * POST /admin/craftsmen/{id}/reject
     * نفس AdminController::rejectCraftsman — بيستخدم Craftsman::reject() اللي بترسل إيميل
     */
    public function reject(Request $request, int $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ], [
            'reason.required' => 'يجب كتابة سبب الرفض',
        ]);

        $craftsman = Craftsman::findOrFail($id);
        $craftsman->reject($request->reason, $request->user('web')->id);

        return back()->with('success', "تم رفض طلب {$craftsman->full_name}");
    }

    /**
     * PATCH /admin/craftsmen/{id}/toggle-status
     * نفس AdminController::toggleCraftsmanStatus
     */
    public function toggleStatus(int $id)
    {
        $craftsman = Craftsman::approved()->findOrFail($id);
        $user      = $craftsman->user;

        $status = 'غير محدد';

        if ($user) {
            $user->update(['is_active' => !$user->is_active]);
            $status = $user->is_active ? 'مفعّل' : 'موقوف';
        }

        return back()->with('success', "تم تغيير حالة الحرفي إلى: {$status}");
    }

    /**
     * PATCH /admin/craftsmen/{id}/toggle-featured
     * نفس AdminController::toggleFeatured
     */
    public function toggleFeatured(int $id)
    {
        $craftsman = Craftsman::approved()->findOrFail($id);
        $craftsman->update(['is_featured' => !$craftsman->is_featured]);

        $status = $craftsman->is_featured ? 'مميز' : 'غير مميز';

        return back()->with('success', "تم تغيير الحرفي إلى: {$status}");
    }
}
