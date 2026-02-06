<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\CaseController;
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
    // Pending approval route
    Route::get('pending-approval', function () {
        return Inertia::render('auth/pending-approval');
    })->name('pending-approval');

    // Smart redirect to appropriate dashboard based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        if ($user->status !== 'active') {
            return redirect()->route('pending-approval');
        }
        
        if ($user->isAdmin()) {
            return redirect()->route('admin-dashboard');
        } else {
            return redirect()->route('client-dashboard');
        }
    })->name('dashboard');

    // Role-specific dashboard routes with active status check
    Route::middleware('active')->group(function () {
        Route::get('admin/dashboard', function () {
            return Inertia::render('admin-dashboard', [
                'totalUsers' => \App\Models\User::count(),
            ]);
        })->middleware('role:admin')->name('admin-dashboard');

        Route::get('client/dashboard', function () {
            return Inertia::render('client-dashboard');
        })->middleware('role:client')->name('client-dashboard');

        // Admin user management routes
        Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
            Route::resource('users', UserController::class);
            Route::post('users/{user}/approve', [UserController::class, 'approve'])->name('users.approve');
            Route::post('users/{user}/decline', [UserController::class, 'decline'])->name('users.decline');
        });

        // Client case management routes
        Route::middleware('role:client')->prefix('client')->name('client.')->group(function () {
            Route::get('cases', [CaseController::class, 'index'])->name('cases.index');
            Route::post('cases', [CaseController::class, 'store'])->name('cases.store');
            Route::put('cases/{case}', [CaseController::class, 'update'])->name('cases.update');
            Route::delete('cases/{case}', [CaseController::class, 'destroy'])->name('cases.destroy');
            Route::post('cases/{case}/documents', [CaseController::class, 'uploadDocument'])->name('cases.uploadDocument');
            Route::delete('cases/{case}/documents/{document}', [CaseController::class, 'deleteDocument'])->name('cases.deleteDocument');
        });
    });
});

require __DIR__.'/settings.php';
