<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Maps to the `requests` table. Class is named FoodRequest to avoid clashing
 * with Illuminate\Http\Request.
 */
class FoodRequest extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'food_id',
        'beneficiary_id',
        'type',
        'notes',
        'delivery_address',
        'status',
    ];

    public function food()
    {
        return $this->belongsTo(Food::class, 'food_id');
    }

    public function beneficiary()
    {
        return $this->belongsTo(User::class, 'beneficiary_id');
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class, 'request_id');
    }
}
