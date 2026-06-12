<?php

namespace App\Http\Controllers\Api\Verification;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;


class VerificationController extends Controller
{
    // ================================================================
    // EMAIL VERIFICATION
    // ================================================================

    /**
     * POST /api/auth/email/verify  🔒
     *
     * تأكيد البريد الإلكتروني عبر OTP
     *
     * Request:
     *   { "otp": "123456" }
     *
     * Response 200:
     *   { "message": "تم تأكيد بريدك الإلكتروني بنجاح ✅" }
     *
     * Response 422:
     *   { "message": "الكود غير صحيح أو منتهي الصلاحية" }
     */
    public function verifyEmail(Request $request): JsonResponse
    {$validator = Validator::make($request->all(), [
        'otp' => 'required|string|size:6',
    ], [
        'otp.required' => 'كود التحقق مطلوب',
        'otp.size'     => 'كود التحقق يجب أن يكون 6 أرقام',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'فشل التحقق من البيانات',
            'errors'  => $validator->errors(),
        ], 422);
    }
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'البريد الإلكتروني مؤكد مسبقاً',
            ]);
        }

        $record = OtpCode::where('user_id', $user->id)
            ->where('type', OtpCode::TYPE_EMAIL_VERIFICATION)
            ->where('code', $request->otp)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'الكود غير صحيح أو منتهي الصلاحية',
            ], 422);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));
        $record->update(['used' => true]);

        return response()->json([
            'message' => 'تم تأكيد بريدك الإلكتروني بنجاح ✅',
        ]);
    }

    /**
     * POST /api/auth/email/resend  🔒
     *
     * إعادة إرسال كود التحقق
     *
     * Response 200:
     *   { "message": "تم إرسال كود جديد على بريدك الإلكتروني" }
     *
     * Response 400:
     *   { "message": "بريدك الإلكتروني مؤكد مسبقاً" }
     *
     * Response 429:
     *   { "message": "يرجى الانتظار دقيقة قبل إعادة الإرسال" }
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'بريدك الإلكتروني مؤكد مسبقاً',
            ], 400);
        }

        // Rate limit: مرة واحدة كل دقيقة
        $recent = OtpCode::where('user_id', $user->id)
            ->where('type', OtpCode::TYPE_EMAIL_VERIFICATION)
            ->where('created_at', '>', now()->subMinute())
            ->exists();

        if ($recent) {
            return response()->json([
                'message' => 'يرجى الانتظار دقيقة قبل إعادة الإرسال',
            ], 429);
        }

        $this->generateAndSendOtp($user->id, $user->email, OtpCode::TYPE_EMAIL_VERIFICATION);

        return response()->json([
            'message'    => 'تم إرسال كود جديد على بريدك الإلكتروني',
            'expires_in' => 300,
        ]);
    }

    // ================================================================
    // OTP (Public — no token required)
    // ================================================================

    /**
     * POST /api/auth/otp/send
     *
     * إرسال OTP على الإيميل أو الجوال
     *
     * Request:
     * {
     *   "identifier": "user@example.com",
     *   "type": "email",
     *   "purpose": "password_reset"
     * }
     *
     * type    → email | phone
     * purpose → login | register | password_reset | phone_verification | email_verification
     *
     * Response 200:
     * {
     *   "message": "تم إرسال كود التحقق",
     *   "expires_in": 300,
     *   "masked": "use***@example.com"
     * }
     *
     * Response 404:
     *   { "message": "لا يوجد حساب مرتبط بهذا البريد الإلكتروني" }
     *
     * Response 429:
     *   { "message": "تجاوزت الحد المسموح. يرجى الانتظار 5 دقائق." }
     */
    public function sendOtp(Request $request): JsonResponse
    {
        // $request->validate([
        //     'identifier' => 'required|string|max:255',
        //     'type'       => 'required|in:email,phone',
        //     'purpose'    => 'required|in:login,register,password_reset,phone_verification,email_verification',
        // ]);
        $validator = Validator::make($request->all(), [
    'identifier' => 'required|string|max:255',
    'type'       => 'required|in:email,phone',
    'purpose'    => 'required|in:login,register,password_reset,phone_verification,email_verification',
], [
    'identifier.required' => 'البريد الإلكتروني أو رقم الهاتف مطلوب',
    'type.required'       => 'نوع الإرسال مطلوب',
    'type.in'             => 'نوع الإرسال غير صالح',
    'purpose.required'    => 'الغرض من الكود مطلوب',
    'purpose.in'          => 'الغرض من الكود غير صالح',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}

        $identifier = $request->identifier;
        $type       = $request->type;
        $purpose    = $request->purpose;

        // لو الغرض يتطلب وجود مستخدم
        if (in_array($purpose, ['login', 'password_reset'])) {
            $exists = $type === 'email'
                ? User::where('email', $identifier)->exists()
                : User::where('phone', $identifier)->exists();

            if (!$exists) {
                return response()->json([
                    'message' => $type === 'email'
                        ? 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني'
                        : 'لا يوجد حساب مرتبط بهذا الرقم',
                ], 404);
            }
        }

        // Rate limit: max 3 أكواد كل 5 دقائق
        $recentCount = OtpCode::where('identifier', $identifier)
            ->where('type', $purpose)
            ->where('created_at', '>', now()->subMinutes(5))
            ->count();

        if ($recentCount >= 3) {
            return response()->json([
                'message' => 'تجاوزت الحد المسموح. يرجى الانتظار 5 دقائق قبل المحاولة مجدداً.',
            ], 429);
        }

        // جلب user_id لو موجود
        $userId = $type === 'email'
            ? User::where('email', $identifier)->value('id')
            : User::where('phone', $identifier)->value('id');

        $this->generateAndSendOtp($userId, $identifier, $purpose, $type);

        // Mask identifier
        $masked = $type === 'phone'
            ? substr($identifier, 0, 3) . str_repeat('*', max(0, strlen($identifier) - 6)) . substr($identifier, -3)
            : preg_replace('/(?<=.{3}).(?=.*@)/u', '*', $identifier);

        return response()->json([
            'message'    => 'تم إرسال كود التحقق',
            'expires_in' => 300,
            'masked'     => $masked,
        ]);
    }

    /**
     * POST /api/auth/otp/verify
     *
     * التحقق من OTP
     *
     * Request:
     * {
     *   "identifier": "user@example.com",
     *   "otp": "123456",
     *   "purpose": "password_reset"
     * }
     *
     * Response 200:
     * {
     *   "message": "تم التحقق بنجاح",
     *   "verified": true,
     *   "reset_token": "abc..."    ← فقط لو purpose = password_reset
     * }
     *
     * Response 422:
     *   { "message": "الكود غير صحيح أو منتهي الصلاحية", "verified": false }
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        // $validate = $request->validate([
        //     'identifier' => 'required|string',
        //     'otp'        => 'required|string|size:6',
        //     'purpose'    => 'required|in:login,register,password_reset,phone_verification,email_verification',
        // ]);
        // $record = OtpCode::where('identifier', $request->identifier)
        //     ->where('code', $request->otp)
        //     ->where('type', $request->purpose)
        //     ->where('used', false)
        //     ->where('expires_at', '>', now())
        //     ->latest()
        //     ->first();

        // if (!$record) {
        //     // زيادة عداد المحاولات الفاشلة
        //     OtpCode::where('identifier', $request->identifier)
        //         ->where('type', $request->purpose)
        //         ->where('used', false)
        //         ->increment('attempts');
        //     return response()->json([
        //         'message'  => 'الكود غير صحيح أو منتهي الصلاحية',
        //         'verified' => false,
        //     ], 422);
        // }
        // $record->update(['used' => true]);
        // $response = ['message' => 'تم التحقق بنجاح', 'verified' => true];
        // // phone verification → نحدث المستخدم
        // if ($request->purpose === 'phone_verification' && $record->user_id) {
        //     User::where('id', $record->user_id)
        //         ->update(['phone_verified_at' => now()]);
        // }
        // // password_reset → token مؤقت صالح 10 دقائق
        // if ($request->purpose === 'password_reset') {
        //     $token = Str::random(64);
        //     Cache::put("password_reset_otp:{$token}", $request->identifier, now()->addMinutes(10));
        //     $response['reset_token'] = $token;
        // }
        // return response()->json($response);
    $validator = Validator::make($request->all(), [
        'identifier' => 'required|string|max:255',
        'otp'        => 'required|string|size:6',
        'purpose'    => 'required|in:login,register,password_reset,phone_verification,email_verification',
    ], [
        'identifier.required' => 'الإيميل أو رقم الهاتف مطلوب',
        'otp.required'        => 'كود التحقق مطلوب',
        'otp.size'            => 'كود التحقق يجب أن يكون 6 أرقام',
        'purpose.required'    => 'الغرض من التحقق مطلوب',
        'purpose.in'          => 'نوع التحقق غير صالح',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation Error',
            'errors'  => $validator->errors(),
        ], 422);
    }

    $record = OtpCode::where('identifier', $request->identifier)
        ->where('code', $request->otp)
        ->where('type', $request->purpose)
        ->where('used', false)
        ->where('expires_at', '>', now())
        ->latest()
        ->first();

    if (!$record) {

        OtpCode::where('identifier', $request->identifier)
            ->where('type', $request->purpose)
            ->where('used', false)
            ->increment('attempts');

        return response()->json([
            'message'  => 'الكود غير صحيح أو منتهي الصلاحية',
            'verified' => false,
        ], 422);
    }
$record->update([
    'used' => true
]);

$response = [
    'message'  => 'تم التحقق بنجاح',
    'verified' => true,
];

if ($request->purpose === 'phone_verification' && $record->user_id) {

    User::where('id', $record->user_id)
        ->update([
            'phone_verified_at' => now()
        ]);
}

if ($request->purpose === 'password_reset') {

    $token = Str::random(64);

    Cache::put(
        "password_reset_otp:{$token}",
        $request->identifier,
        now()->addMinutes(10)
    );

    $response['reset_token'] = $token;
}

return response()->json($response);
        }

    // ================================================================
    // FORGOT PASSWORD + RESET PASSWORD
    // ================================================================

    /**
     * POST /api/auth/forgot-password
     *
     * إرسال رابط إعادة تعيين كلمة المرور
     *
     * Request:
     *   { "email": "user@example.com" }
     *
     * Response 200:
     *   { "message": "إذا كان البريد مسجلاً، ستصلك تعليمات إعادة التعيين قريباً" }
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        // $request->validate([
        //     'email' => 'required|email',
        // ]);
         $validator = Validator::make($request->all(), [
        'email' => 'required|email',
    ], [
        'email.required' => 'البريد الإلكتروني مطلوب',
        'email.email'    => 'صيغة البريد الإلكتروني غير صحيحة',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'فشل التحقق من البيانات',
            'errors'  => $validator->errors(),
        ], 422);
    }

        // Security: نعيد نفس الـ message سواء الإيميل موجود أو لا
        if (User::where('email', $request->email)->exists()) {
            Password::sendResetLink(['email' => $request->email]);
        }

        return response()->json([
            'message' => 'إذا كان البريد مسجلاً، ستصلك تعليمات إعادة التعيين قريباً',
        ]);
    }

    /**
     * POST /api/auth/reset-password
     *
     * إعادة تعيين كلمة المرور بالـ Token (من الإيميل)
     *
     * Request:
     * {
     *   "token": "abc123def456...",
     *   "email": "user@example.com",
     *   "password": "NewPass@123",
     *   "password_confirmation": "NewPass@123"
     * }
     *
     * Response 200:
     *   { "message": "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." }
     *
     * Response 422:
     *   { "message": "الرابط منتهي الصلاحية أو غير صحيح." }
     */
    public function resetPassword(Request $request): JsonResponse
    {
        // $request->validate([
        //     'token'    => 'required|string',
        //     'email'    => 'required|email',
        //     'password' => 'required|string|min:8|confirmed',
        // ], [
        //     'password.confirmed' => 'كلمة المرور غير متطابقة',
        //     'password.min'       => 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        // ]);
$validator = Validator::make($request->all(), [
    'token'    => 'required|string',
    'email'    => 'required|email',
    'password' => 'required|string|min:8|confirmed',
], [
    'token.required'       => 'التوكن مطلوب',
    'email.required'       => 'البريد الإلكتروني مطلوب',
    'email.email'          => 'صيغة البريد الإلكتروني غير صحيحة',
    'password.required'    => 'كلمة المرور مطلوبة',
    'password.min'         => 'كلمة المرور يجب ألا تقل عن 8 أحرف',
    'password.confirmed'   => 'تأكيد كلمة المرور غير متطابق',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
            ]);
        }

        return response()->json([
            'message' => 'الرابط منتهي الصلاحية أو غير صحيح. يرجى طلب رابط جديد.',
        ], 422);
    }

    /**
     * POST /api/auth/reset-password-otp
     *
     * إعادة تعيين كلمة المرور بالـ reset_token من verifyOtp (للموبايل)
     *
     * Request:
     * {
     *   "reset_token": "xyz789...",
     *   "password": "NewPass@123",
     *   "password_confirmation": "NewPass@123"
     * }
     *
     * Response 200:
     *   { "message": "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." }
     *
     * Response 422:
     *   { "message": "الرابط منتهي الصلاحية. يرجى طلب كود جديد." }
     */
    public function resetPasswordWithOtp(Request $request): JsonResponse
    {
        // $request->validate([
        //     'reset_token' => 'required|string',
        //     'password'    => 'required|string|min:8|confirmed',
        // ], [
        //     'password.confirmed' => 'كلمة المرور غير متطابقة',
        //     'password.min'       => 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        // ]);
        $validator = Validator::make($request->all(), [
    'reset_token' => 'required|string',
    'password'    => 'required|string|min:8|confirmed',
], [
    'reset_token.required' => 'رمز إعادة التعيين مطلوب',
    'password.required'    => 'كلمة المرور مطلوبة',
    'password.min'         => 'كلمة المرور يجب ألا تقل عن 8 أحرف',
    'password.confirmed'   => 'تأكيد كلمة المرور غير متطابق',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}

        $email = Cache::get("password_reset_otp:{$request->reset_token}");

        if (!$email) {
            return response()->json([
                'message' => 'الرابط منتهي الصلاحية أو غير صحيح. يرجى طلب كود جديد.',
            ], 422);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json(['message' => 'المستخدم غير موجود'], 404);
        }

        $user->update([
            'password'       => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ]);

        Cache::forget("password_reset_otp:{$request->reset_token}");

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
        ]);
    }

    // ================================================================
    // PRIVATE HELPER
    // ================================================================

    private function generateAndSendOtp(
        ?int   $userId,
        string $identifier,
        string $purpose,
        string $channel = 'email'
    ): void {
        // إلغاء الأكواد القديمة غير المستخدمة
        OtpCode::where('identifier', $identifier)
            ->where('type', $purpose)
            ->where('used', false)
            ->update(['used' => true]);

        // توليد كود 6 أرقام
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'user_id'    => $userId,
            'identifier' => $identifier,
            'code'       => $code,
            'type'       => $purpose,
            'expires_at' => now()->addMinutes(5),
            'used'       => false,
            'attempts'   => 0,
        ]);

        if ($channel === 'email') {
            Mail::to($identifier)->send(new OtpMail($code, $purpose));
        } else {
            // SMS - Unifonic / Twilio / etc.
            // \App\Services\SmsService::send($identifier, "كود التحقق الخاص بك: {$code}");
        }
    }
}
