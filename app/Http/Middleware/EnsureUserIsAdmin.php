<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Allow only authenticated users whose role slug is "admin".
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Lazy-load role if not yet present.
        $user->loadMissing('role');

        if ($user->role?->slug !== 'admin') {
            return response()->json(['message' => 'Forbidden — admin access required.'], 403);
        }

        return $next($request);
    }
}
