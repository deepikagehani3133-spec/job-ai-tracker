<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Authorize the request — handled by middleware/policy.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for updating a role.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var \App\Models\Role|null $role */
        $role = $this->route('role');

        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:80'],
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'min:2',
                'max:80',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('roles', 'slug')->ignore($role?->id),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'slug.regex' => 'Slug may only contain lowercase letters, numbers, and hyphens.',
            'slug.unique' => 'This slug is already taken.',
        ];
    }
}
