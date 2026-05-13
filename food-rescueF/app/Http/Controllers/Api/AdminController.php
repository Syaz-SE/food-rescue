<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryResource;
use App\Http\Resources\FoodResource;
use App\Http\Resources\RequestResource;
use App\Http\Resources\UserResource;
use App\Models\Delivery;
use App\Models\Food;
use App\Models\FoodRequest;
use App\Models\SystemAnalytic;
use App\Models\User;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function overview()
    {
        $totalUsers = User::where('is_deleted', '=', false)->where('role', '!=', 'admin')->count();
        $totalRestaurants = User::where('role', '=', 'restaurant')->where('is_deleted', '=', false)->count();
        $totalBeneficiaries = User::where('role', '=', 'beneficiary')->where('is_deleted', '=', false)->count();
        $totalVolunteers = User::where('role', '=', 'volunteer')->where('is_deleted', '=', false)->count();
        $activeListings = Food::where('status', '=', 'available')->count();
        $mealsSaved = Food::where('status', '=', 'completed')->count();
        $activeDeliveries = Delivery::whereIn('status', ['on_the_way', 'picked_up'])->count();
        $totalRequests = FoodRequest::count();
        $completedRequests = FoodRequest::where('status', '=', 'completed')->count();
        $successRate = $totalRequests > 0 ? round($completedRequests / $totalRequests * 100, 1) : 0.0;
        $wasteReduction = round(min(100, $mealsSaved * 1.8), 1);

        return response()->json([
            'total_users' => $totalUsers,
            'total_restaurants' => $totalRestaurants,
            'total_beneficiaries' => $totalBeneficiaries,
            'total_volunteers' => $totalVolunteers,
            'active_listings' => $activeListings,
            'meals_saved' => $mealsSaved,
            'active_deliveries' => $activeDeliveries,
            'success_rate' => $successRate,
            'waste_reduction_rate' => $wasteReduction,
        ]);
    }

    public function users()
    {
        $items = User::where('role', '!=', 'admin')->latest()->get();
        return UserResource::collection($items);
    }

    public function deleteUser(int $id)
    {
        $u = User::findOrFail($id);
        if ($u->role === 'admin') {
            return response()->json(['detail' => 'Cannot delete admin'], 400);
        }
        $u->is_deleted = true;
        $u->save();
        $u->delete(); // soft delete via SoftDeletes
        return response()->json(['ok' => true]);
    }

    public function foods()
    {
        $items = Food::with('restaurant')->latest()->get();
        return FoodResource::collection($items);
    }

    public function requests()
    {
        $items = FoodRequest::with(['food.restaurant', 'beneficiary', 'delivery.volunteer'])->latest()->get();
        return RequestResource::collection($items);
    }

    public function deliveries()
    {
        $items = Delivery::with(['request.food.restaurant', 'request.beneficiary', 'volunteer'])->latest()->get();
        return DeliveryResource::collection($items);
    }

    public function analytics()
    {
        // Prefer real rows from system_analytics if present, else compute synthetic.
        $rows = SystemAnalytic::orderBy('date', 'asc')->get();
        if ($rows->count() > 0) {
            return response()->json($rows);
        }

        $today = Carbon::today();
        $totalCompleted = Food::where('status', '=', 'completed')->count();
        $totalActive = Delivery::whereIn('status', ['on_the_way', 'picked_up'])->count();

        $series = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = $today->copy()->subDays($i);
            $series[] = [
                'date' => $d->toDateString(),
                'meals_saved' => intval($totalCompleted / 7) + ($i % 3),
                'active_deliveries' => max(0, $totalActive - $i),
                'success_rate' => 88.0 + ($i * 1.2),
                'waste_reduction_rate' => 60.0 + ($i * 2.5),
            ];
        }
        return response()->json($series);
    }
}
