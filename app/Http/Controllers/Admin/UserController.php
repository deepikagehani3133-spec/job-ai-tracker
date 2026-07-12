<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['q' => ['nullable', 'string', 'max:100'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        $users = User::query()->with('role:id,name,slug')->when($data['q'] ?? null, fn ($q, $term) => $q->where(fn ($b) => $b->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")))->latest()->paginate($data['per_page'] ?? 15);
        return response()->json($users);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['name' => ['sometimes', 'string', 'min:2', 'max:100'], 'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)], 'role_id' => ['sometimes', 'nullable', Rule::exists('roles', 'id')]]);
        if ($user->is($request->user()) && array_key_exists('role_id', $data)) return response()->json(['message' => 'You cannot change your own role.'], 422);
        $user->update($data);
        return response()->json(['data' => $user->fresh()->load('role:id,name,slug')]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->is($request->user())) return response()->json(['message' => 'You cannot delete your own account here.'], 422);
        $user->tokens()->delete();
        $user->delete();
        return response()->json([], 204);
    }

    public function roles(): JsonResponse
    {
        return response()->json(['data' => Role::orderBy('name')->get(['id', 'name', 'slug'])]);
    }
}
