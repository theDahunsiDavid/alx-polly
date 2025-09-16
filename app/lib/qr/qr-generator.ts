import * as QRCode from "qrcode";

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

// Cache for generated QR codes to improve performance
const qrCache = new Map<string, string>();

export function getPollShareUrl(pollId: string): string {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_URL
      : "http://localhost:3000";
  return `${baseUrl}/polls/${pollId}`;
}

export async function generatePollQR(
  pollId: string,
  options: QRCodeOptions = {},
): Promise<string> {
  const shareUrl = getPollShareUrl(pollId);
  const cacheKey = `${pollId}-${JSON.stringify(options)}`;

  // Check cache first for performance
  if (qrCache.has(cacheKey)) {
    return qrCache.get(cacheKey)!;
  }

  const qrOptions = {
    width: options.size || 200,
    margin: options.margin || 2,
    errorCorrectionLevel: options.errorCorrectionLevel || "M",
    type: "image/png" as const,
  };

  try {
    const qrDataURL = await QRCode.toDataURL(shareUrl, qrOptions);

    // Cache the result for 5 minutes
    qrCache.set(cacheKey, qrDataURL);
    setTimeout(() => qrCache.delete(cacheKey), 5 * 60 * 1000);

    return qrDataURL;
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
}
