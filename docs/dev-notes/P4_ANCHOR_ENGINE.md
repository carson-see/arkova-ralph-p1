# P4 Anchor Engine - Developer Notes

This document provides technical guidance for working with the Anchor Engine components introduced in Phase 4 (P4).

## Overview

The Anchor Engine handles client-side document fingerprinting and the anchor creation/verification workflow. A key security feature is that **documents never leave the user's device** — only the SHA-256 fingerprint is sent to the server.

---

## FileHasher Utility

**Location:** `src/lib/fileHasher.ts`

### Purpose

Computes SHA-256 fingerprints of files entirely in the browser using the Web Crypto API.

### Core Functions

#### `computeFingerprint(file: File, onProgress?: HashProgressCallback): Promise<FileFingerprint>`

Computes the fingerprint of a file.

**Parameters:**
- `file` - The File object to fingerprint
- `onProgress` - Optional callback receiving progress (0-100)

**Returns:** `FileFingerprint` object containing:
- `fingerprint` - 64-character hex SHA-256 hash
- `filename` - Original filename
- `fileSize` - Size in bytes
- `mimeType` - MIME type (or `application/octet-stream`)
- `computeTimeMs` - Processing time in milliseconds

**Behavior:**
- Files < 10MB: Processed in single read
- Files >= 10MB: Chunked processing (2MB chunks) with progress updates

**Example:**
```typescript
import { computeFingerprint } from '@/lib/fileHasher';

const result = await computeFingerprint(file, (progress) => {
  console.log(`Processing: ${progress}%`);
});
console.log(result.fingerprint); // "a1b2c3d4..."
```

#### `verifyFingerprint(file: File, expectedFingerprint: string): Promise<boolean>`

Verifies a file matches a known fingerprint.

**Example:**
```typescript
import { verifyFingerprint } from '@/lib/fileHasher';

const isMatch = await verifyFingerprint(file, storedFingerprint);
// true if fingerprints match (case-insensitive)
```

#### Helper Functions

```typescript
// Format bytes for display
formatFileSize(bytes: number): string
// Returns: "1.5 MB", "256 KB", etc.

// Truncate fingerprint for compact display
truncateFingerprint(fingerprint: string): string
// Returns: "a1b2c3d4...e5f6g7h8"
```

---

## FileDropzone Component

**Location:** `src/components/anchor/FileDropzone.tsx`

### Purpose

Drag-and-drop file upload component for fingerprinting. Supports both full-size (for anchor creation) and compact (for re-verification) variants.

### Props

```typescript
interface FileDropzoneProps {
  /** Called when a file has been fingerprinted */
  onFingerprint: (result: FileFingerprint) => void;
  /** Optional: Called when user clears the selection */
  onClear?: () => void;
  /** Disable the dropzone */
  disabled?: boolean;
  /** Show compact version (for re-verification) */
  compact?: boolean;
}
```

### Usage Examples

#### Full-size (Anchor Creation)

```tsx
import { FileDropzone } from '@/components/anchor/FileDropzone';

function CreatePage() {
  const handleFingerprint = (result: FileFingerprint) => {
    // result.fingerprint contains the SHA-256 hash
    console.log('Fingerprint:', result.fingerprint);
  };

  return (
    <FileDropzone 
      onFingerprint={handleFingerprint}
      onClear={() => console.log('Cleared')}
    />
  );
}
```

#### Compact (Re-verification)

```tsx
<FileDropzone 
  onFingerprint={handleVerify}
  compact
/>
```

### Internal States

The component manages these states internally:
- `idle` - Waiting for user input
- `dragging` - File is being dragged over
- `processing` - Computing fingerprint (shows progress)
- `complete` - Fingerprint computed (full-size only shows result card)

### Styling

- Full-size variant: Card wrapper with upload instructions
- Compact variant: Simple dashed border dropzone
- Both variants show privacy messaging ("File never leaves device")

---

## Anchor Creation Flow

**Page:** `src/pages/vault/CreateAnchorPage.tsx`

### Flow

1. User navigates to `/vault/create`
2. User drops/selects a file
3. `FileDropzone` computes fingerprint client-side
4. Confirmation modal shows fingerprint + file details
5. On confirm:
   - Insert anchor record with status `PENDING`
   - Redirect to `/vault`

### Database Insert

```typescript
const { error } = await supabase.from('anchors').insert({
  user_id: profile.id,
  org_id: profile.org_id,
  fingerprint: fingerprint.fingerprint,
  filename: fingerprint.filename,
  file_size: fingerprint.fileSize,
  file_mime: fingerprint.mimeType || null,
  status: 'PENDING',
});
```

### Important Notes

- `user_id` is set from the authenticated user's profile
- `org_id` inherits from user's profile (if they belong to an org)
- Status starts as `PENDING` (system moves to `SECURED` after on-chain confirmation)
- File content is **never** sent to server — only metadata + fingerprint

---

## Re-verification Flow

**Page:** `src/pages/vault/AnchorDetailPage.tsx`

### Flow

1. User navigates to `/vault/anchor/:id`
2. Page fetches anchor record from database
3. Certificate-style card displays anchor metadata
4. User drops file into compact `FileDropzone`
5. Client computes fingerprint
6. Compare with stored `anchor.fingerprint`:
   - **Match:** Green success banner with checkmark
   - **Mismatch:** Red warning banner with alert

### Verification Logic

```typescript
const handleFingerprint = async (fileResult: FileFingerprint) => {
  const isMatch = 
    fileResult.fingerprint.toLowerCase() === 
    storedFingerprint.toLowerCase();
  
  setResult(isMatch ? 'match' : 'mismatch');
};
```

### UX States

```typescript
type VerificationResult = 'idle' | 'verifying' | 'match' | 'mismatch';
```

- `idle` - Compact dropzone shown
- `verifying` - Spinner while comparing
- `match` - Green success with filename
- `mismatch` - Red alert with filename

---

## Routing

Dynamic routes are handled in `src/main.tsx`:

```typescript
const dynamicRoutes = [
  { pattern: /^\/vault\/anchor\/[a-f0-9-]+$/i, component: AnchorDetailPage },
];
```

The `AnchorDetailPage` extracts the ID from the URL hash:

```typescript
function getAnchorIdFromUrl(): string | null {
  const path = window.location.hash.slice(1);
  const match = path.match(/^\/vault\/anchor\/([a-f0-9-]+)$/i);
  return match ? match[1] : null;
}
```

---

## Terminology Reminder

**Always use Arkova terminology in UI:**
- ✅ Fingerprint (not "hash")
- ✅ Secure (not "anchor" or "blockchain")
- ✅ Record (not "transaction")
- ✅ Vault (not "wallet")

See `src/lib/copy.ts` for the complete terminology guide.

---

## Testing Checklist

### FileHasher
- [ ] Small files (< 10MB) process correctly
- [ ] Large files (> 10MB) show progress updates
- [ ] Progress reaches 100% on completion
- [ ] Same file produces same fingerprint
- [ ] Different files produce different fingerprints

### FileDropzone
- [ ] Drag-and-drop works
- [ ] Click-to-browse works
- [ ] Progress bar shows during processing
- [ ] Compact variant renders correctly
- [ ] Privacy messaging displays

### Anchor Creation
- [ ] Modal shows correct file details
- [ ] Cancel returns to dropzone
- [ ] Confirm creates anchor record
- [ ] Redirect to vault on success
- [ ] Error handling for failed inserts

### Re-verification
- [ ] Anchor details display correctly
- [ ] Status badge shows correct state
- [ ] Matching file shows green success
- [ ] Non-matching file shows red alert
- [ ] Can verify another file after result
