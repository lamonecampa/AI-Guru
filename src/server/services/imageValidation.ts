import crypto from 'crypto';

export interface ImageValidationResult {
  isValid: boolean;
  format: 'jpeg' | 'png' | 'webp' | 'unknown';
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  width?: number;
  height?: number;
  qualityFlags: string[];
  qualityScore: number; // 0.0 - 1.0
  errorMessage?: string;
}

export function validateImageBuffer(buffer: Buffer, originalFilename: string): ImageValidationResult {
  const sizeBytes = buffer.length;
  const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const qualityFlags: string[] = [];

  // Max size: 15MB
  const MAX_SIZE = 15 * 1024 * 1024;
  if (sizeBytes > MAX_SIZE) {
    return {
      isValid: false,
      format: 'unknown',
      mimeType: 'application/octet-stream',
      sizeBytes,
      sha256Hash,
      qualityFlags: ['EXCEEDS_MAX_SIZE'],
      qualityScore: 0,
      errorMessage: 'Ukuran file melebihi batas maksimal 15MB.',
    };
  }

  if (sizeBytes < 1024) {
    return {
      isValid: false,
      format: 'unknown',
      mimeType: 'application/octet-stream',
      sizeBytes,
      sha256Hash,
      qualityFlags: ['CORRUPTED_FILE_TOO_SMALL'],
      qualityScore: 0,
      errorMessage: 'File rusak atau terlalu kecil untuk dibaca (kurang dari 1KB).',
    };
  }

  // Detect format by magic bytes
  let format: 'jpeg' | 'png' | 'webp' | 'unknown' = 'unknown';
  let mimeType = 'application/octet-stream';

  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    format = 'jpeg';
    mimeType = 'image/jpeg';
  } else if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    format = 'png';
    mimeType = 'image/png';
  } else if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    format = 'webp';
    mimeType = 'image/webp';
  }

  if (format === 'unknown') {
    return {
      isValid: false,
      format: 'unknown',
      mimeType,
      sizeBytes,
      sha256Hash,
      qualityFlags: ['UNSUPPORTED_FORMAT'],
      qualityScore: 0,
      errorMessage: 'Format file tidak didukung. Harap unggah gambar JPG, PNG, atau WebP.',
    };
  }

  // Extract dimensions
  let width: number | undefined;
  let height: number | undefined;

  try {
    if (format === 'png' && buffer.length >= 24) {
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    } else if (format === 'jpeg') {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
        if (marker >= 0xC0 && marker <= 0xC3) {
          height = buffer.readUInt16BE(offset + 5);
          width = buffer.readUInt16BE(offset + 7);
          break;
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  } catch {
    // If dimension parsing fails, still allow if format valid
  }

  let qualityScore = 1.0;

  if (width && height) {
    if (width < 600 || height < 600) {
      qualityFlags.push('LOW_RESOLUTION');
      qualityScore -= 0.3;
    }
    const ratio = width / height;
    if (ratio < 0.3 || ratio > 3.0) {
      qualityFlags.push('UNUSUAL_ASPECT_RATIO');
      qualityScore -= 0.2;
    }
  } else {
    qualityFlags.push('DIMENSIONS_UNVERIFIED');
    qualityScore -= 0.1;
  }

  return {
    isValid: true,
    format,
    mimeType,
    sizeBytes,
    sha256Hash,
    width,
    height,
    qualityFlags,
    qualityScore: Math.max(0.1, Math.min(1.0, qualityScore)),
  };
}
