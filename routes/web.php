<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Middleware to redirect to role-specific dashboard after auth
Route::middleware(['auth', 'verified'])->group(function () {
    // Smart redirect to appropriate dashboard based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        if ($user->isAdmin()) {
            return redirect()->route('admin-dashboard');
        } elseif ($user->isLawyer()) {
            return redirect()->route('lawyer-dashboard');
        } else {
            return redirect()->route('client-dashboard');
        }
    })->name('dashboard');

    // Role-specific dashboard routes
    Route::get('admin/dashboard', function () {
        return Inertia::render('admin-dashboard');
    })->middleware('role:admin')->name('admin-dashboard');

    Route::get('lawyer/dashboard', function () {
        return Inertia::render('lawyer-dashboard');
    })->middleware('role:lawyer')->name('lawyer-dashboard');

    Route::get('client/dashboard', function () {
        return Inertia::render('client-dashboard');
    })->middleware('role:client')->name('client-dashboard');
});

require __DIR__.'/settings.php';
