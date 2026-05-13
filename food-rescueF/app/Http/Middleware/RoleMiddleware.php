<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Usage: Route::...->middleware('role:restaurant,admin');
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['detail' => 'Not authenticated'], 401);
        }
        if ($user->is_deleted) {
            return response()->json(['detail' => 'Account disabled'], 403);
        }
        if (!in_array($user->role, $roles, true)) {
            return response()->json(['detail' => 'Forbidden for your role'], 403);
        }
        return $next($request);
    }
}
