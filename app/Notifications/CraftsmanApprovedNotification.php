<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CraftsmanApprovedNotification extends Notification
{
    use Queueable;

    public function __construct()
    {

    }


    public function via($notifiable)
    {
        return ['mail'];
    }


    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('تم قبول حسابك كحرفي')
            ->greeting('مرحبا بك')
            ->line('تمت الموافقة على طلب التسجيل الخاص بك.')
            ->line('يمكنك الآن تسجيل الدخول واستخدام المنصة.')
            ->action('تسجيل الدخول', url('/login'))
            ->line('شكراً لانضمامك إلينا');
    }
}
