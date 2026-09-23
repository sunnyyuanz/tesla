/** Convert supported public YouTube video links to an embed URL. */
export function youtubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    const youtube = host === 'youtube.com' || host.endsWith('.youtube.com');
    const privacy = host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com');
    let id: string | null = null;
    if (host === 'youtu.be' || host === 'www.youtu.be') id = parts[0];
    else if (youtube && url.pathname === '/watch') id = url.searchParams.get('v');
    else if ((youtube || privacy) && ['embed', 'shorts', 'live'].includes(parts[0])) id = parts[1];
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    const embed = new URL(`https://www.youtube.com/embed/${id}`);
    embed.searchParams.set('autoplay', '1');
    embed.searchParams.set('playsinline', '1');
    const time = url.searchParams.get('t') || url.searchParams.get('start') || '';
    const duration = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(time);
    const seconds = /^\d+$/.test(time) ? Number(time) : duration ? Number(duration[1] || 0) * 3600 + Number(duration[2] || 0) * 60 + Number(duration[3] || 0) : 0;
    if (Number.isSafeInteger(seconds) && seconds > 0) embed.searchParams.set('start', String(seconds));
    return embed.href;
  } catch {
    return null;
  }
}
