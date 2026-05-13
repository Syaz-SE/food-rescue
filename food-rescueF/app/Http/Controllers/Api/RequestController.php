<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RequestResource;
use App\Models\Food;
use App\Models\FoodRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RequestController extends Controller
{
    /** Beneficiary creates a request. One request per food enforced. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'food_id' => ['required', 'exists:foods,id'],
            'type' => ['required', Rule::in(['pickup', 'delivery'])],
            'notes' => ['nullable', 'string', 'max:1024'],
            'delivery_address' => ['nullable', 'string', 'max:1024'],
        ]);

        $food = Food::findOrFail($data['food_id']);
        if ($food->status !== 'available') {
            return response()->json(['detail' => 'Food is not available'], 400);
        }
        if ($data['type'] === 'delivery' && empty($data['delivery_address'])) {
            return response()->json(['detail' => 'Delivery address required for delivery'], 400);
        }
        if (FoodRequest::where('food_id', $food->id)->exists()) {
            return response()->json(['detail' => 'This food already has a request'], 400);
        }

        $req = FoodRequest::create([
            'food_id' => $food->id,
            'beneficiary_id' => $request->user()->id,
            'type' => $data['type'],
            'notes' => $data['notes'] ?? null,
            'delivery_address' => $data['delivery_address'] ?? null,
            'status' => 'pending',
        ]);

        return new RequestResource($req->load(['food.restaurant', 'beneficiary', 'delivery.volunteer']));
    }

    /** Beneficiary: my requests. */
    public function mine(Request $request)
    {
        $items = FoodRequest::with(['food.restaurant', 'beneficiary', 'delivery.volunteer'])
            ->where('beneficiary_id', $request->user()->id)
            ->latest()
            ->get();
        return RequestResource::collection($items);
    }

    /** Restaurant: requests for my listings. */
    public function forRestaurant(Request $request)
    {
        $foodIds = Food::where('user_id', $request->user()->id)->pluck('id');
        $items = FoodRequest::with(['food.restaurant', 'beneficiary', 'delivery.volunteer'])
            ->whereIn('food_id', $foodIds)
            ->latest()
            ->get();
        return RequestResource::collection($items);
    }

    public function accept(Request $request, $id)
    {
        $req = FoodRequest::with('food')->findOrFail($id);
        if ($req->food->user_id !== $request->user()->id) {
            return response()->json(['detail' => 'Not your listing'], 403);
        }
        if ($req->status !== 'pending') {
            return response()->json(['detail' => 'Request already handled'], 400);
        }
        $req->status = 'accepted';
        $req->save();
        $req->food->status = 'reserved';
        $req->food->save();
        return new RequestResource($req->load(['food.restaurant', 'beneficiary', 'delivery.volunteer']));
    }

    public function reject(Request $request, $id)
    {
        $req = FoodRequest::with('food')->findOrFail($id);
        if ($req->food->user_id !== $request->user()->id) {
            return response()->json(['detail' => 'Not your listing'], 403);
        }
        $req->status = 'rejected';
        $req->save();
        return new RequestResource($req->load(['food.restaurant', 'beneficiary', 'delivery.volunteer']));
    }
}
