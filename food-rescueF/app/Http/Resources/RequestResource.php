<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RequestResource extends JsonResource
{
    public function toArray($request): array
    {
        $delivery = $this->delivery;
        return [
            'id' => $this->id,
            'food_id' => $this->food_id,
            'food_title' => optional($this->food)->title,
            'food_image' => optional($this->food)->image_url,
            'restaurant_id' => optional($this->food)->user_id,
            'restaurant_name' => optional(optional($this->food)->restaurant)->full_name,
            'beneficiary_id' => $this->beneficiary_id,
            'beneficiary_name' => optional($this->beneficiary)->full_name,
            'volunteer_id' => optional($delivery)->volunteer_id,
            'volunteer_name' => optional(optional($delivery)->volunteer)->full_name,
            'type' => $this->type,
            'delivery_address' => $this->delivery_address,
            'notes' => $this->notes,
            'status' => $this->status,
            'delivery_status' => optional($delivery)->status,
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
