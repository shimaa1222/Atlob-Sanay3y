<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Booking\BookingController;
use App\Http\Controllers\Api\Craftsman\CraftsmanController;
use App\Http\Controllers\Api\ServicePost\ServicePostController;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\AdminSettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Verification\VerificationController;
use App\Http\Controllers\Api\Upload\UploadController;
use App\Http\Controllers\Api\Notification\NotificationController;
/*
| API Routes - طلب صنايعي
|--------------------------------------------------------------------------
|
| Auth Routes - مسارات المصادقة
| Public Routes - المسارات العامة (بدون تسجيل دخول)
| Client Routes - مسارات العملاء
| Craftsman Routes - مسارات الحرفيين
| Admin Routes - مسارات الأدمن
|
*/
//حذفت
//Route::post('/reset-password',      [VerificationController::class, 'resetPassword']);
// Route::post('/email/verify',        [VerificationController::class, 'verifyEmail']);
// Route::post('/email/resend',        [VerificationController::class, 'resendVerification']);
// ============================================================
// AUTH ROUTES - مسارات المصادقة
// ============================================================


Route::middleware('auth:sanctum')->group(function () {

// ─── UPLOAD ────────────────────────────────────────────────
    Route::prefix('upload')->group(function () {
        Route::post('/image',    [UploadController::class, 'uploadImage']);
        Route::post('/multiple', [UploadController::class, 'uploadMultiple']);
        Route::post('/document', [UploadController::class, 'uploadDocument']);
        Route::delete('/',       [UploadController::class, 'deleteFile']);
    });

    // ─── NOTIFICATIONS ──────────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('/',             [NotificationController::class, 'index']);//finish
        Route::get('/count',        [NotificationController::class, 'unreadCount']);//finish
        Route::post('/read-all',    [NotificationController::class, 'markAllAsRead']);//finish
        Route::delete('/',          [NotificationController::class, 'clearAll']);//finish
        Route::patch('/{id}/read',  [NotificationController::class, 'markAsRead']);//finish
        Route::delete('/{id}',      [NotificationController::class, 'destroy']);//finish
    });

});



Route::prefix('auth')->group(function () {



    // تسجيل عميل جديد
    Route::post('/register/client', [AuthController::class, 'registerClient']);//finish

    // تسجيل حرفي جديد (يذهب لانتظار موافقة الأدمن)
    Route::post('/register/craftsman', [AuthController::class, 'registerCraftsman']); //finish

  // تسجيل دخول موحد للجميع (عميل / حرفي / أدمن)
    Route::post('/login', [AuthController::class, 'login']);//finish
    // Route::post('/admin/login', [AdminController::class, 'login']);

////////////////////Not yet test///////////////////////////
Route::get('/reviews', [CraftsmanController::class, 'reviewsList']);


// OTP عام (بدون token)
    Route::post('/otp/send',            [VerificationController::class, 'sendOtp']);//finish
    Route::post('/otp/verify',          [VerificationController::class, 'verifyOtp']);//finish

        // إعادة تعيين كلمة المرور
    Route::post('/forgot-password',     [VerificationController::class, 'forgotPassword']);//finish
   // Route::post('/reset-password',      [VerificationController::class, 'resetPassword']);//finish
    Route::post('/reset-password-otp',  [VerificationController::class, 'resetPasswordWithOtp']);//finish






    // المسارات التي تتطلب تسجيل الدخول
    Route::middleware('auth:sanctum')->group(function () {
        Route::delete('/logout', [AuthController::class, 'logout']);//finish
        Route::get('/me', [AuthController::class, 'me']);//finish
        Route::post('/update-profile', [AuthController::class, 'updateProfile']);//finish
        Route::post('/change-password', [AuthController::class, 'changePassword']);//finish

        ////not test yet///////
               // تأكيد البريد الإلكتروني
//Route::post('/email/verify',        [VerificationController::class, 'verifyEmail']);//finish
     //   Route::post('/email/resend',        [VerificationController::class, 'resendVerification']);//finish
/*# Password Reset Flow باستخدام OTP

## 1) إرسال OTP

### Endpoint

```http id="jlwm80"
POST /api/auth/otp/send
```

### Request

```json id="jlwm81"
{
  "identifier": "test@test.com",
  "type": "email",
  "purpose": "password_reset"
}
```

### Response

```json id="jlwm82"
{
  "message": "تم إرسال كود التحقق",
  "expires_in": 300,
  "masked": "tes***@test.com"
}
```

---

# 2) التحقق من OTP

### Endpoint

```http id="jlwm83"
POST /api/auth/otp/verify
```

### Request

```json id="jlwm84"
{
  "identifier": "test@test.com",
  "otp": "123456",
  "purpose": "password_reset"
}
```

### Success Response

```json id="jlwm85"
{
  "message": "تم التحقق بنجاح",
  "verified": true,
  "reset_token": "abc123xyz789"
}
```

> مهم جداً:
>
> خد قيمة:
>
> ```text id="jlwm86"
> reset_token
> ```
>
> لأنك هتستخدمها في الخطوة اللي بعدها.

---

# 3) تغيير كلمة المرور

### Endpoint

```http id="jlwm87"
POST /api/auth/reset-password-otp
```

### Request

```json id="jlwm88"
{
  "reset_token": "abc123xyz789",
  "password": "12345678",
  "password_confirmation": "12345678"
}
```

### Success Response

```json id="jlwm89"
{
  "message": "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن."
}
```

---

# الشكل الكامل للـ Flow

```text id="jlwm90"
otp/send
    ↓
otp/verify
    ↓
reset-password-otp
```

---

# Email Verification Flow

## 1) إرسال كود التحقق

### Endpoint

```http id="jlwm91"
POST /api/auth/email/resend
```

> يحتاج Bearer Token

---

## 2) تأكيد الإيميل

### Endpoint

```http id="jlwm92"
POST /api/auth/email/verify
```

### Request

```json id="jlwm93"
{
  "otp": "123456"
}
```

> يحتاج Bearer Token

---

# OTP Login أو Register

## إرسال OTP

```http id="jlwm94"
POST /api/auth/otp/send
```

### Request

```json id="jlwm95"
{
  "identifier": "test@test.com",
  "type": "email",
  "purpose": "login"
}
```

أو:

```json id="jlwm96"
{
  "identifier": "test@test.com",
  "type": "email",
  "purpose": "register"
}
```

---

## Verify OTP

```http id="jlwm97"
POST /api/auth/otp/verify
```
*/
        //
        ///////////////not test yet////////////////

    });
});

