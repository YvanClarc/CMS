<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AccountStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$statuses): Response
    {
        $user = auth()->user();
        
        if (!$user) {
            return $next($request);
        }

        // If no statuses specified, check for 'active'
        if (empty($statuses)) {
            $statuses = ['active'];
        }

        if (!in_array($user->status, $statuses)) {
            return redirect()->route('pending-approval');
        }

        return $next($request);
    }
}
