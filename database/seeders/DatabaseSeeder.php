<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Order matters: roles first so the admin user can attach to one.
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
        ]);
    }
}
