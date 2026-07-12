<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public utility routes (kept for compatibility — should eventually be auth-protected)

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth management
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);

    Route::get('/analytics', [DashboardController::class, 'analytics']);
    Route::post('/generate-questions', [InterviewController::class, 'generateQuestions']);
    Route::post('/ai/resume-analyses', [AiController::class, 'analyzeResume']);
    Route::post('/ai/answer-evaluations', [AiController::class, 'evaluateAnswer']);
    Route::post('/mock-interviews', [AiController::class, 'startMockInterview']);
    Route::post('/mock-interviews/{mockInterview}/submit', [AiController::class, 'submitMockInterview']);

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);

    // Job tracking
    Route::get('/jobs/meta', [JobController::class, 'meta']);
    Route::post('/jobs/bulk-delete', [JobController::class, 'bulkDelete']);
    Route::get('/jobs', [JobController::class, 'index']);
    Route::post('/jobs', [JobController::class, 'store']);
    Route::get('/jobs/{job}', [JobController::class, 'show']);
    Route::put('/jobs/{job}', [JobController::class, 'update']);
    Route::delete('/jobs/{job}', [JobController::class, 'destroy']);
    Route::post('/jobs/{job}/archive', [JobController::class, 'archive']);
    Route::post('/jobs/{job}/restore', [JobController::class, 'restore']);

    // Role management (admin only)
    Route::middleware('admin')->prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::get('/{role}', [RoleController::class, 'show']);
        Route::put('/{role}', [RoleController::class, 'update']);
        Route::delete('/{role}', [RoleController::class, 'destroy']);
        Route::post('/{id}/restore', [RoleController::class, 'restore']);
        Route::delete('/{id}/force', [RoleController::class, 'forceDestroy']);

        // Permission management
        Route::get('/{role}/permissions', [RoleController::class, 'permissions']);
        Route::post('/{role}/permissions', [RoleController::class, 'attachPermissions']);
        Route::delete('/{role}/permissions/{permission}', [RoleController::class, 'detachPermission']);
    });

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'stats']);
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/user-roles', [UserController::class, 'roles']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});