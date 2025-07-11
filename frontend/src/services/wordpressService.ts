export interface Post {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  modified: string;
  slug: string;
  featured_media: number;
  featuredMediaBlob?: Blob;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
    author?: Array<{
      id: number;
      name: string;
      avatar_urls?: {
        [size: string]: string;
      };
    }>;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// Replace with your WordPress URL

const WP_API_URL: string =
  import.meta.env.VITE_WP_API_URL ??
  'https://public-api.wordpress.com/wp/v2/sites/luxetimetravel.wordpress.com';

const WP_USER          = import.meta.env.VITE_WP_USER;
const WP_APP_PASSWORD  = import.meta.env.VITE_WP_APP_PASSWORD;

const getSafeImageUrl = (url: string) =>
  url.replace(
    /^https?:\/\/luxetimetravel\.wordpress\.com/,
    'https://i0.wp.com/luxetimetravel.wordpress.com'
  );

const AUTH_HEADER: Record<string, string> =
  WP_USER && WP_APP_PASSWORD
    ? { Authorization: `Basic ${btoa(`${WP_USER}:${WP_APP_PASSWORD}`)}` }
    : {};

const wpFetch = (url: string, init: RequestInit = {}) =>
  fetch(url, { ...init, headers: { ...(init.headers || {}), ...AUTH_HEADER } });


export const fetchPosts = async (page = 1, perPage = 10, categoryId?: number, tagId?: number) => {
  try {
    let url = `${WP_API_URL}/posts?status=publish&_embed=author,wp:featuredmedia,wp:term&page=${page}&per_page=${perPage}`;
    
    if (categoryId) {
      url += `&categories=${categoryId}`;
    }
    
    if (tagId) {
      url += `&tags=${tagId}`;
    }
    
    const response = await wpFetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
    }
    
    const posts: Post[] = await response.json();
    const totalPosts  = Number(response.headers.get('X-WP-Total')      ?? 0);
    const totalPages  = Number(response.headers.get('X-WP-TotalPages') ?? 1);
    const postsWithBlobs = await Promise.all(
      posts.map(async post => {
        const embedded = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
        const fallback = (post as any).jetpack_featured_media_url;
        const imageUrl = embedded ?? fallback;

        if (imageUrl) {
          try {
            const safeUrl = getSafeImageUrl(imageUrl);
            const imgRes = await fetch(safeUrl);
            if (imgRes.ok) {
              post.featuredMediaBlob = await imgRes.blob();
            }
          } catch {}
        }
        return post;
      })
    );

    return { posts: postsWithBlobs, totalPosts, totalPages };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const fetchPost = async (slug: string) => {
  try {
    const response = await wpFetch(`${WP_API_URL}/posts?slug=${slug}&status=publish&_embed=author,wp:featuredmedia,wp:term`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
    }
    
    const posts: Post[] = await response.json();
    
    if (posts.length === 0) {
      throw new Error('Post not found');
    }
    
    const post = posts[0];
    const embedded = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const fallback = (post as any).jetpack_featured_media_url;
    const imageUrl = embedded ?? fallback;

    if (imageUrl) {
      try {
        const safeUrl = getSafeImageUrl(imageUrl);
        const imgRes = await fetch(safeUrl);
        if (imgRes.ok) {
          post.featuredMediaBlob = await imgRes.blob();
        }
      } catch {}
    }
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const all: Category[] = [];
    let page = 1;
    let batch = 100;

    while (batch === 100) {
      const res = await wpFetch(`${WP_API_URL}/categories?page=${page}&per_page=100`);
      if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
      const slice: Category[] = await res.json();
      all.push(...slice);
      batch = slice.length;
      page += 1;
    }
    return all;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchTags = async () => {
  try {
    const all: Tag[] = [];
    let page = 1;
    let batch = 100;
    
    while (batch === 100) {
      const res = await wpFetch(`${WP_API_URL}/tags?page=${page}&per_page=100`);
      if (!res.ok) throw new Error(`Failed to fetch tags: ${res.status}`);
      const slice: Tag[] = await res.json();
      all.push(...slice);
      batch = slice.length;
      page += 1;
    }
    return all;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

export const searchPosts = async (query: string, page = 1, perPage = 10) => {
  try {
    const response = await wpFetch(
      `${WP_API_URL}/posts?status=publish,private&search=${encodeURIComponent(
        query
      )}&page=${page}&per_page=${perPage}&_embed=author,wp:featuredmedia,wp:term`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search posts: ${response.status}`);
    }
    
    const results: Post[] = await response.json();
    const totalResults = Number(response.headers.get('X-WP-Total')      ?? 0);
    const totalPages  = Number(response.headers.get('X-WP-TotalPages') ?? 1);

    return { results, totalResults, totalPages };
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};