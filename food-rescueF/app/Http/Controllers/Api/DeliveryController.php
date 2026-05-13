<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryResource;
use App\Http\Resources\RequestResource;
use App\Models\Delivery;
use App\Models\FoodRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeliveryController extends Controller
{
    /** Volunteer: deliveries available to claim. */
    public function available()
    {
        // delivery requests that are accepted and have no Delivery row yet
        $items = FoodRequest::with(['food.restaurant', 'beneficiary'])
            ->where('type', 'delivery')
            ->where('status', 'accepted')
            ->whereDoesntHave('delivery')
            ->latest()
            ->get();
        return RequestResource::collection($items);
    }

    /** Volunteer: my assigned deliveries. */
    public function mine(Request $request)
    {
        $items = Delivery::with([
                'request.food.restaurant',
                'request.beneficiary',
                'volunteer',
            ])
            ->where('volunteer_id', $request->user()->id)
            ->latest()
            ->get();
        return DeliveryResource::collection($items);
    }

    /** Volunteer accepts a delivery request → creates Delivery row. */
    public function accept(Request $request, $requestId)
    {
        $req = FoodRequest::findOrFail($requestId);
        if ($req->type !== 'delivery') {
            return response()->json(['detail' => 'Not a delivery request'], 400);
        }
        if ($req->status !== 'accepted') {
            return response()->json(['detail' => 'Not ready for delivery'], 400);
        }
        if (Delivery::where('request_id', $req->id)->exists()) {
            return response()->json(['detail' => 'Already assigned'], 400);
        }
        $d = Delivery::create([
            'request_id' => $req->id,
            'volunteer_id' => $request->user()->id,
            'status' => 'on_the_way',
        ]);
        $req->status = 'in_progress';
        $req->save();
        return new DeliveryResource($d->load(['request.food.restaurant', 'request.beneficiary', 'volunteer']));
    }

    public function updateStatus(Request $request, $deliveryId)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['on_the_way', 'picked_up', 'delivered'])],
        ]);
        $d = Delivery::with('request.food')->findOrFail($deliveryId);
        if ($d->volunteer_id !== $request->user()->id) {
            return response()->json(['detail' => 'Not your delivery'], 403);
        }
        $d->status = $data['status'];
        $d->save();
        if ($data['status'] === 'delivered') {
            $d->request->status = 'completed';
            $d->request->save();
            $d->request->food->status = 'completed';
            $d->request->food->save();
        }
        return new DeliveryResource($d->load(['request.food.restaurant', 'request.beneficiary', 'volunteer']));
    }
}