// ============================================================
// PUBLIC ROUTES - مسارات عامة (لا تحتاج تسجيل دخول)
// ============================================================

// المهن المتاحة
Route::get('/crafts', [CraftsmanController::class, 'crafts']);//finish

// الحرفيون المميزون (للصفحة الرئيسية)
Route::get('/craftsmen/featured', [CraftsmanController::class, 'featured']);//finish

// قائمة الحرفيين مع بحث وفلترة
Route::get('/craftsmen.home.search', [CraftsmanController::class, 'index']);//rating | reviews | newest | price_asc | price_desc| ,craft_id,city,search,sorting,pagination(per_page)

// ملف الحرفي الشخصي
Route::get('/craftsmen.home.show/{id}', [CraftsmanController::class, 'show']);//finish


// ============================================================
// AUTHENTICATED ROUTES - مسارات تتطلب تسجيل الدخول
// ============================================================

Route::middleware('auth:sanctum')->group(function () {

    // ==================================
    // CLIENT ROUTES - مسارات العملاء
    // ==================================
 Route::middleware(["auth:sanctum","role:client,admin"])->prefix('client')->group(function () {
/////////////////////////////////////////////her//////////////////////////////////////
        // الحجوزات
        Route::get('/bookings', [BookingController::class, 'clientBookings']);//finish
        Route::post('/bookings.store', [BookingController::class, 'store']);//finish
        Route::get('/bookings.show/{id}', [BookingController::class, 'show']);//finish
        Route::delete('/bookings.cancel/{id}', [BookingController::class, 'cancel']);//finish
        Route::post('/bookings.addreview/{id}/review', [BookingController::class, 'addReview']);//finish



        // منشورات الخدمات (العميل ينشر طلبات)
        Route::get('/my-posts', [ServicePostController::class, 'myPosts']);//finish
        Route::post('/service-posts.store', [ServicePostController::class, 'store']);//finish
        Route::get('/service-posts/{id}', [ServicePostController::class, 'show']);//finish
        Route::delete('/service-posts.destroy/{id}', [ServicePostController::class, 'destroy']);//finish
        Route::patch('/service-posts/{postId}/responses/{responseId}', [ServicePostController::class, 'updateResponse']);//الـ Route ده خاص إن العميل يقبل أو يرفض عرض حرفي على الـ Service Post.
    //بختار رقم الresponse اللي علي اساسه هقبل ولا هرفض (status: accepted/rejected)   //finish
    //PATCH /api/service-posts/{postId}/responses/{responseId}  بياخد x-www-form-urlencoded body فيه status: accepted/rejected
        });



    // ==================================
    // CRAFTSMAN ROUTES - مسارات الحرفيين
    // ==================================
Route::middleware(["auth:sanctum","role:craftsman,admin"])->prefix('craftsman')->group(function () {
        // إحصائيات الحرفي
        Route::get('/stats', [CraftsmanController::class, 'myStats']);//finish

        // تحديث الملف الشخصي للحرفي
        Route::post('/profile', [CraftsmanController::class, 'updateProfile']);//finish

        // حجوزات الحرفي
        Route::get('/bookings', [BookingController::class, 'craftsmanBookings']);//finish

        // تحديث حالة الحجز //id-> booking id
        Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);//finish status: in_progress | completed | cancelled

        // منشورات الخدمات (الحرفي يشوفها ويرد عليها)
        Route::get('/service-posts', [ServicePostController::class, 'index']);//finish list of all service posts with pagination and search
        Route::post('/service-posts/{id}/respond', [ServicePostController::class, 'respond']);//finish الحرفي يرد على منشور خدمة معين بعرض سعر ومدة تنفيذ
        // Site Settings
Route::get('/settings',[AdminSettingsController::class, 'index']);

Route::put(
    '/settings',
    [AdminSettingsController::class, 'update']
);

// Advanced Statistics
Route::get(
    '/settings/stats',
    [AdminSettingsController::class, 'advancedStats']
);

// Impersonation
Route::post(
    '/users/{id}/impersonate',
    [AdminSettingsController::class, 'impersonate']
);
    });

    // ==================================
    // ADMIN ROUTES - مسارات الأدمن
    // ==================================
//  admin role is admin

Route::middleware(["auth:sanctum","role:admin"])->prefix('admin')->group(function () {

        // لوحة التحكم - إحصائيات
        Route::get('/dashboard', [AdminController::class, 'dashboard']);//finish

        // إدارة الحرفيين
        Route::get('/craftsmen', [AdminController::class, 'craftsmenList']);//finish list of all craftsmen with pagination
        Route::get('/craftsmen/{id}', [AdminController::class, 'craftsmanDetail']);//finish show craftsman details with reviews and ratings
        Route::post('/craftsmen/{id}/approve', [AdminController::class, 'approveCraftsman']);//finish approve craftsman registration and make them active
        Route::post('/craftsmen/{id}/reject', [AdminController::class, 'rejectCraftsman']);//finish reject craftsman registration
        Route::patch('/craftsmen/{id}/toggle-status', [AdminController::class, 'toggleCraftsmanStatus']);//finish block/unblock craftsman
        Route::patch('/craftsmen/{id}/toggle-featured', [AdminController::class, 'toggleFeatured']);//finish add/remove craftsman from featured list

        // إدارة المستخدمين
         Route::get('/users', [AdminController::class, 'usersList']);//finish list of all users with pagination
        Route::patch('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);//finish block/unblock user

        // إدارة الحجوزات
        Route::get('/bookings', [AdminController::class, 'bookingsList']);//finish list of all bookings with pagination

        // إدارة المنشورات
        Route::get('/posts', [AdminController::class, 'postsList']);//finish list of all service posts with pagination
        Route::patch('/posts/{id}/toggle-visibility', [AdminController::class, 'togglePostVisibility']);//finish hide/show post
        Route::delete('/posts.delete/{id}', [AdminController::class, 'deletePost']);//finish delete post

        // إدارة المهن
        Route::get('/crafts.list', [AdminController::class, 'craftsList']);//finish list of all crafts
        Route::post('/crafts.store', [AdminController::class, 'storeCraft']);//finish add new craft
        Route::post('/crafts.update/{id}', [AdminController::class, 'updateCraft']);// finish update craft
        Route::delete('/crafts.delete/{id}', [AdminController::class, 'deleteCraft']);//finish delete craft


        // إدارة التقييمات
        Route::get('/reviews', [AdminController::class, 'reviewsList']);// finish list of all reviews with pagination
        Route::patch('/reviews/{id}/toggle-visibility', [AdminController::class, 'toggleReviewVisibility']);//finish hide/show review


    });

 });
