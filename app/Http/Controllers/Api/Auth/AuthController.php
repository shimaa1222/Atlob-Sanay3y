<?php

namespace App\Http\Controllers\Api\Auth;
use App\Http\Controllers\Controller;
use App\Models\Craftsman;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NewCraftsmanRegistrationNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    /**
     * تسجيل دخول العميل أو الحرفي
     */
    public function login(Request $request): JsonResponse
    {
  $validator = Validator::make($request->all(), [
    'email'    => 'required|email',
    'password' => 'required|string',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['بيانات الدخول غير صحيحة.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'حسابك موقوف. يرجى التواصل مع الدعم الفني.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'phone'      => $user->phone,
                'avatar_url' => $user->avatar_url,
                'craftsman'  => $user->isCraftsman() ? $user->craftsman?->only(['id', 'status', 'rating', 'city']) : null,
            ],
            'token'   => $token,
        ]);
    }

    /**
     * تسجيل عميل جديد
     */
    public function registerClient(Request $request): JsonResponse
    {

        $validate=Validator::make($request->all(), [
            'name'                  => 'required|string|max:100',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'phone'                 => 'nullable|string|max:20',
            'verified_token'        => 'required|string',
        ]);
        if($validate->fails()){
            return response()->json([
                'message' => 'فشل التحقق من البيانات',
                'errors' => $validate->errors()
            ], 422);
        }
 $verifiedEmail = Cache::get(
        "email_verification:{$request->verified_token}"
    );


    if (!$verifiedEmail) {
        return response()->json([
            'message' => 'يجب تأكيد البريد الإلكتروني أولاً'
        ], 422);
    }


    if ($verifiedEmail !== $request->email) {
        return response()->json([
            'message' => 'البريد الإلكتروني غير مطابق'
        ], 422);
    }

$user = User::create([
    'name'              => $request->name,
    'email'             => $request->email,
    'password'          => Hash::make($request->password),
    'role'              => 'client',
    'phone'             => $request->phone,
    'email_verified_at' => null,
    'is_active'         => true,
]);
Cache::forget(
        "email_verification:{$request->verified_token}"
    );


        return response()->json([
            'message' => 'تم إنشاء حسابك بنجاح',
            'user'    => $user->only(['id', 'name', 'email', 'role', 'phone']),
        ], 201);
    }

    /**
     * تسجيل حرفي جديد - يذهب إلى قائمة انتظار موافقة الأدمن
     * لا يتم إنشاء حساب User حتى يوافق الأدمن
     */
 public function registerCraftsman(Request $request): JsonResponse
{
    $validator = Validator::make($request->all(), [

        'first_name' => 'required|string|max:50',
        'last_name'  => 'required|string|max:50',

        'email' => 'required|email|
                    unique:craftsmen,email|
                    unique:users,email',

        'phone' => 'required|string|max:20',

        'city' => 'required|string|max:100',

        'password' => 'required|string|min:8|confirmed',

        'national_id_front' => 'required|file|mimes:jpg,jpeg,png|max:5120',

        'national_id_back'  => 'required|file|mimes:jpg,jpeg,png|max:5120',

        'craft_ids' => 'required|array|min:1',

        'craft_ids.*'=> 'exists:crafts,id',

//        'verified_token'=>'required|string',

        'district'=>'nullable|string',

        'latitude'=>'nullable|numeric',

        'longitude'=>'nullable|numeric',

    ]);


    if($validator->fails()){

        return response()->json([
            'message'=>'فشل التحقق من البيانات',
            'errors'=>$validator->errors()
        ],422);

    }



    // التحقق من OTP للإيميل

    // $verifiedEmail = Cache::get(
    //     "email_verification:{$request->verified_token}"
    // );


    // if(!$verifiedEmail){

    //     return response()->json([
    //         'message'=>'يجب تأكيد البريد الإلكتروني أولاً'
    //     ],422);

    // }


    // if($verifiedEmail !== $request->email){

    //     return response()->json([
    //         'message'=>'البريد الإلكتروني غير مطابق'
    //     ],422);

    // }



    $frontPath = $request->file('national_id_front')
        ->store('national_ids','public');


    $backPath = $request->file('national_id_back')
        ->store('national_ids','public');



    $craftsman = Craftsman::create([

        'user_id'=>null,

        'first_name'=>$request->first_name,

        'last_name'=>$request->last_name,

        'email'=>$request->email,

        'phone'=>$request->phone,

        'password'=>Hash::make($request->password),

        'national_id_front'=>$frontPath,

        'national_id_back'=>$backPath,

        'city'=>$request->city,

        'status'=>'pending',

    ]);



    foreach($request->craft_ids as $index=>$craftId){

        DB::table('craftsman_crafts')->insert([

            'craftsman_id'=>$craftsman->id,

            'craft_id'=>$craftId,

            'is_primary'=>$index===0,

            'created_at'=>now(),

            'updated_at'=>now(),

        ]);

    }



   // Cache::forget(
    //     "email_verification:{$request->verified_token}"
    // );



    return response()->json([

        'message'=>'تم إرسال الطلب بنجاح',

        'status'=>'pending'

    ]);

}

    /**
     * تسجيل الخروج
     */




    public function logout(Request $request): JsonResponse
    {
        // $request->user()->currentAccessToken()->delete();

        // return response()->json(['message' => 'تم تسجيل الخروج بنجاح']);
        $user=$request->user()->currentAccessToken()->delete();
        return response()->json(
            ['success'=>true,
            'message'=> 'تم تسجيل الخروج بنجاح',
           ],200);
    }



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * بيانات المستخدم الحالي
     */


    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('craftsman.crafts');

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * تحديث الملف الشخصي
     */

    /////////////////////////////////
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
$validator = Validator::make($request->all(), [
    'name'   => 'sometimes|string|max:100',
    'phone'  => 'sometimes|string|max:20',
    'avatar' => 'sometimes|file|mimes:jpg,jpeg,png|max:2048',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}

        $data = $request->only(['name', 'phone']);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

//     $updated = $user->update($data);

// if (!$updated) {
//     return response()->json([
//         'message' => 'لم يتم تعديل أي بيانات'
//     ], 200);
// }
//         return response()->json([
//             'message' => 'تم تحديث الملف الشخصي بنجاح',
//             'user'    => $user->fresh(),
//         ]);


$user->fill($data);

if (!$user->isDirty()) {
    return response()->json([
        'message' => 'لم يتم تعديل أي بيانات'
    ], 200);
}

$user->save();

return response()->json([
    'message' => 'تم تحديث الملف الشخصي بنجاح',
    'user' => $user->fresh(),
]);
    }



   ////////       //////////////////////////////       ///////////////////////       ////////////////////////////       ///////////////       ////


    /**
     * تغيير كلمة المرور
     */

    public function changePassword(Request $request): JsonResponse
    {
      $validator = Validator::make($request->all(), [
    'current_password' => 'required|string',
    'password'         => 'required|string|min:8|confirmed',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'كلمة المرور الحالية غير صحيحة'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'تم تغيير كلمة المرور بنجاح']);
    }
}
