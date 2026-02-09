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
        Schema::create('agreements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_request_id')->constrained('case_requests')->onDelete('cascade');
            $table->foreignId('case_id')->constrained('cases')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'signed', 'declined'])->default('pending');
            $table->text('agreement_content')->nullable();
            $table->enum('fee_arrangement', ['contingency', 'hourly', 'flat_fee'])->default('contingency');
            $table->timestamp('signed_at')->nullable();
            $table->text('signed_document_path')->nullable();
            $table->text('decline_reason')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agreements');
    }
};
