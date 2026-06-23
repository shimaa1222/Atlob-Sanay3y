<?php

namespace App\Http\Controllers\Api\Craftsman;
use App\Http\Controllers\Controller;
use App\Models\Craft;
use App\Models\Craftsman;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\CraftsmanResource;
use Illuminate\Support\Facades\Validator;
use App\Models\Review;
class CraftsmanController extends Controller
{
    /**
     * قائمة الحرفيين المعتمدين مع فلترة وبحث
     * GET /api/craftsmen
     */
    public function index(Request $request): JsonResponse
    {
        $query = Craftsman::with(['crafts', 'skills'])
            ->approved()
            ->available();

        // فلترة بالمهنة
        if ($request->craft_id) {
            $query->whereHas('crafts', fn ($q) => $q->where('crafts.id', $request->craft_id));
        }

        // فلترة بالمدينة
        if ($request->city) {
            $query->where('city', $request->city);
        }

        // بحث بالاسم
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('bio', 'like', "%{$request->search}%");
            });
        }

        // ترتيب
        $sortBy = $request->get('sort_by', 'rating');
        match ($sortBy) {
            'rating'     => $query->orderByDesc('rating'),
            'reviews'    => $query->orderByDesc('reviews_count'),
            'newest'     => $query->latest(),
            'price_asc'  => $query->orderBy('hourly_rate'),
            'price_desc' => $query->orderByDesc('hourly_rate'),
            default      => $query->orderByDesc('rating'),
        };

        $craftsmen = $query->paginate($request->get('per_page', 12));

        return response()->json([
           'craftsmen' => CraftsmanResource::collection($craftsmen->items()),
            'meta' => [
                'total'        => $craftsmen->total(),
                'current_page' => $craftsmen->currentPage(),
                'last_page'    => $craftsmen->lastPage(),
                'per_page'     => $craftsmen->perPage(),
            ],
        ]);
    }

    /**
     * الحرفيون المميزون (للصفحة الرئيسية)
     * GET /api/craftsmen/featured
     */
    public function featured(): JsonResponse
    {
        $craftsmen = Craftsman::with(['crafts'])
            ->featured()
            ->orderByDesc('rating')//show the best first craftsmen on the home page order by rating
            ->limit(8)
            ->get();

        return response()->json(['craftsmen' => $craftsmen]);
    }

    /**
     * ملف الحرفي الشخصي
     * GET /api/craftsmen/{id}
     */
    public function show(int $id): JsonResponse
    {
        $craftsman = Craftsman::with([
            'crafts',
            'skills',
            'portfolio',
            'services',
            'reviews' => fn ($q) => $q->where('is_visible', true)->latest()->limit(10),
            'reviews.client',
        ])->approved()->findOrFail($id);
        // زيادة عداد المشاهدات (يمكن عمله عبر Redis في الإنتاج)
        // $craftsman->increment('views_count');

        return response()->json([
    'craftsman' => new CraftsmanResource($craftsman)
]);
    }

    /**
     * المهن المتاحة
     * GET /api/crafts
     */
    public function crafts(): JsonResponse
    {
        $crafts = Craft::active()
            ->withCount(['craftsmen' => fn ($q) => $q->approved()])
            ->get();

        return response()->json(['crafts' => $crafts]);
    }

    /**
     * إحصائيات الحرفي (للحرفي نفسه)
     * GET /api/craftsman/stats
     */
    public function myStats(Request $request): JsonResponse
    {
        $user      = $request->user();
        $craftsman = $user->craftsman;

        if (!$craftsman) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $totalEarnings = $craftsman->bookings()
            ->where('status', 'completed')
            ->sum('service_price');

        $completedBookings = $craftsman->bookings()->where('status', 'completed')->count();
        $pendingBookings   = $craftsman->bookings()->where('status', 'pending')->count();
        $cancelledBookings = $craftsman->bookings()->where('status', 'cancelled')->count();

        return response()->json([
            'stats' => [
                'total_earnings'    => $totalEarnings,
                'completed_bookings'=> $completedBookings,
                'pending_bookings'  => $pendingBookings,
                'cancelled_bookings'=> $cancelledBookings,
                'rating'            => $craftsman->rating,
                'reviews_count'     => $craftsman->reviews_count,
                'is_featured'       => $craftsman->is_featured,
            ],
        ]);
    }

    /**
     * تحديث بيانات الحرفي
     * PUT /api/craftsman/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user      = $request->user();
        $craftsman = $user->craftsman;

        if (!$craftsman || !$craftsman->isApproved()) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        // $request->validate([
        //     'bio'           => 'nullable|string|max:1000',
        //     'hourly_rate'   => 'nullable|numeric|min:0',
        //     'city'          => 'nullable|string|max:100',
        //     'district'      => 'nullable|string|max:100',
        //     'full_address'  => 'nullable|string|max:255',
        //     'is_available'  => 'nullable|boolean',
        //     'profile_photo' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        // ]);
        $validator = Validator::make($request->all(), [
    'bio'           => 'nullable|string|max:1000',
    'hourly_rate'   => 'nullable|numeric|min:0',
    'city'          => 'nullable|string|max:100',
    'district'      => 'nullable|string|max:100',
    'full_address'  => 'nullable|string|max:255',
    'is_available'  => 'nullable|boolean',
    'profile_photo' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors' => $validator->errors()
    ], 422);
}

        $data = $request->only(['bio', 'hourly_rate', 'city', 'district', 'full_address', 'is_available']);

        if ($request->hasFile('profile_photo')) {
            if ($craftsman->profile_photo) {
                Storage::disk('public')->delete($craftsman->profile_photo);
            }
            $data['profile_photo'] = $request->file('profile_photo')->store('profiles', 'public');
        }

        $craftsman->update($data);

        // تحديث المهارات
        if ($request->has('skills')) {
            $craftsman->skills()->delete();
            foreach ($request->skills as $skill) {
                \App\Models\CraftsmanSkill::create(['craftsman_id' => $craftsman->id, 'skill' => $skill]);
            }
        }

        return response()->json([
            'message'   => 'تم تحديث الملف الشخصي بنجاح',
            'craftsman' => $craftsman->fresh(['crafts', 'skills']),
        ]);
    }

    public function reviewsList(Request $request): JsonResponse
    {
        $reviews = Review::with(['client:id,name', 'craftsman:id,first_name,last_name'])
            ->latest()
            ->paginate(20);

        return response()->json(['reviews' => $reviews]);
    }
}
