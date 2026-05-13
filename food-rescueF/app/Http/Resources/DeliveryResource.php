<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'request_id' => $this->request_id,
            'volunteer_id' => $this->volunteer_id,
            'volunteer_name' => optional($this->volunteer)->full_name,
            'status' => $this->status,
            'request' => new RequestResource($this->whenLoaded('request')),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
