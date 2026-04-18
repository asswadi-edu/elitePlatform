<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Tahoma', 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .logo { font-size: 24px; font-weight: bold; color: #e67e22; margin-bottom: 20px; }
        .header { font-size: 20px; color: #2d3436; margin-bottom: 15px; font-weight: bold; }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e67e22; background: #fff5eb; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 20px 0; border: 2px dashed #e67e22; }
        .footer { font-size: 13px; color: #636e72; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">منصة النخبة | Elite Platform</div>
        <div class="header">طلب استعادة كلمة المرور</div>
        <p>لقد استلمنا طلباً لإعادة تعيين كلمة مرور حسابك. يرجى استخدام رمز التحقق التالي للمتابعة:</p>
        <div class="code">{{ $code }}</div>
        <p>هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
        <p>إذا لم تكن قد طلبت استعادة كلمة المرور، يرجى تجاهل هذا البريد، ولن تتغير كلمة مرورك.</p>
        <div class="footer">
            جميع الحقوق محفوظة &copy; {{ date('Y') }} منصة النخبة
        </div>
    </div>
</body>
</html>
