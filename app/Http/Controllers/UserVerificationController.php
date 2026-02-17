<?php

namespace App\Http\Controllers;

use App\Notifications\EmailVerificationCodeNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserVerificationController extends Controller
{
    /**
     * Show the email verification verification form.
     */
    public function showVerificationForm()
    {
        return Inertia::render('auth/verify-email', [
            'isVerified' => auth()->user()->email_verified_at !== null,
        ]);
    }

    /**
     * Send verification code to user's email.
     */
    public function sendVerificationCode(Request $request)
    {
        $user = auth()->user();

        // Check if email is already verified
        if ($user->email_verified_at !== null) {
            return response()->json(['message' => 'Email is already verified'], 422);
        }

        // Generate a 6-digit verification code
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store the code with expiration time (10 minutes)
        $user->update([
            'verification_code' => $verificationCode,
            'verification_code_expires_at' => now()->addMinutes(10),
        ]);

        // Send the code via email
        $user->notify(new EmailVerificationCodeNotification($verificationCode));

        return response()->json([
            'message' => 'Verification code sent to your email. Please check your inbox.',
            'email' => $user->email,
        ]);
    }

    /**
     * Verify the email with the provided code.
     */
    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'verification_code' => 'required|string|size:6',
        ]);

        $user = auth()->user();

        // Check if a verification code exists
        if (!$user->verification_code) {
            return response()->json(['message' => 'No verification code found. Please request a new one.'], 422);
        }

        // Check if the code is expired
        if (now()->isAfter($user->verification_code_expires_at)) {
            $user->update([
                'verification_code' => null,
                'verification_code_expires_at' => null,
            ]);
            return response()->json(['message' => 'Verification code has expired. Please request a new one.'], 422);
        }

        // Check if the code matches
        if ($user->verification_code !== $validated['verification_code']) {
            return response()->json(['message' => 'Invalid verification code. Please try again.'], 422);
        }

        // Mark email as verified
        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'Email verified successfully!',
            'isVerified' => true,
        ]);
    }

    /**
     * Resend verification code.
     */
    public function resendVerificationCode(Request $request)
    {
        $user = auth()->user();

        // Check if email is already verified
        if ($user->email_verified_at !== null) {
            return response()->json(['message' => 'Email is already verified'], 422);
        }

        // Check if previous code is still valid (prevent spam)
        if ($user->verification_code && now()->isBefore($user->verification_code_expires_at?->subMinutes(9))) {
            return response()->json([
                'message' => 'Please wait before requesting a new code.',
                'retryAfter' => $user->verification_code_expires_at->diffInSeconds(now()),
            ], 429);
        }

        return $this->sendVerificationCode($request);
    }
}
