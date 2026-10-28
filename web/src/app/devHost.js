/**
 * Is the app served from this machine or the local network? Developer-only
 * pages (#dev) are offered only then, never on the published site.
 */

const LOCAL_NAMES = ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'];

/** 'localhost', '127.0.0.1', '192.168.1.20', 'pc.local' -> true; 'user.github.io' -> false. */
export function isLocalHost(hostname) {
    const host = String(hostname || '').toLowerCase();
    if (LOCAL_NAMES.includes(host) || host.endsWith('.localhost') || host.endsWith('.local')) return true;
    // private IPv4 ranges: a phone on the same network (DEVELOPMENT.md)
    const ip = host.split('.').map(Number);
    if (ip.length !== 4 || ip.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
    return ip[0] === 10 || ip[0] === 127 || (ip[0] === 192 && ip[1] === 168) || (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31);
}
