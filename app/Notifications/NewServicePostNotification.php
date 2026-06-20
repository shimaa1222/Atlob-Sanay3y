<?php

namespace App\Notifications;

use App\Models\ServicePost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewServicePostNotification extends Notification
{
    use Queueable;

    public function __construct(public ServicePost $post) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'        => 'new_service_post',
            'post_id'     => $this->post->id,
            'post_title'  => $this->post->title,
            'city'        => $this->post->city,
            'urgency'     => $this->post->urgency,
            'client_name' => $this->post->client->name,
            'message'     => 'طلب خدمة جديد في ' . $this->post->city . ': ' . $this->post->title,
        ];
    }
}
