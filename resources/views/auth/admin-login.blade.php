<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول - لوحة تحكم صنايعي</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Tahoma', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e293b, #334155);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            background: #fff;
            border-radius: 16px;
            padding: 38px 36px;
            width: 100%;
            max-width: 380px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        }
        .login-logo {
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 6px;
        }
        .login-sub {
            text-align: center;
            color: #6b7280;
            font-size: 0.85rem;
            margin-bottom: 28px;
        }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.85rem; color: #374151; margin-bottom: 6px; font-weight: 600; }
        .form-control {
            width: 100%;
            padding: 11px 14px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.92rem;
            font-family: inherit;
        }
        .form-control:focus { outline: none; border-color: #2563eb; }
        .checkbox-row { display: flex; align-items: center; gap: 6px; margin-bottom: 20px; font-size: 0.85rem; color: #6b7280; }
        .btn-submit {
            width: 100%;
            background: #2563eb;
            color: #fff;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-size: 0.95rem;
            cursor: pointer;
            font-family: inherit;
        }
        .btn-submit:hover { background: #1d4ed8; }
        .alert-error {
            background: #fee2e2;
            color: #dc2626;
            padding: 11px 14px;
            border-radius: 8px;
            font-size: 0.85rem;
            margin-bottom: 18px;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="login-logo">🛠️ صنايعي</div>
        <div class="login-sub">لوحة تحكم الأدمن</div>

        @if(session('error'))
            <div class="alert-error">{{ session('error') }}</div>
        @endif
        @if($errors->any())
            <div class="alert-error">{{ $errors->first() }}</div>
        @endif

        <form action="{{ route('admin.login') }}" method="POST">
            @csrf

            <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" name="email" class="form-control" value="{{ old('email') }}" required autofocus>
            </div>

            <div class="form-group">
                <label class="form-label">كلمة المرور</label>
                <input type="password" name="password" class="form-control" required>
            </div>

            <div class="checkbox-row">
                <input type="checkbox" name="remember" id="remember">
                <label for="remember">تذكرني</label>
            </div>

            <button type="submit" class="btn-submit">تسجيل الدخول</button>
        </form>
    </div>
</body>
</html>