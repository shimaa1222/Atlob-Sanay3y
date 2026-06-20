<?php

namespace App\Notifications;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewReviewNotification extends Notification
{
    use Queueable;


    public function __construct(public Review $review)
    {

    }


    public function via($notifiable): array
    {
        return ['database'];
    }


    public function toArray($notifiable): array
    {
        return [

            'type'=>'new_review',

            'review_id'=>$this->review->id,

            'rating'=>$this->review->rating,

            'client_name'=>$this->review->client->name,

            'message'=>
            'قام '.$this->review->client->name.
            ' بإضافة تقييم جديد لك'

        ];
    }
}
