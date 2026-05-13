<?php

namespace Database\Seeders;

use App\Models\Food;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Hardcoded admin (matches AuthController login exception)
        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@gmail.com')],
            [
                'full_name' => 'Platform Admin',
                'password' => Hash::make(env('ADMIN_PASSWORD', 'admin')),
                'role' => 'admin',
                'is_deleted' => false,
            ]
        );

        // Demo users
        $restaurant = User::firstOrCreate(
            ['email' => 'restaurant@rescue.com'],
            [
                'full_name' => 'Green Leaf Bistro',
                'password' => Hash::make('password123'),
                'role' => 'restaurant',
                'is_deleted' => false,
            ]
        );
        User::firstOrCreate(
            ['email' => 'beneficiary@rescue.com'],
            [
                'full_name' => 'Hope Shelter',
                'password' => Hash::make('password123'),
                'role' => 'beneficiary',
                'is_deleted' => false,
            ]
        );
        User::firstOrCreate(
            ['email' => 'volunteer@rescue.com'],
            [
                'full_name' => 'Alex Volunteer',
                'password' => Hash::make('password123'),
                'role' => 'volunteer',
                'is_deleted' => false,
            ]
        );

        // Sample listings
        if (Food::where('user_id', $restaurant->id)->count() === 0) {
            $listings = [
                [
                    'title' => 'Fresh Bakery Bundle',
                    'description' => "Assorted baguettes, sourdough, and croissants from today's baking. Best consumed within 24h.",
                    'quantity' => '10 loaves',
                    'price' => 0,
                    'location' => 'Downtown - Main Street',
                    'image_url' => 'https://images.unsplash.com/photo-1571157577110-493b325fdd3d?ixlib=rb-4.1.0&q=85&w=800',
                ],
                [
                    'title' => 'Pastry Tray - End of Day',
                    'description' => 'Mixed croissants, danishes and muffins. Fresh from our display case.',
                    'quantity' => '24 pieces',
                    'price' => 0,
                    'location' => 'Rose District',
                    'image_url' => 'https://images.unsplash.com/photo-1736520537688-1f1f06b71605?ixlib=rb-4.1.0&q=85&w=800',
                ],
                [
                    'title' => 'Catering Leftovers - Hot Meals',
                    'description' => 'Chicken rice, vegetable curry and salads from a corporate event. Sealed individual boxes.',
                    'quantity' => '30 boxes',
                    'price' => 0,
                    'location' => 'Business Bay',
                    'image_url' => null,
                ],
                [
                    'title' => 'Artisan Baguettes',
                    'description' => 'French-style baguettes, baked this morning. Perfect for community dinners.',
                    'quantity' => '15 loaves',
                    'price' => 0,
                    'location' => 'Old Town Market',
                    'image_url' => 'https://images.pexels.com/photos/30826793/pexels-photo-30826793.jpeg',
                ],
            ];
            foreach ($listings as $l) {
                Food::create([
                    ...$l,
                    'user_id' => $restaurant->id,
                    'status' => 'available',
                ]);
            }
        }
    }
}
