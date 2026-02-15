# E-Signature Implementation Guide

## Overview
This guide covers the free, self-hosted e-signature system that has been integrated into your Laravel/React CMS. The system allows clients to sign agreements digitally with complete audit trails and verification capabilities.

## Features

- **Canvas-Based Signature Capture**: Draw signatures directly in the browser
- **Signer Information Collection**: Capture signer name and email
- **Audit Trail**: Record IP address, timestamp, and user agent
- **Signature Verification**: Verify signatures with unique tokens
- **Digital Proof**: Generate downloadable signature proofs
- **Completely Free**: No external API costs or dependencies
- **Self-Hosted**: Full control over your data

## Architecture

### Database
The system uses Laravel migrations to extend the existing `agreements` table with signature-specific columns:

- `signature_image`: Base64-encoded PNG of the signature
- `signer_name`: Full name of the person signing
- `signer_email`: Email address of the signer
- `signer_ip_address`: IP address for audit trail
- `signer_user_agent`: Browser/device information
- `signature_timestamp`: When the signature was recorded
- `signature_token`: Unique verification token
- `signed_pdf_path`: Path to signed PDF (future feature)

### Backend Components

#### Service Layer (`app/Services/SignatureService.php`)
Handles all signature operations:
- `storeSignature()`: Save signature with metadata
- `saveSignatureImage()`: Convert base64 to file storage
- `verifySignature()`: Validate signature tokens
- `getAuditTrail()`: Retrieve signature metadata
- `deleteSignature()`: Revoke signatures
- `getSignatureProof()`: Generate signature proof

#### Controller (`app/Http/Controllers/SignatureController.php`)
REST API endpoints for signature operations:
- `GET /client/agreements/{agreement}/signature` - Get agreement details
- `POST /client/agreements/{agreement}/signature` - Submit signature
- `GET /client/agreements/{agreement}/signature/verify` - Get signature details
- `POST /client/agreements/{agreement}/signature/verify` - Verify signature
- `DELETE /client/agreements/{agreement}/signature` - Revoke signature
- `GET /client/agreements/{agreement}/signature/download` - Download signature image

#### Model Enhancement (`app/Models/Agreement.php`)
Extended Agreement model with signature methods:
- `hasValidSignature()`: Check if properly signed
- `getSignatureAuditTrail()`: Get audit information
- `getSignatureImageUrl()`: Get public URL of signature

### Frontend Components

#### SignaturePad Component (`signature-pad.tsx`)
Interactive canvas for capturing signatures:
- HTML5 Canvas drawing interface
- Signer name and email input
- Clear signature functionality
- Submit button with validation

#### SignatureDetails Component (`signature-details.tsx`)
Displays signed agreement information:
- Signature image preview
- Signer details (name, email)
- Timestamp and IP address
- Verification token
- Download and revoke buttons
- Audit trail information

#### Custom Hook (`use-signature.ts`)
React hook for API integration:
- `submitSignature()`: Submit signature to server
- `fetchSignature()`: Retrieve existing signature
- `verifySignature()`: Verify with token
- `downloadSignature()`: Download signature image
- `revokeSignature()`: Delete signature

#### Page Component (`agreement-signing-page.tsx`)
Full-page agreement signing interface:
- Displays agreement content
- Shows SignaturePad for unsigned agreements
- Shows SignatureDetails for signed agreements
- Error handling and loading states

## Setup Instructions

### 1. Run Migrations

```bash
php artisan migrate
```

This creates the new signature columns in the `agreements` table.

### 2. Create Storage Directory

Create the public symbolic link if not exists:

```bash
php artisan storage:link
```

**For Windows users:** File permissions are handled automatically by NTFS. Skip the chmod step.

**For Linux/Mac users:** Ensure the storage directory is writable:

```bash
chmod -R 755 storage/app/public/signatures
```

**For Windows PowerShell (if needed):**

```powershell
icacls "storage/app/public" /grant:r "%USERNAME%:F" /t
```

### 3. Environment Configuration

Add these to your `.env` file:

```env
# Disk for signature storage
FILESYSTEM_DISK=public

# Optional: Configure max upload size
APP_UPLOAD_MAX_FILESIZE=5M
```

### 4. Authorization

Ensure your `CaseRequestPolicy` includes authorization for signature operations. The controller uses `$this->authorize('update', $agreement)` for all signature operations.

## Usage Examples

### 1. Display Signing Page

```typescript
import AgreementSigningPage from '@/pages/agreement-signing-page';

// In your Inertia route:
Route::get('agreements/{agreement}/sign', function (Agreement $agreement) {
    return inertia('agreement-signing-page', [
        'agreementId' => $agreement->id,
        'agreementContent' => $agreement->agreement_content,
        'status' => $agreement->status,
        'isSigned' => $agreement->hasValidSignature(),
    ]);
});
```

### 2. Use Signature Hook in Components

