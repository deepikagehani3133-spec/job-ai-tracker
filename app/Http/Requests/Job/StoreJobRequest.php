<?php

namespace App\Http\Requests\Job;

use App\Enums\JobStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route is auth-protected; ownership checked in controller/policy
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'company' => ['required', 'string', 'min:2', 'max:191'],
            'role' => ['required', 'string', 'min:2', 'max:191'],
            'status' => ['nullable', 'string', Rule::in(JobStatus::values())],
            'notes' => ['nullable', 'string', 'max:5000'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'location' => ['nullable', 'string', 'max:191'],
            'source_url' => ['nullable', 'url', 'max:191'],
            'contact_name' => ['nullable', 'string', 'max:191'],
            'contact_email' => ['nullable', 'email', 'max:191'],
            'applied_at' => ['nullable', 'date'],
            'interview_at' => ['nullable', 'date', 'after_or_equal:applied_at'],
        ];
    }
}
