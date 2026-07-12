<?php

namespace App\Providers;

use App\Models\Role;
use App\Models\TrackedJob;
use App\Policies\JobPolicy;
use App\Policies\RolePolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // The policy class names intentionally omit the model prefix, so
        // register them explicitly instead of relying on convention-based
        // policy discovery.
        Gate::policy(TrackedJob::class, JobPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
