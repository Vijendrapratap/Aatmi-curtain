/**
 * Helper to safely extract clean base64 data and mimeType from data URIs.
 * Returns null if the string is not a valid raster base64 image (rejects SVGs, malformed URIs, etc.).
 */
export function parseBase64Image(
  dataUri: string | undefined
): { mimeType: string; base64: string; data: string } | null {
  if (!dataUri || typeof dataUri !== 'string') return null;
  // Match standard base64 data URLs: data:image/(png|jpeg|jpg|webp);base64,XXXX
  const match = dataUri.match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+[\r\n]*)$/i);
  if (match) {
    const rawMime = match[1].toLowerCase();
    const mime = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
    const b64 = match[3].replace(/\s+/g, '');
    return { mimeType: mime, base64: b64, data: b64 };
  }
  // Check if it's already a raw base64 string without prefix
  const cleaned = dataUri.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/=]+$/.test(cleaned) && cleaned.length > 200) {
    return { mimeType: 'image/jpeg', base64: cleaned, data: cleaned };
  }
  return null;
}
