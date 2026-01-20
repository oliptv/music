const YOUTUBE_API_KEY = 'AIzaSyC13FIj2bKZZ415aNpCtSDTgUIllSJmBFA';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeSearchResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: number;
}

interface YouTubeSearchResponse {
  items?: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: { medium: { url: string }; high?: { url: string } };
    };
  }>;
}

interface YouTubeVideoResponse {
  items?: Array<{ id: string; contentDetails: { duration: string } }>;
}

const parseDuration = (iso: string): number => {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
};

export const searchYouTube = async (query: string): Promise<YouTubeSearchResult[]> => {
  if (!query.trim()) return [];

  const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&videoCategoryId=10&maxResults=15&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
  const searchRes = await fetch(searchUrl);

  if (!searchRes.ok) {
    const body = await searchRes.json().catch(() => ({})) as any;
    const reason = body?.error?.errors?.[0]?.reason || 'unknown';
    throw new Error(`youtube:${reason}`);
  }

  const searchData: YouTubeSearchResponse = await searchRes.json();
  if (!searchData.items?.length) return [];

  const ids = searchData.items.map(i => i.id.videoId).join(',');
  const detailsRes = await fetch(`${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${ids}&key=${YOUTUBE_API_KEY}`);

  const detailsData: YouTubeVideoResponse = detailsRes.ok ? await detailsRes.json() : { items: [] };
  const durMap = new Map(detailsData.items?.map(i => [i.id, parseDuration(i.contentDetails.duration)]) || []);

  return searchData.items.map(i => ({
    id: i.id.videoId,
    title: i.snippet.title,
    channelTitle: i.snippet.channelTitle,
    thumbnail: i.snippet.thumbnails.high?.url || i.snippet.thumbnails.medium.url,
    duration: durMap.get(i.id.videoId) || 0,
  }));
};

export const getYouTubeEmbedUrl = (videoId: string): string =>
  `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
