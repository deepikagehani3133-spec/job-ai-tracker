<?php

namespace App\Http\Controllers\Admin;

use App\Enums\JobStatus;
use App\Http\Controllers\Controller;
use App\Models\TrackedJob;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * System-wide stats for the admin dashboard.
 * Every query is bounded so the response is fast even with millions of rows.
 */
class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $now = Carbon::now();
        $sevenDaysAgo = $now->copy()->subDays(7);
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // --- KPIs ---
        $totalUsers = User::count();
        $activeUsers = User::where('last_login_at', '>=', $sevenDaysAgo)->count();
        $totalJobs = TrackedJob::withTrashed()->count();
        $interviewCount = TrackedJob::where('status', JobStatus::Interview->value)->count();
        $offerCount = TrackedJob::where('status', JobStatus::Offer->value)->count();
        $rejectedCount = TrackedJob::where('status', JobStatus::Rejected->value)->count();

        $interviewRate = $totalJobs > 0
            ? round(($interviewCount / $totalJobs) * 100, 1)
            : 0.0;

        // --- Jobs by status (for bar chart) ---
        $jobsByStatus = TrackedJob::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // --- Jobs created per day, last 30 days (for line chart) ---
        $jobsPerDay = TrackedJob::query()
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date')
            ->toArray();

        // Fill missing days with 0 so the chart x-axis is continuous.
        $series = [];
        for ($i = 29; $i >= 0; $i--) {
            $d = $now->copy()->subDays($i)->toDateString();
            $series[] = [
                'date' => $d,
                'count' => $jobsPerDay[$d] ?? 0,
            ];
        }

        // --- Top companies ---
        $topCompanies = TrackedJob::query()
            ->select('company', DB::raw('count(*) as count'))
            ->groupBy('company')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // --- Role distribution (for pie chart) ---
        $roleDistribution = DB::table('roles')
            ->leftJoin('users', 'users.role_id', '=', 'roles.id')
            ->select('roles.name as role', DB::raw('count(users.id) as count'))
            ->groupBy('roles.id', 'roles.name')
            ->get();

        // --- Recent activity (last 10 job creations) ---
        $recentJobs = TrackedJob::query()
            ->with('user:id,name,email')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (TrackedJob $j) => [
                'id' => $j->id,
                'company' => $j->company,
                'role' => $j->role,
                'status' => $j->status?->value,
                'user' => $j->user?->only(['id', 'name', 'email']),
                'created_at' => $j->created_at?->toISOString(),
            ]);

        return response()->json([
            'kpi' => [
                'total_users' => $totalUsers,
                'active_users_7d' => $activeUsers,
                'total_jobs' => $totalJobs,
                'interview_count' => $interviewCount,
                'offer_count' => $offerCount,
                'rejected_count' => $rejectedCount,
                'interview_rate' => $interviewRate,
            ],
            'jobs_by_status' => $jobsByStatus,
            'jobs_per_day' => $series,
            'top_companies' => $topCompanies,
            'role_distribution' => $roleDistribution,
            'recent_jobs' => $recentJobs,
        ]);
    }
}
