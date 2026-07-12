<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tracked_jobs', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('status');
            $table->unsignedInteger('salary_min')->nullable()->after('notes');
            $table->unsignedInteger('salary_max')->nullable()->after('salary_min');
            $table->string('location')->nullable()->after('salary_max');
            $table->string('source_url')->nullable()->after('location');
            $table->string('contact_name')->nullable()->after('source_url');
            $table->string('contact_email')->nullable()->after('contact_name');
            $table->date('applied_at')->nullable()->after('contact_email');
            $table->dateTime('interview_at')->nullable()->after('applied_at');
            $table->timestamp('archived_at')->nullable()->after('interview_at');
            $table->softDeletes();

            $table->index(['user_id', 'status'], 'tracked_jobs_user_status_idx');
            $table->index('applied_at');
        });
    }

    public function down(): void
    {
        Schema::table('tracked_jobs', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex('tracked_jobs_user_status_idx');
            $table->dropIndex(['applied_at']);
            $table->dropColumn([
                'notes',
                'salary_min',
                'salary_max',
                'location',
                'source_url',
                'contact_name',
                'contact_email',
                'applied_at',
                'interview_at',
                'archived_at',
            ]);
        });
    }
};
