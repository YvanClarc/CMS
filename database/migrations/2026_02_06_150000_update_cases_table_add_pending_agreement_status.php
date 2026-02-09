<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            // We need to use raw SQL to modify the enum because Laravel doesn't have a clean way to do this
            // First, let's change the enum to include the new value
            $table->enum('status', ['active', 'inactive', 'closed', 'on_hold', 'pending_agreement'])
                  ->default('active')
                  ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'closed', 'on_hold'])
                  ->default('active')
                  ->change();
        });
    }
};
