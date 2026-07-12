<?php

namespace Tests\Feature;

use App\Enums\JobStatus;
use App\Models\TrackedJob;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JobApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_jobs_are_scoped_to_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $ownJob = $this->createJob($user, ['company' => 'Own Company']);
        $this->createJob($otherUser, ['company' => 'Private Company']);

        Sanctum::actingAs($user);

        $this->getJson('/api/jobs')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $ownJob->id)
            ->assertJsonPath('data.0.company', 'Own Company');
    }

    public function test_user_cannot_view_another_users_job(): void
    {
        $user = User::factory()->create();
        $otherJob = $this->createJob(User::factory()->create());

        Sanctum::actingAs($user);

        $this->getJson("/api/jobs/{$otherJob->id}")->assertForbidden();
    }

    public function test_user_can_create_a_job_and_get_valid_status_metadata(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/jobs/meta')->assertOk()->assertJsonCount(5, 'statuses');

        $this->postJson('/api/jobs', [
            'company' => 'Acme',
            'role' => 'Backend Engineer',
            'location' => 'Remote',
            'applied_at' => '2026-07-12',
        ])
            ->assertCreated()
            ->assertJsonPath('data.company', 'Acme')
            ->assertJsonPath('data.status', JobStatus::Applied->value);

        $this->assertDatabaseHas('tracked_jobs', [
            'user_id' => $user->id,
            'company' => 'Acme',
            'status' => JobStatus::Applied->value,
        ]);
    }

    public function test_illegal_status_transition_is_rejected(): void
    {
        $user = User::factory()->create();
        $job = $this->createJob($user, ['status' => JobStatus::Rejected->value]);
        Sanctum::actingAs($user);

        $this->putJson("/api/jobs/{$job->id}", [
            'status' => JobStatus::Interview->value,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    /** @param array<string, mixed> $attributes */
    private function createJob(User $user, array $attributes = []): TrackedJob
    {
        return TrackedJob::create(array_merge([
            'user_id' => $user->id,
            'company' => 'Example Co',
            'role' => 'Developer',
            'status' => JobStatus::Applied->value,
        ], $attributes));
    }
}
