<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Craftsman;
class CraftsmanApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $craftsman;

    // ملاحظة: شلنا $password من هنا، لأن الحرفي اختار كلمة مروره بنفسه وقت التسجيل
    // فمش محتاجين نبعتها له تاني بالإيميل (وده أسلم من ناحية الأمان كمان)
    public function __construct(Craftsman $craftsman)
    {
        $this->craftsman = $craftsman;
    }

public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم قبول طلبك',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.craftsman-approved',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
