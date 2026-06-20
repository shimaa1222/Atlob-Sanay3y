<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $statusLabels = [
            'confirmed'   => 'تم تأكيد حجزك',
            'in_progress' => 'بدأ الحرفي في تنفيذ الخدمة',
            'completed'   => 'تم إكمال الخدمة بنجاح',
            'rejected'    => 'تم رفض طلب الحجز',
            'cancelled'   => 'تم إلغاء الحجز',
        ];

        return [
            'type'           => 'booking_status_updated',
            'booking_id'     => $this->booking->id,
            'booking_number' => $this->booking->booking_number,
            'status'         => $this->booking->status,
            'craftsman_name' => $this->booking->craftsman->full_name,
            'service_title'  => $this->booking->service_title,
            'message'        => $statusLabels[$this->booking->status]
                                ?? 'تم تحديث حالة الحجز',
            'reason'         => $this->booking->cancellation_reason,
        ];
    }
}
