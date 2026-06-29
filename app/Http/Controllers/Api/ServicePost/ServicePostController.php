<?php

namespace App\Http\Controllers\API\ServicePost;
use App\Notifications\OfferAcceptedNotification;
use App\Http\Controllers\Controller;
use App\Models\PostResponse;
use App\Models\ServicePost;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Notifications\NewServicePostNotification;
use Illuminate\Support\Facades\DB;

class ServicePostController extends Controller
{
    /**
     * قائمة المنشورات النشطة - تظهر للحرفيين فقط
     * GET /api/service-posts
     */
    public function index(Request $request): JsonResponse
    {
        // فقط الحرفيون المعتمدون يمكنهم رؤية المنشورات
        $user = $request->user();
        if (!$user->isCraftsman() && !$user->isAdmin()) {
            return response()->json(['message' => 'هذه الصفحة للحرفيين فقط'], 403);
        }

        $query = ServicePost::with(['client:id,name,avatar', 'craft', 'images'])
            ->active()
            ->forCraftsmen();

        // فلترة بالمدينة
        if ($request->city) {
            $query->where('city', $request->city);
        }

        // فلترة بالمهنة
        if ($request->craft_id) {
            $query->where('craft_id', $request->craft_id);
        }

        // فلترة بالإلحاحية
        if ($request->urgency) {
            $query->where('urgency', $request->urgency);
        }

        // بحث
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('custom_craft', 'like', "%{$request->search}%");
            });
        }

        $posts = $query->paginate(10);

        // نضيف معلومة إذا كان الحرفي قد رد مسبقاً
        if ($user->craftsman) {
            $craftsmanId = $user->craftsman->id;
            $posts->getCollection()->transform(function ($post) use ($craftsmanId) {
                $post->already_responded = $post->responses()
                    ->where('craftsman_id', $craftsmanId)
                    ->exists();
                return $post;
            });
        }

        return response()->json(['posts' => $posts]);
    }

    /**
     * إنشاء منشور جديد (العميل فقط)
     * POST /api/service-posts
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isClient()) {
            return response()->json(['message' => 'فقط العملاء يمكنهم نشر طلبات'], 403);
        }

        $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'required|string|max:2000',
            'craft_id'    => 'nullable|exists:crafts,id',
            'custom_craft'=> 'nullable|string|max:100',
            'location'    => 'nullable|string|max:255',
            'city'        => 'nullable|string|max:100',
            'budget_from' => 'nullable|numeric|min:0',
            'budget_to'   => 'nullable|numeric|min:0|gte:budget_from',
            'needed_by'   => 'nullable|date|after_or_equal:today',
            'urgency'     => 'in:low,medium,high,emergency',
            'images'      => 'nullable|array|max:5',
            'images.*'    => 'file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $post = ServicePost::create([
            'client_id'    => $user->id,
            'title'        => $request->title,
            'description'  => $request->description,
            'craft_id'     => $request->craft_id,
            'custom_craft' => $request->custom_craft,
            'location'     => $request->location,
            'city'         => $request->city,
            'budget_from'  => $request->budget_from,
            'budget_to'    => $request->budget_to,
            'needed_by'    => $request->needed_by,
            'urgency'      => $request->urgency ?? 'medium',
            'status'       => 'active',
            'is_approved'  => true,
        ]);

        // رفع الصور
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('post_images', 'public');
                \App\Models\PostImage::create(['post_id' => $post->id, 'image' => $path]);
            }
        }

        // إشعار الحرفيين في نفس المدينة
        // (في الإنتاج: يمكن عملها عبر Queue)
        if ($post->city) {
            $craftsmen = \App\Models\Craftsman::approved()
                ->where('city', $post->city)
                ->with('user')
                ->limit(50)
                ->get();

            foreach ($craftsmen as $craftsman) {
                if ($craftsman->user) {
                    $craftsman->user->notify(
                        new \App\Notifications\NewServicePostNotification($post)
                    );
                }
            }
        }

        return response()->json([
            'message' => 'تم نشر طلبك بنجاح! سيتواصل معك الحرفيون المناسبون قريباً.',
            'post'    => $post->load(['craft', 'images']),
        ], 201);
    }

    /**
     * تفاصيل منشور
     * GET /api/service-posts/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $post = ServicePost::with([
            'client:id,name,avatar',
            'craft',
            'images',
            'responses.craftsman',
        ])->findOrFail($id);

        // العملاء يرون منشوراتهم الخاصة فقط
        $user = $request->user();
        if ($user->isClient() && $post->client_id !== $user->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $post->incrementViews();

        return response()->json(['post' => $post]);
    }

    /**
     * منشورات العميل الخاصة
     * GET /api/my-posts
     */
    public function myPosts(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isClient()) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $posts = ServicePost::with(['craft', 'images', 'responses'])
            ->where('client_id', $user->id)
            ->latest()
            ->paginate(10);

        return response()->json(['posts' => $posts]);
    }

    /**
     * رد الحرفي على منشور
     * POST /api/service-posts/{id}/respond
     */
    public function respond(Request $request, int $id): JsonResponse
    {
        $user      = $request->user();
        $craftsman = $user->craftsman;

        if (!$craftsman || !$craftsman->isApproved()) {
            return response()->json(['message' => 'فقط الحرفيون المعتمدون يمكنهم الرد'], 403);
        }

        $post = ServicePost::active()->findOrFail($id);

        // التحقق من عدم الرد مسبقاً
        if ($post->responses()->where('craftsman_id', $craftsman->id)->exists()) {
            return response()->json(['message' => 'لقد قمت بالرد على هذا المنشور مسبقاً'], 422);
        }

        $request->validate([
            'message'        => 'required|string|max:1000',
            'offered_price'  => 'nullable|numeric|min:0',
            'estimated_days' => 'nullable|integer|min:1',
        ]);

        $response = PostResponse::create([
            'post_id'        => $post->id,
            'craftsman_id'   => $craftsman->id,
            'message'        => $request->message,
            'offered_price'  => $request->offered_price,
            'estimated_days' => $request->estimated_days,
            'status'         => 'pending',
        ]);

        // إشعار العميل بوجود رد جديد
        $post->client->notify(
            new \App\Notifications\NewPostResponseNotification($post, $response)
        );


        return response()->json([
            'message'  => 'تم إرسال ردك بنجاح! سيتواصل معك العميل قريباً.',
            'response' => $response->load('craftsman'),
        ], 201);
    }

    /**
     * قبول أو رفض رد حرفي (العميل)
     * PATCH /api/service-posts/{postId}/responses/{responseId}
     */
