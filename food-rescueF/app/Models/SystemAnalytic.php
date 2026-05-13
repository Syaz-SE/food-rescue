<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemAnalytic extends Model
{
    use HasFactory;

    protected $table = 'system_analytics';

    public $timestamps = false;

    protected $fillable = [
        'date',
        'meals_saved',
        'active_deliveries',
        'success_rate',
        'waste_reduction_rate',
    ];

    protected $casts = [
        'date' => 'date',
        'success_rate' => 'float',
        'waste_reduction_rate' => 'float',
    ];
}
