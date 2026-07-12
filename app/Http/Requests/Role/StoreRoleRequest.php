<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    /**
     * Authorize the request — authorization is handled by the
     * admin middleware / policy on the route, so allow here.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for creating a role.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:80'],
            'slug' => [
                'nullable',
                'string',
                'min:2',
                'max:80',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('roles', 'slug'),
            ],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Human-readable validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'name.min' => 'Role name must be at least 2 characters.',
            'name.max' => 'Role name cannot exceed 80 characters.',
            'slug.regex' => 'Slug may only contain lowercase letters, numbers, and hyphens.',
            'slug.unique' => 'This slug is already taken.',
            'description.max' => 'Description cannot exceed 500 characters.',
        ];
    }

    /**
     * Prepare data for validation — auto-generate slug when missing.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->filled('slug') && $this->filled('name')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->input('name')),
            ]);
        }
    }
}
