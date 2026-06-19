<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
body{font-family:'Segoe UI',Tahoma,sans-serif;background:#f3f4f6;margin:0;padding:20px;}
.container{max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1);}
.header{background:linear-gradient(135deg,#1a56db,#1344b4);padding:32px;text-align:center;}
.header-icon{font-size:2.5rem;margin-bottom:10px;}
.header h1{color:#fff;font-size:1.3rem;font-weight:800;margin:0;}
.body{padding:32px;}
.greeting{font-size:1rem;font-weight:700;color:#111827;margin-bottom:14px;}
.text{font-size:.9rem;color:#4b5563;line-height:1.8;margin-bottom:20px;}
.otp-box{background:#eff6ff;border:2px solid #bfdbfe;border-radius:14px;padding:24px;text-align:center;margin:22px 0;}
.otp-code{font-size:2.5rem;font-weight:900;color:#1a56db;letter-spacing:12px;font-family:monospace;}
.otp-timer{font-size:.82rem;color:#6b7280;margin-top:10px;}
.warning{background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:.82rem;color:#92400e;margin-top:18px;}
.footer{background:#f9fafb;padding:18px;text-align:center;font-size:.76rem;color:#9ca3af;border-top:1px solid #f3f4f6;}
.purpose-badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:.78rem;font-weight:700;margin-bottom:14px;}
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <div class="header-icon">
            @if($purpose === 'email_verification') ✉️
            @elseif($purpose === 'password_reset') 🔑
            @else 🔐
            @endif
        </div>
        <h1>
            @if($purpose === 'email_verification') تأكيد البريد الإلكتروني
            @elseif($purpose === 'password_reset') إعادة تعيين كلمة المرور
            @else كود التحقق
            @endif
        </h1>
    </div>

    <div class="body">
        <p class="greeting">مرحباً،</p>
        <p class="text">
            @if($purpose === 'email_verification')
                لإتمام تسجيلك في <strong>صنايعي</strong>، يرجى إدخال الكود أدناه لتأكيد بريدك الإلكتروني.


            @else
                كود التحقق الخاص بك:
            @endif
        </p>

        <div class="otp-box">
            <div class="otp-code">{{ $otp }}</div>
            <div class="otp-timer">
                <strong>صالح لمدة 5 دقائق فقط</strong>
            </div>
        </div>

        <div class="warning">
            ⚠️ <strong>تحذير أمني:</strong> لا تشارك هذا الكود مع أي شخص. فريق صنايعي لن يطلب منك هذا الكود أبداً.
        </div>


            </p>
        @endif
    </div>

    <div class="footer">
        © {{ date('Y') }} صنايعي - منصة الحرفيين الموثوقة<br>
        هذا إيميل تلقائي، يرجى عدم الرد عليه.
    </div>
</div>
</body>
</html>
