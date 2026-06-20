<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewBookingNotification extends Notification
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'           => 'new_booking',
            'booking_id'     => $this->booking->id,
            'booking_number' => $this->booking->booking_number,
            'client_name'    => $this->booking->client->name,
            'service_title'  => $this->booking->service_title,
            'booking_date'   => $this->booking->booking_date->format('Y-m-d'),
            'message'        => 'حجز جديد من ' . $this->booking->client->name,
        ];
    }
}
