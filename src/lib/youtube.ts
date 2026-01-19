const YOUTUBE_API_KEY = 'AIzaSyC0uEdT3sNq4r16VRaHzAm_0wYsc-0HsDM';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeSearchResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: number;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
}

interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    contentDetails: {
      duration: string;
    };
  }>;
}

// Parse ISO 8601 duration (PT4M13S) to seconds
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

export const searchYouTube = async (query: string): Promise<YouTubeSearchResult[]> => {
  if (!query.trim()) return [];
  
  try {
    // Search for videos
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error('YouTube search failed');
    }
    
    const searchData: YouTubeSearchResponse = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }
    
    // Get video durations
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    const detailsUrl = `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      throw new Error('Failed to get video details');
    }
    
    const detailsData: YouTubeVideoResponse = await detailsResponse.json();
    
    // Map durations by video ID
    const durationMap = new Map<string, number>();
    detailsData.items.forEach(item => {
      durationMap.set(item.id, parseDuration(item.contentDetails.duration));
    });
    
    // Combine search results with durations
    return searchData.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: durationMap.get(item.id.videoId) || 0,
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
};

export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
};
