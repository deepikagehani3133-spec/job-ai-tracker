<?php

namespace App\Http\Controllers;

use App\Enums\JobStatus;
use App\Http\Requests\Job\StoreJobRequest;
use App\Http\Requests\Job\UpdateJobRequest;
use App\Http\Resources\JobResource;
use App\Models\TrackedJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    /**
     * GET /api/jobs
     *
     * Searchable, filterable, paginated list of the caller's jobs
     * (admins see everyone's).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string'],
            'archived' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort' => ['nullable', 'string', 'in:created_at,company,applied_at,interview_at'],
            'dir' => ['nullable', 'string', 'in:asc,desc'],
        ]);

        $user = $request->user();
        $isAdmin = $user->role?->slug === 'admin';

        $query = TrackedJob::query()
            ->search($request->input('q'))
            ->withStatus($request->input('status'));

        if (! $request->boolean('archived')) {
            $query->active();
        }

        if (! $isAdmin) {
            $query->forUser($user->id);
        }

        $sort = $request->input('sort', 'created_at');
        $dir = $request->input('dir', 'desc');
        $query->orderBy($sort, $dir);

        $jobs = $query->paginate($request->integer('per_page') ?: 15);

        return JobResource::collection($jobs)->response();
    }

    /**
     * GET /api/jobs/meta
     * Returns the list of valid statuses (so the frontend
     * never hardcodes the list).
     */
    public function meta(): JsonResponse
    {
        return response()->json([
            'statuses' => JobStatus::options(),
        ]);
    }

    /**
     * POST /api/jobs
     */
    public function store(StoreJobRequest $request): JsonResponse
    {
        $this->authorize('create', TrackedJob::class);

        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['status'] = $data['status'] ?? JobStatus::Applied->value;

        $job = TrackedJob::create($data);

        return (new JobResource($job))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/jobs/{job}
     */
    public function show(TrackedJob $job): JsonResponse
    {
        $this->authorize('view', $job);

        return (new JobResource($job))->response();
    }

    /**
     * PUT /api/jobs/{job}
     */
    public function update(UpdateJobRequest $request, TrackedJob $job): JsonResponse
    {
        $this->authorize('update', $job);

        $job->update($request->validated());

        return (new JobResource($job->fresh()))->response();
    }

    /**
     * DELETE /api/jobs/{job}
     */
    public function destroy(TrackedJob $job): JsonResponse
    {
        $this->authorize('delete', $job);

        $job->delete();

        return response()->json(['message' => 'Job deleted successfully.']);
    }

    /**
     * POST /api/jobs/{job}/archive
     */
    public function archive(TrackedJob $job): JsonResponse
    {
        $this->authorize('archive', $job);

        $job->update(['archived_at' => now()]);

        return (new JobResource($job->fresh()))->response();
    }

    /**
     * POST /api/jobs/{job}/restore
     */
    public function restore(TrackedJob $job): JsonResponse
    {
        $this->authorize('update', $job);

        $job->update(['archived_at' => null]);

        return (new JobResource($job->fresh()))->response();
    }

    /**
     * POST /api/jobs/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['integer'],
        ]);

        $user = $request->user();
        $query = TrackedJob::query()->whereIn('id', $data['ids']);
        if ($user->role?->slug !== 'admin') {
            $query->where('user_id', $user->id);
        }
        $count = $query->count();
        $query->delete();

        return response()->json([
            'message' => "{$count} job(s) deleted.",
            'count' => $count,
        ]);
    }
}