```typescript
import useSignature from '@/hooks/use-signature';

function MyComponent({ agreementId }: { agreementId: number }) {
    const { signature, loading, submitSignature } = useSignature(agreementId);

    const handleSign = async (image: string, name: string, email: string) => {
        try {
            await submitSignature(image, name, email);
            // Signature submitted successfully
        } catch (error) {
            console.error('Sign failed:', error);
        }
    };

    return (
        <div>
            {/* Your component JSX */}
        </div>
    );
}
```

### 3. Check Signed Status

```php
// In your controller or model
$agreement = Agreement::find($agreementId);

if ($agreement->hasValidSignature()) {
    // Agreement is signed
    $proof = $agreement->getSignatureAuditTrail();
    // Use proof...
}
```

## API Reference

### Submit Signature
**POST** `/client/agreements/{agreement}/signature`

**Request:**
```json
{
    "signature_image": "data:image/png;base64,...",
    "signer_name": "John Doe",
    "signer_email": "john@example.com"
}
```

**Response:**
```json
{
    "message": "Signature stored successfully",
    "agreement": { /* agreement data */ },
    "signature_proof": {
        "agreement_id": 1,
        "signed_at": "2026-02-15T10:30:00",
        "signer_name": "John Doe",
        "signer_email": "john@example.com",
        "ip_address": "192.168.1.1",
        "signature_token": "abcd1234...",
        "signature_image_url": "/storage/signatures/agreement_1_1707987000.png"
    }
}
```

### Get Signature Details
**GET** `/client/agreements/{agreement}/signature/verify`

**Response:**
```json
{
    "signature_proof": { /* same as above */ },
    "audit_trail": {
        "signed_at": "2026-02-15T10:30:00",
        "signer_name": "John Doe",
        "signer_email": "john@example.com",
        "ip_address": "192.168.1.1",
        "signature_timestamp": "2026-02-15T10:30:00",
        "status": "signed"
    }
}
```

### Verify Signature
**POST** `/client/agreements/{agreement}/signature/verify`

**Request:**
```json
{
    "token": "abcd1234..."
}
```

**Response:**
```json
{
    "is_valid": true,
    "message": "Signature is valid"
}
```

### Revoke Signature
**DELETE** `/client/agreements/{agreement}/signature`

**Response:**
```json
{
    "message": "Signature revoked successfully"
}
```

## Security Considerations

1. **IP Address Logging**: All signatures record the client's IP address for audit trails
2. **Unique Tokens**: Each signature gets a unique verification token
3. **Timestamp Recording**: Exact time of signature is recorded
4. **User Agent**: Browser/device information is captured
5. **Status Tracking**: Agreement status changes from 'pending' to 'signed'
6. **File Permissions**: Signature images stored in secure directory
7. **Authorization Checks**: All endpoints require proper authorization

## Customization

### Custom Signatures Styles

Edit `signature-pad.tsx` to customize:
- Canvas background color
- Line width and color
- Font styles for labels
- Button styles

### Storage Location

Change signature storage location in `SignatureService.php`:

```php
// Current: public disk (visible URLs)
$fileName = "signatures/agreement_{$agreementId}_" . time() . '.png';
Storage::disk('public')->put($fileName, $imageData);

// Alternative: private disk (protected download)
Storage::disk('private')->put($fileName, $imageData);
```

### Signature Image Format

To use different formats, modify `saveSignatureImage()`:

```php
// PNG (current)
$fileName = "signatures/agreement_{$agreementId}_" . time() . '.png';

// JPEG
$fileName = "signatures/agreement_{$agreementId}_" . time() . '.jpg';

// WebP
$fileName = "signatures/agreement_{$agreementId}_" . time() . '.webp';
```

## Testing

### Test Signature Storage

```bash
# Use a test agreement
php artisan tinker

# In tinker:
$agreement = Agreement::first();
$service = app(SignatureService::class);

// Simulate a signature
$signatureData = base64_encode(file_get_contents('path/to/test-image.png'));
$service->storeSignature($agreement, [
    'signature_image' => $signatureData,
    'signer_name' => 'Test User',
    'signer_email' => 'test@example.com',
], request());
```

## Troubleshooting

### Signatures Not Saving
1. Check storage directory permissions: `chmod -R 755 storage/app/public`
2. Verify `FILESYSTEM_DISK=public` in .env
3. Check disk is configured in `config/filesystems.php`

### Signature Images Not Showing
1. Verify `php artisan storage:link` was run
2. Check signature file exists: `storage/app/public/signatures/`
3. Verify web server can read the files

### Authorization Errors
1. Check `CaseRequestPolicy` allows 'update' action
2. Verify user owns the agreement
3. Check middleware is properly configured

### Canvas Not Drawing
1. Ensure browser supports HTML5 Canvas
2. Check JavaScript console for errors
3. Verify touch events are handled on mobile devices

## Future Enhancements

- PDF signature overlay (combining signature with PDF document)
- Mobile touch signature support
- Multi-signer workflows
- Email notifications on signature
- Signature expiration dates
- Two-factor verification before signing
- Signature decline reasons
- Bulk agreement signing
- Digital certificate integration

## Support

For issues or questions, refer to:
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- HTML5 Canvas Guide: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
