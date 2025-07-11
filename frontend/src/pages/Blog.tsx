import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';
import { Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchPosts, fetchCategories, type Post, type Category } from '../services/wordpressService';
import { SEOHead } from '../components/seo/SEOHead';
import { NewsletterSubscription } from '../components/common/NewsletterSubscription';


export const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const getSafeImageUrl = (url: string) => {
    if (/^https?:\/\/i\d\.wp\.com/.test(url)) return url;
    return url.replace(
      /^https?:\/\/luxetimetravel\.wordpress\.com/,
      'https://i0.wp.com/luxetimetravel.wordpress.com'
    );
  };
  useEffect(() => {
    const loadPostsAndCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch posts
        const { posts, totalPages: totalPostPages } = await fetchPosts(currentPage, 6, selectedCategory);
        setPosts(posts);
        setTotalPages(totalPostPages);
        
        // Fetch categories
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading blog data:', error);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPostsAndCategories();
  }, [currentPage, selectedCategory]);

  const handleCategoryChange = (categoryId: number | undefined) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const [blobUrls, setBlobUrls] = useState<Record<number,string>>({});
  useEffect(() => {
    const map: Record<number,string> = {};
    posts.forEach(p => {
      if (p.featuredMediaBlob) {
        map[p.id] = URL.createObjectURL(p.featuredMediaBlob);
      }
    });
    setBlobUrls(map);
    return () => Object.values(map).forEach(URL.revokeObjectURL);
  }, [posts]);

  const renderFeaturedImage = (post: Post) => {
    if (blobUrls[post.id]) {
      return (
        <img
          src={getSafeImageUrl(blobUrls[post.id])}
          alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered}
          className="w-full h-48 object-cover"
        />
      )
    }
    const embedded = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const fallback = (post as any).jetpack_featured_media_url;
    const url = embedded ?? fallback;
    if (url) {
      return (
        <img
          src={getSafeImageUrl(url)}
          alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered}
          className="w-full h-48 object-cover"
        />
      )
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
    return post._embedded?.author?.[0]?.name || 'Luxé TimeTravel';
  };

  const getCategoryNames = (post: Post) => {
    if (!post._embedded || !post._embedded['wp:term']) {
      return [];
    }
    
    // Categories are in the first array of wp:term
    const postCategories = post._embedded['wp:term'][0] || [];
    return postCategories.map(category => category.name);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Blog - Luxé TimeTravel"
        description="Discover travel tips, destination guides, and stories from our luxury travel experiences. Get inspired for your next adventure."
        keywords="travel blog, luxury travel, travel tips, destination guides, travel stories"
      />

      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              The Luxé Journal
            </h1>
            <p className="text-xl text-gray-200">
              Travel insights, stories, and inspiration
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-6 text-center">
                <p className="text-lg font-medium mb-2">Error Loading Blog</p>
                <p>{error}</p>
                <button 
                  className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">No Posts Found</p>
                <p className="text-gray-600">
                  {selectedCategory 
                    ? "No posts found in this category. Try selecting a different category."
                    : "No blog posts have been published yet. Check back soon!"}
                </p>
              </div>
            ) : (
              <>
                {/* Featured Post */}
                {currentPage === 1 && !selectedCategory && posts.length > 0 && (() => {
                   const featured = posts[0];
                   return (
                     <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                       {renderFeaturedImage(featured)}
                       <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getCategoryNames(posts[0]).map((category, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              {category}
                            </span>
                          ))}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3" 
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(posts[0].title.rendered) }} />
                        
                        <div className="flex items-center text-gray-600 mb-4 text-sm">
                          <User className="h-4 w-4 mr-1" />
                          <span className="mr-4">{getAuthorName(posts[0])}</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(posts[0].date)}</span>
                        </div>
                      
                        <p
                          className="text-gray-700 mb-4"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(getPostExcerpt(featured))
                          }}
                        />
                        <Link
                          to={`/blog/${featured.slug}`}
                          className="inline-block bg-[#104c57] text-white px-4 py-2 rounded-md hover:bg-[#0d3d47] transition-colors"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  );
                })()}

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(currentPage === 1 && !selectedCategory ? posts.slice(1) : posts).map(post => (
                    <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <Link to={`/blog/${post.slug}`}>
                        {renderFeaturedImage(post)}
                      </Link>
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getCategoryNames(post).map((category, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              {category}
                            </span>
                          ))}
                        </div>
                        
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
              
              <ul className="space-y-2">
                <li>
                  <button
                    className={`text-left w-full px-3 py-2 rounded-md ${
                      !selectedCategory 
                        ? 'bg-[#ff914d] text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleCategoryChange(undefined)}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map(category => (
                  <li key={category.id}>
                    <button
                      className={`text-left w-full px-3 py-2 rounded-md flex items-center justify-between ${
                        selectedCategory === category.id 
                          ? 'bg-[#ff914d] text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      <span>{category.name}</span>
                      <span className={`text-xs ${
                        selectedCategory === category.id 
                          ? 'bg-white text-[#ff914d]' 
                          : 'bg-gray-100 text-gray-800'
                      } rounded-full px-2 py-1`}>
                        {category.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">Subscribe</h2>
              <NewsletterSubscription />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};