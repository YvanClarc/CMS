# E-Signature Quick Setup Checklist

## Prerequisites
- ✅ Laravel 12+ framework
- ✅ React/TypeScript frontend
- ✅ Inertia.js integration
- ✅ SQLite or any supported database

## Step 1: Run Database Migration

```bash
php artisan migrate
```

**What it does:**
- Adds signature-related columns to the `agreements` table
- Includes: signature_image, signer_name, signer_email, IP address, timestamp, etc.

## Step 2: Create Storage Link

```bash
php artisan storage:link
```

**What it does:**
- Creates a symbolic link to `storage/app/public` so signature images are accessible via browser

## Step 3: Set File Permissions (Platform-Specific)

**Windows Users:** ✅ Skip this step (NTFS handles permissions automatically)

**Linux/Mac Users:**
```bash
chmod -R 755 storage/app/public
```

**Windows PowerShell (if needed):**
```powershell
icacls "storage/app/public" /grant:r "%USERNAME%:F" /t
```

## Step 4: Configure Environment (if needed)

Add to `.env`:
```env
FILESYSTEM_DISK=public
```

## Step 5: Test the Implementation

### Using Tinker (REPL)
```bash
php artisan tinker

# In the tinker shell:
$agreement = App\Models\Agreement::first();
$agreement->status;  # Should be 'pending' or 'signed'
```

### Using a Real Route
Visit `/client/agreements/{id}/sign` in your browser to test the signing interface.

## Files Created/Modified

### New Files:
1. **database/migrations/2026_02_15_000000_add_esignature_columns_to_agreements_table.php**
   - Database migration for signature columns

2. **app/Services/SignatureService.php**
   - Backend service for signature operations
   - Handles storage, verification, audit trails

3. **app/Http/Controllers/SignatureController.php**
   - REST API endpoints for signatures
   - Handles authorization and requests

4. **app/Policies/AgreementPolicy.php**
   - Authorization policy for agreement operations
   - Controls who can sign/revoke signatures

5. **app/Providers/AuthServiceProvider.php**
   - Registers the AgreementPolicy

6. **resources/js/components/signature-pad.tsx**
   - Canvas-based signature capture component
   - Collects signer name and email

7. **resources/js/components/signature-details.tsx**
   - Displays signature verification and proof
   - Shows audit trail information

8. **resources/js/hooks/use-signature.ts**
   - React hook for API integration
   - Simplifies signature operations in components

9. **resources/js/pages/agreement-signing-page.tsx**
   - Full-page component for agreement signing
   - Handles flow between unsigned and signed states

10. **ESIGNATURE_SETUP.md**
    - Comprehensive documentation
    - API reference, usage examples, troubleshooting

### Modified Files:
1. **app/Models/Agreement.php**
   - Added signature fields to `$fillable` array
   - Added signature helper methods
   - Updated `$casts` for new date fields

2. **routes/web.php**
   - Added SignatureController import
   - Added signature API routes in client middleware group

3. **bootstrap/providers.php**
   - Registered AuthServiceProvider

## API Endpoints

All endpoints require authentication and are prefixed with `/client/agreements/{agreement}/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/signature` | Get agreement details for signing |
| POST | `/signature` | Submit a signature |
| GET | `/signature/verify` | Get signature proof |
| POST | `/signature/verify` | Verify signature with token |
| DELETE | `/signature` | Revoke/delete a signature |
| GET | `/signature/download` | Download signature image |

## Usage Example

### In a Page Component

```typescript
import AgreementSigningPage from '@/pages/agreement-signing-page';

export default function ShowAgreement({ agreement }) {
    return (
        <AgreementSigningPage
            agreementId={agreement.id}
            agreementContent={agreement.agreement_content}
            status={agreement.status}
            isSigned={agreement.status === 'signed'}
        />
    );
}
```

### In a Custom Component

```typescript
import { SignaturePad } from '@/components/signature-pad';
import useSignature from '@/hooks/use-signature';

export default function CustomSignature({ agreementId }) {
    const { loading, submitSignature } = useSignature(agreementId);

    const handleSign = async (image, name, email) => {
        try {
            const result = await submitSignature(image, name, email);
            console.log('Signed successfully:', result);
        } catch (error) {
            console.error('Sign failed:', error);
        }
    };

    return <SignaturePad onSignatureCapture={handleSign} isLoading={loading} />;
}
```

## Database Fields Reference

### New Columns in `agreements` Table

| Column | Type | Purpose |
|--------|------|---------|
| `signature_image` | LONGTEXT | Base64-encoded PNG signature |
| `signer_name` | VARCHAR | Full name of signer |
| `signer_email` | VARCHAR | Email of signer |
| `signer_ip_address` | VARCHAR | IP address for audit trail |
| `signer_user_agent` | VARCHAR | Browser/device info |
| `signature_timestamp` | TIMESTAMP | When signature was recorded |
| `signature_token` | VARCHAR | Unique verification token |
| `signed_pdf_path` | TEXT | Path to signed PDF (future) |

## Troubleshooting

### "Signature image is required" error
- Ensure user is actually drawing on the canvas
- Check browser console for JavaScript errors

### Signatures not saving to disk
- Run `php artisan storage:link`
- Check permissions: `chmod -R 755 storage/app/public`
- Verify `FILESYSTEM_DISK=public` in `.env`

### Authorization denied errors
- Verify user owns the agreement (is the `client_id`)
- Check agreement status is 'pending' for signing
- Ensure AuthServiceProvider is registered in bootstrap/providers.php

### Signature image URL not working
- Verify public storage link exists: `public/storage`
- Check file permissions: `chmod 644 storage/app/public/signatures/*`
- Ensure web server can serve from storage

## Next Steps

1. **Customize UI**: Edit signature-pad.tsx and signature-details.tsx to match your design
2. **Add notifications**: Send email confirmations after signing
3. **PDF overlay**: Generate signed PDFs with signature overlaid
4. **Webhooks**: Trigger actions when agreements are signed
5. **Workflows**: Implement multi-signer support
6. **Mobile**: Add touch support for mobile signatures

## Security Notes

- ✅ IP addresses logged for all signatures
- ✅ Unique tokens for signature verification
- ✅ Timestamps recorded for audit trails
- ✅ Authorization checks on all endpoints
- ✅ CSRF protection via Laravel middleware
- ✅ User agent captured for device tracking

## Support Resources

- **Documentation**: See ESIGNATURE_SETUP.md
- **Laravel Docs**: https://laravel.com/docs
- **React Docs**: https://react.dev
- **Inertia Docs**: https://inertiajs.com

## Questions?

Refer to the ESIGNATURE_SETUP.md file for:
- Complete API reference
- Detailed usage examples
- Customization guides
- Advanced features
- Troubleshooting steps
