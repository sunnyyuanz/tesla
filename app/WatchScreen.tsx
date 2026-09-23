"use client";

import { useEffect, useRef, useState } from "react";
import { youtubeEmbedUrl } from "./lib/youtube";
import { loadYouTubePlayer, type YouTubePlayer } from "./lib/youtube-player";

export type WatchMedia = { id: string; title: string; url: string; source: string };
export function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value || 0));
  const hours = Math.floor(seconds / 3600);
  return `${hours ? `${hours}:` : ""}${hours ? String(Math.floor(seconds / 60) % 60).padStart(2, "0") : Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function VideoPlayer({ item, onEnded }: { item: WatchMedia; onEnded: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  const ended = useRef(onEnded);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => { ended.current = onEnded; }, [onEnded]);

  useEffect(() => {
    let disposed = false;
    let instance: YouTubePlayer | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    const embed = new URL(youtubeEmbedUrl(item.url)!);
    loadYouTubePlayer().then(api => {
      if (disposed || !mount.current) return;
      const container = document.createElement("div");
      mount.current.replaceChildren(container);
      instance = new api.Player(container, {
        videoId: embed.pathname.split("/").pop()!,
        playerVars: { autoplay: 1, controls: 0, playsinline: 1, rel: 0, origin: window.location.origin, start: Number(embed.searchParams.get("start") || 0) },
        events: {
          onReady({ target }) {
            if (disposed) return;
            player.current = target;
            target.getIframe().title = `YouTube player: ${item.title}`;
            setReady(true);
            setDuration(target.getDuration());
            target.playVideo();
            timer = setInterval(() => {
              if (disposed) return;
              setTime(target.getCurrentTime() || 0);
              setDuration(target.getDuration() || 0);
              setMuted(target.isMuted());
            }, 250);
          },
          onStateChange({ data }) {
            if (disposed) return;
            setPlaying(data === 1);
            if (data === 1) setMessage("");
            if (data === 0) ended.current();
          },
          onAutoplayBlocked() { if (!disposed) setMessage("Press play to start watching."); },
          onError({ data }) {
            if (disposed) return;
            setError(data === 101 || data === 150 ? "This video’s owner does not allow playback on other sites." : data === 100 ? "This video is unavailable or private." : "YouTube could not play this video here.");
          },
        },
      });
    }).catch(() => { if (!disposed) setError("Could not connect to YouTube. Check your connection and try again."); });
    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
      player.current = null;
      instance?.destroy();
    };
  }, [item.url, item.title]);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if ((event.target as HTMLElement)?.closest("input,textarea,button,a,select,[contenteditable=true]")) return;
      const p = player.current;
      if (!p) return;
      if ([" ", "k", "ArrowLeft", "ArrowRight", "m"].includes(event.key)) event.preventDefault();
      if (event.key === " " || event.key === "k") { if (p.getPlayerState() === 1) p.pauseVideo(); else p.playVideo(); }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") p.seekTo(Math.max(0, Math.min(p.getDuration(), p.getCurrentTime() + (event.key === "ArrowLeft" ? -30 : 30))), true);
      if (event.key === "m") { if (p.isMuted()) p.unMute(); else p.mute(); setMuted(p.isMuted()); }
    }
    const onFullscreen = () => setFullscreen(document.fullscreenElement === stage.current);
    document.addEventListener("keydown", keydown);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("fullscreenchange", onFullscreen); };
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function escape(event: KeyboardEvent) { if (event.key === "Escape" && !document.fullscreenElement) setFullscreen(false); }
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", escape); };
  }, [fullscreen]);

  function seek(value: number) {
    const next = Math.max(0, Math.min(duration, value));
    player.current?.seekTo(next, true);
    setTime(next);
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (fullscreen) setFullscreen(false);
      else if (stage.current?.requestFullscreen) await stage.current.requestFullscreen();
      else setFullscreen(true);
    } catch { setFullscreen(true); }
  }

  return <div className={`watch-stage ${fullscreen ? "watch-expanded" : ""}`} ref={stage}>
    <div className="watch-title"><span><i /> NOW PLAYING · YOUTUBE</span><h1>{item.title}</h1></div>
    <div className="watch-video" ref={mount} />
    {(!ready || message || error) && <div className={`watch-status ${error ? "has-error" : ""}`} role="status">{error || message || "Getting your video ready…"}{error && <a href={item.url} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>}</div>}
    <div className="watch-controls" aria-label="Video controls">
      <div className="watch-timeline"><span>{formatTime(time)}</span><input type="range" min="0" max={duration || 1} step="1" value={Math.min(time, duration || 1)} aria-label="Playback progress" aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`} disabled={!ready || !duration || !!error} onChange={e => seek(Number(e.target.value))} style={{ "--progress": `${duration ? time / duration * 100 : 0}%` } as React.CSSProperties}/><span>{formatTime(duration)}</span></div>
      <div className="watch-buttons"><button className="watch-skip" aria-label="Back 30 seconds" title="Back 30 seconds (←)" disabled={!ready || !!error} onClick={() => seek((player.current?.getCurrentTime() || 0) - 30)}><span>↶</span><small>30</small></button><button className="watch-play" aria-label={playing ? "Pause" : "Play"} title="Play / Pause (Space)" disabled={!ready || !!error} onClick={() => playing ? player.current?.pauseVideo() : player.current?.playVideo()}>{playing ? "Ⅱ" : "▶"}</button><button className="watch-skip" aria-label="Forward 30 seconds" title="Forward 30 seconds (→)" disabled={!ready || !!error} onClick={() => seek((player.current?.getCurrentTime() || 0) + 30)}><span>↷</span><small>30</small></button><div className="watch-control-space"/><button aria-label={muted ? "Unmute" : "Mute"} title="Mute (M)" aria-pressed={muted} disabled={!ready || !!error} onClick={() => { const p = player.current; if (!p) return; if (muted) p.unMute(); else p.mute(); setMuted(!muted); }}>{muted ? "♪̸" : "♪"}</button><button aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"} title="Fullscreen" onClick={toggleFullscreen}>⛶</button></div>
    </div>
  </div>;
}

