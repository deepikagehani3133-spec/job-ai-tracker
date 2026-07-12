<?php

namespace App\Http\Controllers;

use App\Enums\JobStatus;
use App\Models\TrackedJob;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get analytics data for the authenticated user's dashboard.
     */
    public function analytics()
    {
        $userId = auth()->id();
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $ninetyDaysAgo = $now->copy()->subDays(90);

        // Basic counts
        $totalJobs = TrackedJob::where('user_id', $userId)->count();
        $appliedJobs = TrackedJob::where('user_id', $userId)->where('status', JobStatus::Applied->value)->count();
        $interviewJobs = TrackedJob::where('user_id', $userId)->where('status', JobStatus::Interview->value)->count();
        $offerJobs = TrackedJob::where('user_id', $userId)->where('status', JobStatus::Offer->value)->count();
        $rejectedJobs = TrackedJob::where('user_id', $userId)->where('status', JobStatus::Rejected->value)->count();
        $withdrawnJobs = TrackedJob::where('user_id', $userId)->where('status', JobStatus::Withdrawn->value)->count();

        // Application trends (last 30 days)
        $applicationTrend = TrackedJob::where('user_id', $userId)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->date => (int) $item->count];
            });

        // Fill missing dates with zero
        $filledTrend = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->toDateString();
            $filledTrend[$date] = $applicationTrend[$date] ?? 0;
        }

        // Status distribution for pie chart
        $statusDistribution = TrackedJob::where('user_id', $userId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKey(function ($item) {
                $statusLabel = ucfirst(strtolower($item->status));
                return [$statusLabel => (int) $item->count];
            });

        // Average days between application and interview (for those who got interviews)
        $avgDaysToInterview = TrackedJob::where('user_id', $userId)
            ->whereNotNull('applied_at')
            ->whereNotNull('interview_at')
            ->where('user_id', $userId)
            ->avg(DB::raw('DATEDIFF(interview_at, applied_at)'));

        // Success rates
        $applicationToInterviewRate = $appliedJobs > 0
            ? round(($interviewJobs / $appliedJobs) * 100, 1)
            : 0;

        $interviewToOfferRate = $interviewJobs > 0
            ? round(($offerJobs / $interviewJobs) * 100, 1)
            : 0;

        $applicationToOfferRate = $appliedJobs > 0
            ? round(($offerJobs / $appliedJobs) * 100, 1)
            : 0;

        // Recent activity (last 10 applications)
        $recentActivity = TrackedJob::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get(['company', 'role', 'status', 'created_at'])
            ->map(function ($job) {
                return [
                    'company' => $job->company,
                    'role' => $job->role,
                    'status' => ucfirst(strtolower($job->status)),
                    'date' => $job->created_at->format('M d, Y'),
                ];
            });

        // Monthly application volume (last 6 months)
        $monthlyVolume = TrackedJob::where('user_id', $userId)
            ->where('created_at', '>=', $now->copy()->subMonths(6))
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKey(function ($item) {
                return [$item->month => (int) $item->count];
            });

        return response()->json([
            'summary' => [
                'total_jobs' => $totalJobs,
                'applied_jobs' => $appliedJobs,
                'interview_jobs' => $interviewJobs,
                'offer_jobs' => $offerJobs,
                'rejected_jobs' => $rejectedJobs,
                'withdrawn_jobs' => $withdrawnJobs,
            ],
            'rates' => [
                'application_to_interview' => $applicationToInterviewRate,
                'interview_to_offer' => $interviewToOfferRate,
                'application_to_offer' => $applicationToOfferRate,
                'avg_days_to_interview' => $avgDaysToInterview ? round($avgDaysToInterview, 1) : null,
            ],
            'trends' => [
                'daily_applications' => $filledTrend,
                'monthly_volume' => $monthlyVolume,
            ],
            'distribution' => [
                'status' => $statusDistribution,
            ],
            'recent_activity' => $recentActivity,
        ]);
    }
}