//     public function updateResponse(Request $request, int $postId, int $responseId): JsonResponse
//     {
//         $request->validate(['status' => 'required|in:accepted,rejected']);
//         $post = ServicePost::where('client_id', $request->user()->id)->findOrFail($postId);


//         $response = PostResponse::where('post_id', $post->id)->findOrFail($responseId);
//         $response->update(['status' => $request->status]);
//         $craftsmanUser = $response->craftsman->user;

// $craftsmanUser->notify(
//     new OfferAcceptedNotification($post, $response)
// );

//         // إذا قبل العميل الرد، نغلق المنشور
//         if ($request->status === 'accepted') {
//             $post->update(['status' => 'closed']);
//         }

//         return response()->json([
//             'message'  => $request->status === 'accepted' ? 'تم قبول عرض الحرفي' : 'تم رفض العرض',
//             'response' => $response->fresh(),
//         ]);
//     }

public function updateResponse(
    Request $request,
    int $postId,
    int $responseId
): JsonResponse
{
    $request->validate([
        'status' => 'required|in:accepted,rejected'
    ]);

    $post = ServicePost::where(
        'client_id',
        $request->user()->id
    )->findOrFail($postId);

    // منع التعامل مع منشور مغلق
    if ($post->status !== 'active') {
        return response()->json([
            'message' => 'هذا المنشور مغلق بالفعل'
        ], 422);
    }

    $response = PostResponse::where(
        'post_id',
        $post->id
    )->findOrFail($responseId);

    DB::transaction(function () use ($request, $post, $response) {

        $response->update([
            'status' => $request->status
        ]);

        if ($request->status === 'accepted') {

            // رفض باقي العروض
            PostResponse::where('post_id', $post->id)
                ->where('id', '!=', $response->id)
                ->update([
                    'status' => 'rejected'
                ]);

            // إغلاق المنشور
            $post->update([
                'status' => 'closed'
            ]);

            // تحميل العلاقات المطلوبة
            $post->load('client');
            $response->load('craftsman.user');

            // إشعار الحرفي المقبول
            if (
                $response->craftsman &&
                $response->craftsman->user
            ) {
                $response->craftsman->user->notify(
                    new OfferAcceptedNotification(
                        $post,
                        $response
                    )
                );
            }
        }
    });

    return response()->json([
        'message' => $request->status === 'accepted'
            ? 'تم قبول عرض الحرفي بنجاح'
            : 'تم رفض العرض',

        'response' => $response->fresh(),
    ]);
}
    /**
     * إغلاق أو حذف منشور (العميل)
     * DELETE /api/service-posts/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $post = ServicePost::where('client_id', $request->user()->id)->findOrFail($id);
        $post->update(['status' => 'closed']);

        return response()->json(['message' => 'تم إغلاق المنشور']);
    }
}