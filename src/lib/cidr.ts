function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function parseCIDR(cidr: string): { base: number; mask: number } | null {
  const [ip, bits] = cidr.trim().split('/');
  if (!ip || bits === undefined) return null;
  const prefixLen = parseInt(bits, 10);
  if (isNaN(prefixLen) || prefixLen < 0 || prefixLen > 32) return null;
  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
  const base = (ipToNumber(ip) & mask) >>> 0;
  return { base, mask };
}

export function isInternalIP(ip: string): boolean {
  const cidrsEnv = process.env.INTERNAL_CIDRS;
  if (!cidrsEnv) return false;

  const ipNum = ipToNumber(ip);
  if (isNaN(ipNum)) return false;

  return cidrsEnv.split(',').some(cidr => {
    const parsed = parseCIDR(cidr);
    if (!parsed) return false;
    return ((ipNum & parsed.mask) >>> 0) === parsed.base;
  });
}

export function extractClientIP(headers: Headers): string | null {
  const realIP = headers.get('x-real-ip');
  if (realIP) return realIP.trim();

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return null;
}
