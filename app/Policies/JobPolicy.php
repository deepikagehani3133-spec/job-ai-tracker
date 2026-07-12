<?php

namespace App\Policies;

use App\Models\TrackedJob;
use App\Models\User;

class JobPolicy
{
    /**
     * Any authenticated user can list their own jobs.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * A user can only view their own job. Admins can view all.
     */
    public function view(User $user, TrackedJob $job): bool
    {
        return $this->ownsOrAdmins($user, $job);
    }

    public function create(User $user): bool
    {
        // Account suspension has not been modelled yet. Every authenticated
        // account can create its own tracked jobs until that capability exists.
        return true;
    }

    public function update(User $user, TrackedJob $job): bool
    {
        return $this->ownsOrAdmins($user, $job);
    }

    public function delete(User $user, TrackedJob $job): bool
    {
        return $this->ownsOrAdmins($user, $job);
    }

    public function archive(User $user, TrackedJob $job): bool
    {
        return $this->ownsOrAdmins($user, $job);
    }

    private function ownsOrAdmins(User $user, TrackedJob $job): bool
    {
        if ($user->role?->slug === 'admin') {
            return true;
        }
        return $job->user_id === $user->id;
    }
}
