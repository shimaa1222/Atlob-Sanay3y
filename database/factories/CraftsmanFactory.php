<?php

namespace Database\Factories;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CraftsmanFactory extends Factory
{
    private static array $cities = ['القاهرة', 'الجيزة', 'الإسكندرية', 'أسيوط', 'المنصورة', 'طنطا', 'الزقازيق', 'بورسعيد'];
    private static array $firstNames = ['أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'خالد', 'يوسف', 'إبراهيم', 'عبدالله', 'مصطفى'];
    private static array $lastNames  = ['النجار', 'الحداد', 'السباك', 'البناء', 'عبدالله', 'محمود', 'إبراهيم', 'سالم', 'حسين', 'عثمان'];

    public function definition(): array
    {
        $firstName = $this->faker->randomElement(self::$firstNames);
        $lastName  = $this->faker->randomElement(self::$lastNames);
        $city      = $this->faker->randomElement(self::$cities);

        return [
            'user_id'          => null, // يُعيَّن بعد الموافقة
            'first_name'       => $firstName,
            'last_name'        => $lastName,
            'email'            => $this->faker->unique()->safeEmail(),
            'phone'            => '010' . $this->faker->numerify('########'),
            'national_id_front'=> 'nationals/front_' . $this->faker->uuid() . '.jpg',
            'national_id_back' => 'nationals/back_'  . $this->faker->uuid() . '.jpg',
            'profile_photo'    => null,
            'country'          => 'مصر',
            'city'             => $city,
            'district'         => $this->faker->word(),
            'full_address'     => $this->faker->address(),
            'bio'              => $this->faker->paragraph(2),
            'hourly_rate'      => $this->faker->randomFloat(2, 50, 500),
            'rating'           => $this->faker->randomFloat(2, 3, 5),
            'reviews_count'    => $this->faker->numberBetween(0, 50),
            'status'           => 'pending',
            'rejection_reason' => null,
            'approved_at'      => null,
            'approved_by'      => null,
            'is_featured'      => false,
            'is_available'     => true,
            'password' => Hash::make('password123'),
        ];
    }

    public function approved(): static
    {
        return $this->state(function () {
            $user = User::factory()->craftsman()->create();
            return [
                'user_id'     => $user->id,
                'status'      => 'approved',
                'approved_at' => now(),
                'is_featured' => $this->faker->boolean(20),
            ];
        });
    }

    public function pending(): static
    {
        return $this->state([
            'user_id' => null,
            'status'  => 'pending',
        ]);
    }

    public function rejected(): static
    {
        return $this->state([
            'status'           => 'rejected',
            'rejection_reason' => $this->faker->sentence(),
        ]);
    }
}
