const ALIAS_POOL = [
  'Amitabh Bachchan',
  'Priyanka Chopra',
  'Nawazuddin Siddiqui',
  'Deepika Padukone',
  'Pankaj Tripathi',
  'Alia Bhatt',
  'Ayushmann Khurrana',
  'Tabu',
  'Rajkummar Rao',
  'Vidya Balan',
];

export interface MaskResult {
  maskedContent: string;
  aliases: Record<string, string>;
  sensitiveAmounts: string[];
}

/**
 * Strips PII (PAN, Aadhaar, phone numbers, exact rupee amounts, and optionally named persons)
 * into blurred placeholders and fun celebrity aliases for safe public posting.
 */
export function maskSensitiveDetails(rawText: string, authorRealName?: string): MaskResult {
  let masked = rawText;
  const aliases: Record<string, string> = {};
  const sensitiveAmounts: string[] = [];

  // Mask PAN numbers (e.g., ABCDE1234F)
  masked = masked.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, (match) => {
    aliases[match] = 'MASKED-PAN';
    return '[MASKED-ID]';
  });

  // Mask Aadhaar-like 12-digit numbers
  masked = masked.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[MASKED-AADHAAR]');

  // Mask Indian phone numbers
  masked = masked.replace(/(?:\+91[\s-]?)?[6-9]\d{9}\b/g, '[MASKED-PHONE]');

  // Mask exact Rupee amounts (₹4,500 / Rs. 50000 / 5,00,000)
  masked = masked.replace(/(?:₹|Rs\.?\s?)\d[\d,]*(?:\.\d+)?/gi, (match) => {
    sensitiveAmounts.push(match);
    const digitSkeleton = match.replace(/\d/g, 'X');
    aliases[match] = digitSkeleton;
    return `[BLURRED AMOUNT: ${digitSkeleton}]`;
  });

  // Replace author real name if provided
  if (authorRealName && authorRealName.trim().length > 2) {
    const pick = ALIAS_POOL[authorRealName.length % ALIAS_POOL.length];
    const escaped = authorRealName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    if (regex.test(masked)) {
      aliases[authorRealName] = pick;
      masked = masked.replace(regex, `[Alias: ${pick}]`);
    }
  }

  return {
    maskedContent: masked,
    aliases,
    sensitiveAmounts,
  };
}

export function generateStageName(seedStr: string): string {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const alias = ALIAS_POOL[hash % ALIAS_POOL.length];
  const tag = 100 + (hash % 899);
  return `${alias} #${tag}`;
}
