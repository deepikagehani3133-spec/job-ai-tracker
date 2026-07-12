<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    /**
     * Determine whether the user can view any roles.
     */
    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can view a specific role.
     */
    public function view(User $user, Role $role): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can create roles.
     */
    public function create(User $user): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can update a role.
     */
    public function update(User $user, Role $role): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Determine whether the user can delete a role.
     * System roles (admin/user) cannot be deleted.
     */
    public function delete(User $user, Role $role): bool
    {
        return $this->isAdmin($user) && ! $role->isSystemRole();
    }

    /**
     * Determine whether the user can restore a soft-deleted role.
     */
    public function restore(User $user, Role $role): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Helper: is the given user an admin?
     */
    protected function isAdmin(User $user): bool
    {
        return $user->role?->slug === 'admin';
    }
}
