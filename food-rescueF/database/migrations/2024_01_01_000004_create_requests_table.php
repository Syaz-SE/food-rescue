<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('food_id')->unique()->constrained('foods')->cascadeOnDelete();
            $table->foreignId('beneficiary_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['pickup', 'delivery']);
            $table->text('notes')->nullable();
            $table->string('delivery_address', 1024)->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'in_progress', 'completed'])->default('pending');
            $table->timestamps();

            $table->index('status');
            $table->index('beneficiary_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
