<?php

namespace App\Providers;

use App\Models\Agreement;
use App\Policies\AgreementPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Agreement::class => AgreementPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Policies are auto-discovered in Laravel 11+
        // If using an older version, uncomment below:
        // $this->registerPolicies();
    }
}
