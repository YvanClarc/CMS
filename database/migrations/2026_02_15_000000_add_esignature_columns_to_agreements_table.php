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
        Schema::table('agreements', function (Blueprint $table) {
            // Signature image as base64 or file path
            $table->longText('signature_image')->nullable()->after('signed_document_path');
            
            // Metadata for audit trail
            $table->string('signer_ip_address')->nullable()->after('signature_image');
            $table->string('signer_user_agent')->nullable()->after('signer_ip_address');
            $table->timestamp('signature_timestamp')->nullable()->after('signer_user_agent');
            
            // Additional signature fields
            $table->string('signer_name')->nullable()->after('signature_timestamp');
            $table->string('signer_email')->nullable()->after('signer_name');
            
            // Signature verification token
            $table->string('signature_token')->nullable()->unique()->after('signer_email');
            
            // PDF with signature overlay
            $table->text('signed_pdf_path')->nullable()->after('signature_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agreements', function (Blueprint $table) {
            $table->dropColumn([
                'signature_image',
                'signer_ip_address',
                'signer_user_agent',
                'signature_timestamp',
                'signer_name',
                'signer_email',
                'signature_token',
                'signed_pdf_path',
            ]);
        });
    }
};
