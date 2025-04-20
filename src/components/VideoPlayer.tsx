'use client';

type YouTubePlayerProps = {
  id?: string;
};

export default function YouTubePlayer({ id }: YouTubePlayerProps) {
  if (!id) return null; // or show fallback content

  return (
    <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden border border-gray-700">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube Video"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
