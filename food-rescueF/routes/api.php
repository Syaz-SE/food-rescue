<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\FoodController;
use App\Http\Controllers\Api\RequestController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/food', [FoodController::class, 'index']);
Route::get('/food/{id}', [FoodController::class, 'show'])->whereNumber('id');

// Authenticated (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Restaurant
    Route::middleware('role:restaurant')->group(function () {
        Route::get('/food/mine', [FoodController::class, 'mine']);
        Route::post('/food', [FoodController::class, 'store']);
        Route::put('/food/{id}', [FoodController::class, 'update']);
        Route::delete('/food/{id}', [FoodController::class, 'destroy']);
        Route::get('/stats/restaurant', [FoodController::class, 'restaurantStats']);
        Route::get('/requests/restaurant', [RequestController::class, 'forRestaurant']);
        Route::patch('/requests/{id}/accept', [RequestController::class, 'accept']);
        Route::patch('/requests/{id}/reject', [RequestController::class, 'reject']);
    });

    // Beneficiary
    Route::middleware('role:beneficiary')->group(function () {
        Route::post('/requests', [RequestController::class, 'store']);
        Route::get('/requests/mine', [RequestController::class, 'mine']);
    });

    // Volunteer
    Route::middleware('role:volunteer')->group(function () {
        Route::get('/deliveries/available', [DeliveryController::class, 'available']);
        Route::get('/deliveries/mine', [DeliveryController::class, 'mine']);
        Route::post('/deliveries/{requestId}/accept', [DeliveryController::class, 'accept']);
        Route::patch('/deliveries/{deliveryId}/status', [DeliveryController::class, 'updateStatus']);
    });

    // Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/stats/overview', [AdminController::class, 'overview']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/foods', [AdminController::class, 'foods']);
        Route::get('/requests', [AdminController::class, 'requests']);
        Route::get('/deliveries', [AdminController::class, 'deliveries']);
        Route::get('/analytics', [AdminController::class, 'analytics']);
    });
});
