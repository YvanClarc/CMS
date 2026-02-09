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
                'pendingCaseRequests' => \App\Models\CaseRequest::where('status', 'pending')->count(),
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
            
            // Case request review routes
            Route::get('case-requests', [\App\Http\Controllers\CaseRequestController::class, 'index'])->name('case-requests.index');
            Route::get('case-requests/{caseRequest}', [\App\Http\Controllers\CaseRequestController::class, 'show'])->name('case-requests.show');
            Route::post('case-requests/{caseRequest}/accept', [\App\Http\Controllers\CaseRequestController::class, 'accept'])->name('case-requests.accept');
            Route::post('case-requests/{caseRequest}/reject', [\App\Http\Controllers\CaseRequestController::class, 'reject'])->name('case-requests.reject');
            Route::post('case-requests/{caseRequest}/request-info', [\App\Http\Controllers\CaseRequestController::class, 'requestInfo'])->name('case-requests.request-info');
            Route::post('case-requests/{caseRequest}/decline', [\App\Http\Controllers\CaseRequestController::class, 'decline'])->name('case-requests.decline');
        });

        // Client case management routes
        Route::middleware('role:client')->prefix('client')->name('client.')->group(function () {
            Route::get('cases', [CaseController::class, 'index'])->name('cases.index');
            Route::post('cases', [CaseController::class, 'store'])->name('cases.store');
            Route::put('cases/{case}', [CaseController::class, 'update'])->name('cases.update');
            Route::delete('cases/{case}', [CaseController::class, 'destroy'])->name('cases.destroy');
            Route::post('cases/{case}/documents', [CaseController::class, 'uploadDocument'])->name('cases.uploadDocument');
            Route::delete('cases/{case}/documents/{document}', [CaseController::class, 'deleteDocument'])->name('cases.deleteDocument');
            
            // Agreement signing routes
            Route::post('agreements/{agreement}/sign', [\App\Http\Controllers\CaseRequestController::class, 'signAgreement'])->name('agreements.sign');
            Route::post('agreements/{agreement}/decline', [\App\Http\Controllers\CaseRequestController::class, 'declineAgreement'])->name('agreements.decline');
        });
    });
});

require __DIR__.'/settings.php';