export default function WatchScreen({ item, media, onBack, onChoose }: { item: WatchMedia; media: WatchMedia[]; onBack: () => void; onChoose: (item: WatchMedia) => void }) {
  const [search, setSearch] = useState("");
  const [autoplay, setAutoplay] = useState(true);
  const playable = media.filter(entry => youtubeEmbedUrl(entry.url));
  const current = playable.findIndex(entry => entry.id === item.id);
  const queue = [...playable.slice(current + 1), ...playable.slice(0, current)].filter(entry => entry.id !== item.id);
  const results = (search ? playable : queue).filter(entry => entry.title.toLowerCase().includes(search.toLowerCase()));
  return <div className="watch-page">
    <header className="watch-header"><button className="watch-brand" onClick={onBack} aria-label="Back to library"><span className="watch-logo">▶</span><span><b>vvid<span>.tv</span></b><small>‹ Back to library</small></span></button><label className="watch-search"><span>⌕</span><input aria-label="Search library on watch screen" placeholder="Search my library…" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button onClick={() => setSearch("")} aria-label="Clear watch search">✕</button>}</label><button className="watch-autoplay" role="switch" aria-checked={autoplay} onClick={() => setAutoplay(!autoplay)}>Autoplay<span className={autoplay ? "on" : ""}><i/></span></button><span className="watch-local">Local library</span></header>
    <main className="watch-main"><VideoPlayer key={item.id} item={item} onEnded={() => { if (autoplay && queue.length) onChoose(queue[0]); }}/><section className="watch-queue" aria-label="Up next"><div className="watch-queue-heading"><h2>{search ? "Search results" : "Up next"}</h2><span>Your library · {results.length} {results.length === 1 ? "video" : "videos"}</span></div>{results.length ? <div className="watch-queue-grid">{results.map((entry, index) => <button className="watch-queue-card" key={entry.id} onClick={() => { onChoose(entry); setSearch(""); }}><div className="watch-queue-art"><span>▶</span><small>YouTube</small></div><h3>{entry.title}</h3><p>{search ? "Play video" : index === 0 ? "Next" : `Queue ${index + 1}`}</p></button>)}</div> : <div className="watch-queue-empty">{search ? "No saved videos match your search." : "You’re all caught up. Add more videos to your library to build a queue."}<button onClick={onBack}>Back to library →</button></div>}</section></main>
  </div>;
}
