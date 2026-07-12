<?php

namespace App\Http\Controllers;

use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a paginated list of roles with optional search & filters.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'with_trashed' => [':boolean'],
            'only_trashed' => [':boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Role::query()->withCount('users');

        // Include or restrict to soft-deleted rows.
        if ($request->boolean('only_trashed')) {
            $query->onlyTrashed();
        } elseif ($request->boolean('with_trashed')) {
            $query->withTrashed();
        }

        // Search by name / slug / description.
        if ($term = $request->string('q')->trim()->toString()) {
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        $roles = $query
            ->orderBy('name')
            ->paginate($request->integer('per_page') ?: 15);

        return RoleResource::collection($roles)->response();
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? \Illuminate\Support\Str::slug($data['name']);

        $role = Role::create($data);
        $role->loadCount('users');

        return (new RoleResource($role))
            ->response()
            ->setStatusCode(201)
            ->header('X-Message', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): JsonResponse
    {
        $role->loadCount('users');

        return (new RoleResource($role))->response();
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $data = $request->validated();

        // If name changes and slug was not explicitly provided, regenerate slug
        // only when the slug still matches the old name's slug (i.e., it's auto-derived).
        if (isset($data['name']) && ! array_key_exists('slug', $data)) {
            $derivedOld = \Illuminate\Support\Str::slug($role->name);
            if ($role->slug === $derivedOld) {
                $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
            }
        }

        $role->update($data);
        $role->loadCount('users');

        return (new RoleResource($role))
            ->response()
            ->header('X-Message', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): JsonResponse
    {
        if ($role->isSystemRole()) {
            return response()->json([
                'message' => 'System roles cannot be deleted.',
            ], 422);
        }

        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a role that is currently assigned to users. Reassign users first.',
            ], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }

    /**
     * Restore a soft-deleted role.
     */
    public function restore(string $id): JsonResponse
    {
        $role = Role::onlyTrashed()->findOrFail($id);
        $role->restore();
        $role->loadCount('users');

        return (new RoleResource($role))->response();
    }

    /**
     * Permanently delete a soft-deleted role.
     */
    public function forceDestroy(string $id): JsonResponse
    {
        $role = Role::onlyTrashed()->findOrFail($id);
        $role->forceDelete();

        return response()->json(['message' => 'Role permanently deleted.']);
    }

    /**
     * Get permissions for a role.
     */
    public function permissions(Role $role): JsonResponse
    {
        $permissions = $role->permissions()->get(['id', 'name', 'slug', 'description']);

        return response()->json([
            'data' => $permissions,
        ]);
    }

    /**
     * Attach permissions to a role.
     */
    public function attachPermissions(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'permission_id' => ['required', 'exists:permissions,id'],
        ]);

        $role->permissions()->attach($request->input('permission_id'));

        return response()->json([
            'message' => 'Permission attached successfully.',
        ]);
    }

    /**
     * Detach a permission from a role.
     */
    public function detachPermission(Role $role, Permission $permission): JsonResponse
    {
        $role->permissions()->detach($permission);

        return response()->json([
            'message' => 'Permission detached successfully.',
        ]);
    }
}