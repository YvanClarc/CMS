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
        Schema::table('case_requests', function (Blueprint $table) {
            // Basics (Identification)
            $table->string('case_category')->nullable();
            $table->string('adverse_party_name')->nullable();
            $table->string('adverse_party_email')->nullable();
            $table->string('adverse_party_phone')->nullable();
            $table->date('incident_date')->nullable();

            // The Meat (Narrative & Facts)
            $table->text('case_summary')->nullable();
            $table->text('key_witnesses')->nullable();
            $table->text('damages_objective')->nullable();

            // Administrative/Financial
            $table->boolean('has_existing_counsel')->default(false);
            $table->string('fee_preference')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_requests', function (Blueprint $table) {
            $table->dropColumn([
                'case_category',
                'adverse_party_name',
                'adverse_party_email',
                'adverse_party_phone',
                'incident_date',
                'case_summary',
                'key_witnesses',
                'damages_objective',
                'has_existing_counsel',
                'fee_preference',
            ]);
        });
    }
};
