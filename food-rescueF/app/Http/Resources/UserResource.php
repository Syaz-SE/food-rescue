<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->full_name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'is_deleted' => (bool) $this->is_deleted,
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
