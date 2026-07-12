<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('bio');
            $table->timestamp('last_login_at')->nullable()->index()->after('avatar');
            $table->softDeletes();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['permission_id', 'role_id']);
        });

        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('key');
            $table->json('value')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'key']);
        });

        Schema::create('resume_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('target_role')->nullable();
            $table->longText('resume_text');
            $table->unsignedTinyInteger('score')->nullable();
            $table->json('analysis')->nullable();
            $table->timestamps();
        });

        Schema::create('answer_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->longText('answer');
            $table->unsignedTinyInteger('score')->nullable();
            $table->json('feedback')->nullable();
            $table->timestamps();
        });

        Schema::create('mock_interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('target_role');
            $table->string('difficulty')->default('medium');
            $table->json('questions');
            $table->json('answers')->nullable();
            $table->json('evaluation')->nullable();
            $table->string('status')->default('in_progress');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('mock_interviews');
        Schema::dropIfExists('answer_evaluations');
        Schema::dropIfExists('resume_analyses');
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex(['last_login_at']);
            $table->dropColumn(['avatar', 'last_login_at']);
        });
    }
};
