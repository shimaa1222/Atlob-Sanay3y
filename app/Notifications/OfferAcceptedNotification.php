<?php

namespace App\Notifications;

use App\Models\PostResponse;
use App\Models\ServicePost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OfferAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public ServicePost $post,
        public PostResponse $response
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'offer_accepted',

            'post_id' => $this->post->id,
            'post_title' => $this->post->title,

            'client_name' => $this->post->client->name,
            'client_phone' => $this->post->client->phone,

            'message' => 'تم قبول عرضك ويمكنك التواصل مع العميل الآن.',
        ];
    }
}