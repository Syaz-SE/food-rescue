<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FoodResource;
use App\Models\Food;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FoodController extends Controller
{
    /** Public browse (available only by default). */
    public function index(Request $request)
    {
        $query = Food::query()->with('restaurant');
        $status = $request->query('status', 'available');
        $query->where('status', $status);

        if ($q = $request->query('q')) {
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%$q%")
                  ->orWhere('description', 'like', "%$q%")
                  ->orWhere('location', 'like', "%$q%");
            });
        }

        return FoodResource::collection($query->latest()->get());
    }

    /** Restaurant: my listings. */
    public function mine(Request $request)
    {
        $items = Food::with('restaurant')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();
        return FoodResource::collection($items);
    }

    public function show($id)
    {
        $food = Food::with('restaurant')->findOrFail($id);
        return new FoodResource($food);
    }

    public function store(Request $request)
    {
        $data = $this->validateInput($request);
        $food = Food::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => 'available',
        ]);
        return new FoodResource($food->load('restaurant'));
    }

    public function update(Request $request, $id)
    {
        $food = Food::findOrFail($id);
        if ($food->user_id !== $request->user()->id) {
            return response()->json(['detail' => 'Not your listing'], 403);
        }
        $data = $this->validateInput($request);
        $food->update($data);
        return new FoodResource($food->load('restaurant'));
    }

    public function destroy(Request $request, $id)
    {
        $food = Food::findOrFail($id);
        if ($food->user_id !== $request->user()->id) {
            return response()->json(['detail' => 'Not your listing'], 403);
        }
        $food->delete();
        return response()->json(['ok' => true]);
    }

    public function restaurantStats(Request $request)
    {
        $uid = $request->user()->id;
        $base = Food::where('user_id', $uid);
        return response()->json([
            'total' => (clone $base)->count(),
            'available' => (clone $base)->where('status', 'available')->count(),
            'reserved' => (clone $base)->where('status', 'reserved')->count(),
            'completed' => (clone $base)->where('status', 'completed')->count(),
            'pending_requests' => \App\Models\FoodRequest::whereIn('food_id', (clone $base)->pluck('id'))
                ->where('status', 'pending')->count(),
        ]);
    }

    private function validateInput(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'quantity' => ['required', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'location' => ['required', 'string', 'max:255'],
            'image_url' => ['nullable', 'string', 'max:1024'],
            'status' => ['nullable', Rule::in(['available', 'reserved', 'completed'])],
        ]);
    }
}
