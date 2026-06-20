<?php

namespace App\Notifications;

use App\Models\PostResponse;
use App\Models\ServicePost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewPostResponseNotification extends Notification
{
    use Queueable;

    public function __construct(
        public ServicePost  $post,
        public PostResponse $response
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'           => 'new_post_response',
            'post_id'        => $this->post->id,
            'post_title'     => $this->post->title,
            'response_id'    => $this->response->id,
            'craftsman_name' => $this->response->craftsman->full_name,
            'offered_price'  => $this->response->offered_price,
            'message'        => 'رد جديد على طلبك: ' . $this->post->title
                                . ' من ' . $this->response->craftsman->full_name,
        ];
    }
}
