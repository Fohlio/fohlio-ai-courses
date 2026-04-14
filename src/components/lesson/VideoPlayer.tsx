interface VideoPlayerProps {
  videoUrl: string | null;
}

function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  if (!videoUrl) return null;

  return (
    <div className="overflow-hidden rounded-lg" data-testid="video-player">
      <video
        src={videoUrl}
        controls
        className="w-full rounded-lg"
        preload="metadata"
        data-testid="video-element"
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
}

export { VideoPlayer };
export type { VideoPlayerProps };
