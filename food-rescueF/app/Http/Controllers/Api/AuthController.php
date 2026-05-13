<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Public registration. Admin role is NEVER allowed here.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => ['required', Rule::in(['restaurant', 'beneficiary', 'volunteer'])],
        ]);

        $user = User::create([
            'full_name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'role' => $data['role'],
            'is_deleted' => false,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;
        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login. Includes the hardcoded admin exception:
     * admin@gmail.com / admin → authenticate as admin role.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower(trim($data['email']));
        $password = $data['password'];

        // Hardcoded admin exception
        $adminEmail = strtolower(env('ADMIN_EMAIL', 'admin@gmail.com'));
        $adminPassword = env('ADMIN_PASSWORD', 'admin');
        if ($email === $adminEmail && $password === $adminPassword) {
            $admin = User::firstOrCreate(
                ['email' => $adminEmail],
                [
                    'full_name' => 'Platform Admin',
                    'password' => Hash::make($adminPassword),
                    'role' => 'admin',
                    'is_deleted' => false,
                ]
            );
            // Always ensure role is admin even if a row exists
            if ($admin->role !== 'admin') {
                $admin->role = 'admin';
                $admin->save();
            }
            $token = $admin->createToken('admin-token')->plainTextToken;
            return response()->json([
                'user' => new UserResource($admin),
                'token' => $token,
            ]);
        }

        $user = User::where('email', $email)->first();
        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['detail' => 'Invalid email or password'], 401);
        }
        if ($user->is_deleted) {
            return response()->json(['detail' => 'Account disabled'], 403);
        }
        // Admin must use the hardcoded path; never log in normal admin via password if any
        if ($user->role === 'admin' && $email !== $adminEmail) {
            return response()->json(['detail' => 'Forbidden'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;
        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['ok' => true]);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }
}
