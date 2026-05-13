<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('system_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->unsignedInteger('meals_saved')->default(0);
            $table->unsignedInteger('active_deliveries')->default(0);
            $table->float('success_rate')->default(0);
            $table->float('waste_reduction_rate')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_analytics');
    }
};
