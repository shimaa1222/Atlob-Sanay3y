<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $otp,
        public string $purpose = 'email_verification'
    ) {}

    public function build(): static
    {
        $subjects = [
            'email_verification' => 'كود تأكيد البريد الإلكتروني - صنايعي',
            'password_reset'     => 'كود إعادة تعيين كلمة المرور - صنايعي',
        ];

        return $this->subject($subjects[$this->purpose] ?? 'كود التحقق - صنايعي')
                    ->view('emails.otp')
                    ->with([
                        'otp'     => $this->otp,
                        'purpose' => $this->purpose,
                    ]);
    }
}
