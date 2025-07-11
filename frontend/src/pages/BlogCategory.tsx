import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPosts, fetchCategories, type Post, type Category } from '../services/wordpressService';
import { SEOHead } from '../components/seo/SEOHead';

export const BlogCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const getSafeImageUrl = (url: string) => {
    if (/^https?:\/\/i\d\.wp\.com/.test(url)) return url;
    return url.replace(
      /^https?:\/\/luxetimetravel\.wordpress\.com/,
      'https://i0.wp.com/luxetimetravel.wordpress.com'
    );
  };

  useEffect(() => {
    const loadCategoryAndPosts = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // First, fetch all categories to find the current one
        const categoriesData = await fetchCategories();
        const currentCategory = categoriesData.find((cat: Category) => cat.slug === slug);
        
        if (!currentCategory) {
          setError('Category not found');
          return;
        }
        
        setCategory(currentCategory);
        
        // Then fetch posts for this category
        const { posts, totalPages: totalPostPages } = await fetchPosts(currentPage, 6, currentCategory.id);
        setPosts(posts);
        setTotalPages(totalPostPages);
      } catch (error) {
        console.error('Error loading category posts:', error);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategoryAndPosts();
  }, [slug, currentPage]);

  const [blobUrls, setBlobUrls] = useState<Record<number,string>>({});

  useEffect(() => {
    const newUrls: Record<number,string> = {};
    posts.forEach(post => {
      if (post.featuredMediaBlob) {
        const url = URL.createObjectURL(post.featuredMediaBlob);
        newUrls[post.id] = url;
      }
    });
    setBlobUrls(newUrls);
    return () => {
      Object.values(newUrls).forEach(URL.revokeObjectURL);
    };
  }, [posts]);


  const renderFeaturedImage = (post: Post) => {
    if (post.featuredMediaBlob) {
      return (
        <img
          src={getSafeImageUrl(blobUrls[post.id])}
          alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered}
          className="w-full h-48 object-cover"
        />
      );
    }
    const embedded = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const fallback = (post as any).jetpack_featured_media_url;
    const url = embedded ?? fallback;
    if (url) {
      const alt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered;
      return <img src={getSafeImageUrl(url)} alt={alt} className="w-full h-48 object-cover" />;
    }
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">No Image</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAuthorName = (post: Post) => {
    return post._embedded?.author?.[0]?.name || 'Admin';
  };

  const getPostExcerpt = (post: Post) => {
    // Remove HTML tags and limit to 150 characters
    const excerpt = post.excerpt.rendered
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&nbsp;/g, ' ')
      .substring(0, 150);
      
    return excerpt.length < post.excerpt.rendered.length 
      ? `${excerpt}...` 
      : excerpt;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested category could not be found.'}</p>
          <Link to="/blog" className="bg-[#ff914d] text-white px-4 py-2 rounded-md hover:bg-[#e8823d] transition-colors">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${category.name} - Luxé TimeTravel Blog`}
        description={`Articles and travel guides about ${category.name}. Discover tips, insights and stories from our luxury travel experiences.`}
        keywords={`${category.name}, travel blog, luxury travel, ${category.name} guides, travel stories`}
      />

      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-gray-200">
              {category.count} Articles
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back to Blog Link */}
        <Link to="/blog" className="flex items-center text-[#104c57] hover:text-[#ff914d] mb-8 transition-colors">
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to All Posts
        </Link>
        
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">No Posts Found</p>
            <p className="text-gray-600">
              There are no posts in this category yet. Check back soon or browse other categories.
            </p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <Link to={`/blog/${post.slug}`}>
                    {renderFeaturedImage(post)}
                  </Link>
                  <div className="p-6">
                    <Link to={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-[#ff914d] transition-colors" 
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.title.rendered) }} />
                    </Link>
                    
                    <div className="flex items-center text-gray-600 mb-4 text-sm">
                      <User className="h-4 w-4 mr-1" />
                      <span className="mr-4">{getAuthorName(post)}</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    
                    <p 
                      className="text-gray-700 mb-4"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getPostExcerpt(post)) }}
                    />
                    
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-[#ff914d] font-medium hover:underline"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" /> Prev
                </button>
                
                <div className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
                >
                  Next <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};