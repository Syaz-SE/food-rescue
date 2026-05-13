<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Disable {data: ...} envelope on API resources so the React frontend
        // can consume payloads directly (matches the prior FastAPI shape).
        JsonResource::withoutWrapping();
    }
}
