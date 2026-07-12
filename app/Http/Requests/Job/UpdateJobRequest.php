<?php

namespace App\Http\Requests\Job;

use App\Enums\JobStatus;
use App\Models\TrackedJob;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'company' => ['sometimes', 'required', 'string', 'min:2', 'max:191'],
            'role' => ['sometimes', 'required', 'string', 'min:2', 'max:191'],
            'status' => ['sometimes', 'required', 'string', Rule::in(JobStatus::values())],
            'notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'salary_min' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'salary_max' => ['sometimes', 'nullable', 'integer', 'min:0', 'gte:salary_min'],
            'location' => ['sometimes', 'nullable', 'string', 'max:191'],
            'source_url' => ['sometimes', 'nullable', 'url', 'max:191'],
            'contact_name' => ['sometimes', 'nullable', 'string', 'max:191'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:191'],
            'applied_at' => ['sometimes', 'nullable', 'date'],
            'interview_at' => ['sometimes', 'nullable', 'date', 'after_or_equal:applied_at'],
        ];
    }

    /**
     * Status updates have a separate rule: the transition must be legal.
     * Throw a 422 with a clear message instead of a 500.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (! $this->filled('status')) {
                return;
            }
            /** @var TrackedJob|null $job */
            $job = $this->route('job');
            if (! $job) {
                return;
            }
            $from = $job->status;
            $to = JobStatus::tryFrom($this->input('status'));
            if (! $to) {
                $v->errors()->add('status', 'Invalid status value.');
                return;
            }
            try {
                app(\App\Services\JobStatusTransition::class)
                    ->assertCanTransition($from, $to);
            } catch (\InvalidArgumentException $e) {
                $v->errors()->add('status', $e->getMessage());
            }
        });
    }
}
