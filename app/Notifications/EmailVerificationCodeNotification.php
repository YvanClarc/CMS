<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationCodeNotification extends Notification
{
    use Queueable;

    protected $verificationCode;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $verificationCode)
    {
        $this->verificationCode = $verificationCode;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Email Verification Code')
            ->greeting("Hello {$notifiable->name},")
            ->line('Your email verification code is:')
            ->line('')
            ->line("<span style=\"font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #2563eb;\">{$this->verificationCode}</span>")
            ->line('')
            ->line('This code will expire in 10 minutes.')
            ->line('If you did not request this verification code, please ignore this email.')
            ->line('Do not share this code with anyone.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'verification_code' => $this->verificationCode,
        ];
    }
}
