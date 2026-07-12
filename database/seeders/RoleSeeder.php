<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    /**
     * Default system roles. Idempotent — re-running this seeder
     * updates names/descriptions of existing roles without dropping data.
     */
    private const DEFAULTS = [
        [
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'Full administrative access to manage the system, users, and roles.',
        ],
        [
            'name' => 'User',
            'slug' => 'user',
            'description' => 'Standard user with access to their own job tracking and interview prep.',
        ],
    ];

    private const PERMISSIONS = [
        ['name' => 'View dashboard', 'slug' => 'dashboard.view'],
        ['name' => 'Manage jobs', 'slug' => 'jobs.manage'],
        ['name' => 'Use AI tools', 'slug' => 'ai.use'],
        ['name' => 'Manage profile', 'slug' => 'profile.manage'],
        ['name' => 'Manage users', 'slug' => 'users.manage'],
        ['name' => 'Manage roles', 'slug' => 'roles.manage'],
        ['name' => 'View administration', 'slug' => 'admin.view'],
    ];

    public function run(): void
    {
        foreach (self::DEFAULTS as $row) {
            Role::updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'name' => $row['name'],
                    'description' => $row['description'],
                ]
            );
        }

        foreach (self::PERMISSIONS as $row) {
            Permission::updateOrCreate(['slug' => $row['slug']], $row);
        }

        $userRole = Role::findBySlug('user');
        $userRole?->permissions()->sync(
            Permission::whereIn('slug', ['dashboard.view', 'jobs.manage', 'ai.use', 'profile.manage'])
                ->pluck('id')
        );
    }
}
