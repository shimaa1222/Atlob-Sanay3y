<?php

namespace App\Notifications;

use App\Models\Craftsman;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCraftsmanRegistrationNotification extends Notification
{
    use Queueable;

    public function __construct(public Craftsman $craftsman) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'           => 'new_craftsman_registration',
            'craftsman_id'   => $this->craftsman->id,
            'craftsman_name' => $this->craftsman->first_name . ' ' . $this->craftsman->last_name,
            'city'           => $this->craftsman->city,
            'email'          => $this->craftsman->email,
            'message'        => 'طلب تسجيل حرفي جديد: ' . $this->craftsman->first_name . ' ' . $this->craftsman->last_name,
        ];
    }
}
