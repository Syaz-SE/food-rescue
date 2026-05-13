<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->unique()->constrained('requests')->cascadeOnDelete();
            $table->foreignId('volunteer_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['on_the_way', 'picked_up', 'delivered'])->default('on_the_way');
            $table->timestamps();

            $table->index('status');
            $table->index('volunteer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
