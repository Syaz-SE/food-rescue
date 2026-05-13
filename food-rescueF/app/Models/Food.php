<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    use HasFactory;

    protected $table = 'foods';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'quantity',
        'price',
        'location',
        'image_url',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function restaurant()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function request()
    {
        return $this->hasOne(FoodRequest::class, 'food_id');
    }
}
