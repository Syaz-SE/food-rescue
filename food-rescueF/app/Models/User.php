<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'phone',
        'role',
        'is_deleted',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_deleted' => 'boolean',
    ];

    public function foods()
    {
        return $this->hasMany(Food::class);
    }

    public function requests()
    {
        return $this->hasMany(FoodRequest::class, 'beneficiary_id');
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'volunteer_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
