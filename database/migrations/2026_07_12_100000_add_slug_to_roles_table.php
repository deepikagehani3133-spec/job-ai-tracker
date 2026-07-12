<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name')->unique();
        });

        // Backfill slugs for existing rows.
        DB::table('roles')->whereNull('slug')->orderBy('id')->each(function ($role) {
            DB::table('roles')
                ->where('id', $role->id)
                ->update(['slug' => \Illuminate\Support\Str::slug($role->name)]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
