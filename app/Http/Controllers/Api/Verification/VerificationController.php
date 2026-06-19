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
    // public function verifyEmail(Request $request): JsonResponse
    // {$validator = Validator::make($request->all(), [
    //     'otp' => 'required|string|size:6',
    // ], [
    //     'otp.required' => 'كود التحقق مطلوب',
    //     'otp.size'     => 'كود التحقق يجب أن يكون 6 أرقام',
    // ]);

    // if ($validator->fails()) {
    //     return response()->json([
    //         'message' => 'فشل التحقق من البيانات',
    //         'errors'  => $validator->errors(),
    //     ], 422);
    // }
    //     $user = $request->user();

    //     if ($user->hasVerifiedEmail()) {
    //         return response()->json([
    //             'message' => 'البريد الإلكتروني مؤكد مسبقاً',
    //         ]);
    //     }

    //     $record = OtpCode::where('user_id', $user->id)
    //         ->where('type', OtpCode::TYPE_EMAIL_VERIFICATION)
    //         ->where('code', $request->otp)
    //         ->where('used', false)
    //         ->where('expires_at', '>', now())
    //         ->first();

    //     if (!$record) {
    //         return response()->json([
    //             'message' => 'الكود غير صحيح أو منتهي الصلاحية',
    //         ], 422);
    //     }

    //     $user->markEmailAsVerified();
    //     event(new Verified($user));
    //     $record->update(['used' => true]);

    //     return response()->json([
    //         'message' => 'تم تأكيد بريدك الإلكتروني بنجاح ✅',
    //     ]);
    // }

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
    // public function resendVerification(Request $request): JsonResponse
    // {
    //     $user = $request->user();

    //     if ($user->hasVerifiedEmail()) {
    //         return response()->json([
    //             'message' => 'بريدك الإلكتروني مؤكد مسبقاً',
    //         ], 400);
    //     }

    //     // Rate limit: مرة واحدة كل دقيقة
    //     $recent = OtpCode::where('user_id', $user->id)
    //         ->where('type', OtpCode::TYPE_EMAIL_VERIFICATION)
    //         ->where('created_at', '>', now()->subMinute())
    //         ->exists();

    //     if ($recent) {
    //         return response()->json([
    //             'message' => 'يرجى الانتظار دقيقة قبل إعادة الإرسال',
    //         ], 429);
    //     }

    //     $this->generateAndSendOtp($user->id, $user->email, OtpCode::TYPE_EMAIL_VERIFICATION);

    //     return response()->json([
    //         'message'    => 'تم إرسال كود جديد على بريدك الإلكتروني',
    //         'expires_in' => 300,
    //     ]);
    // }

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

    $validator = Validator::make($request->all(), [

        'email' => 'required|email',

    ]);


    if($validator->fails()){

        return response()->json([
            'message'=>'Validation Error',
            'errors'=>$validator->errors()
        ],422);

    }


    $this->generateAndSendOtp($request->email);


    return response()->json([

        'message'=>'تم إرسال كود التحقق على البريد الإلكتروني',

        'expires_in'=>300

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

    $validator = Validator::make($request->all(), [

        'email'=>'required|email',

        'otp'=>'required|string|size:6',
'purpose'=>'required|in:register,password_reset',
    ]);


    if($validator->fails()){

        return response()->json([
            'message'=>'Validation Error',
            'errors'=>$validator->errors()
        ],422);

    }



    $record = OtpCode::where('email',$request->email)
        ->where('code',$request->otp)
        ->where('used',false)
        ->where('expires_at','>',now())
        ->latest()
        ->first();



    if(!$record){

        OtpCode::where('email',$request->email)
            ->where('used',false)
            ->increment('attempts');


        return response()->json([

            'message'=>'الكود غير صحيح أو منتهي الصلاحية'

        ],422);

    }



    $record->update([

        'used'=>true

    ]);



  $response = [
    'message'  => 'تم التحقق بنجاح',
    'verified' => true,
];


if($request->purpose === 'register'){//تأكيد البريد الإلكتروني للتسجيل

    $token = Str::random(64);

    Cache::put(
        "email_verification:$token",
        $request->email,
        now()->addMinutes(30)
    );

    $response['verified_token']=$token;
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
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation Error',
            'errors' => $validator->errors()
        ], 422);
    }


    $user = User::where('email', $request->email)->first();


    // Security: لا تكشف هل الإيميل موجود أم لا
    if ($user) {

        $this->generateAndSendOtp(
            $request->email,
            'password_reset'
        );

    }


    return response()->json([
        'message' => 'إذا كان البريد مسجلاً، سيتم إرسال كود إعادة التعيين'
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
//     public function resetPassword(Request $request): JsonResponse
//     {
//         // $request->validate([
//         //     'token'    => 'required|string',
//         //     'email'    => 'required|email',
//         //     'password' => 'required|string|min:8|confirmed',
//         // ], [
//         //     'password.confirmed' => 'كلمة المرور غير متطابقة',
//         //     'password.min'       => 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
//         // ]);
// $validator = Validator::make($request->all(), [
//     'token'    => 'required|string',
//     'email'    => 'required|email',
//     'password' => 'required|string|min:8|confirmed',
// ], [
//     'token.required'       => 'التوكن مطلوب',
//     'email.required'       => 'البريد الإلكتروني مطلوب',
//     'email.email'          => 'صيغة البريد الإلكتروني غير صحيحة',
//     'password.required'    => 'كلمة المرور مطلوبة',
//     'password.min'         => 'كلمة المرور يجب ألا تقل عن 8 أحرف',
//     'password.confirmed'   => 'تأكيد كلمة المرور غير متطابق',
// ]);

// if ($validator->fails()) {
//     return response()->json([
//         'message' => 'فشل التحقق من البيانات',
//         'errors'  => $validator->errors(),
//     ], 422);
// }

//         $status = Password::reset(
//             $request->only('email', 'password', 'password_confirmation', 'token'),
//             function (User $user, string $password) {
//                 $user->forceFill([
//                     'password'       => Hash::make($password),
//                     'remember_token' => Str::random(60),
//                 ])->save();
//             }
//         );

//         if ($status === Password::PASSWORD_RESET) {
//             return response()->json([
//                 'message' => 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
//             ]);
//         }

//         return response()->json([
//             'message' => 'الرابط منتهي الصلاحية أو غير صحيح. يرجى طلب رابط جديد.',
//         ], 422);
//     }

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

        // $email = Cache::get("password_reset_otp:{$request->reset_token}");
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

    private function generateAndSendOtp(string $email): void
{

    // إلغاء الأكواد القديمة

    OtpCode::where('email',$email)
        ->where('used',false)
        ->update([
            'used'=>true
        ]);



    $code = str_pad(
        random_int(0,999999),
        6,
        '0',
        STR_PAD_LEFT
    );



    OtpCode::create([

        'email'=>$email,

        'code'=>$code,

        'expires_at'=>now()->addMinutes(5),

        'used'=>false,

        'attempts'=>0,

    ]);



    Mail::to($email)
        ->send(
            new OtpMail($code)
        );

}
}
