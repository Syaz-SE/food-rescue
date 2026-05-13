<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FoodResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'price' => (float) $this->price,
            'location' => $this->location,
            'image_url' => $this->image_url,
            'status' => $this->status,
            'restaurant_id' => $this->user_id,
            'restaurant_name' => optional($this->restaurant)->full_name,
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
