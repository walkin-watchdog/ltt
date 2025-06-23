import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify'
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Facebook, Twitter, Linkedin } from 'lucide-react';
import { fetchPost, type Post } from '../services/wordpressService';
import { SEOHead } from '../components/seo/SEOHead';

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const postData = await fetchPost(slug);
        setPost(postData);
      } catch (error) {
        console.error('Error loading blog post:', error);
        setError('Failed to load the blog post. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPost();
  }, [slug]);

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

  const getAuthorAvatar = (post: Post) => {
    return post._embedded?.author?.[0]?.avatar_urls?.['96'] || '';
  };

  const getCategoryNames = (post: Post) => {
    if (!post._embedded || !post._embedded['wp:term']) {
      return [];
    }
    
    // Categories are in the first array of wp:term
    const postCategories = post._embedded['wp:term'][0] || [];
    return postCategories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug
    }));
  };

  const getTagNames = (post: Post) => {
    if (!post._embedded || !post._embedded['wp:term']) {
      return [];
    }
    
    // Tags are in the second array of wp:term
    const postTags = post._embedded['wp:term'][1] || [];
    return postTags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug
    }));
  };

  const getFeaturedImage = (post: Post) => {
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
    return featuredMedia?.source_url || '';
  };

  const sharePost = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const url = window.location.href;
    const title = post?.title.rendered || '';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested blog post could not be found.'}</p>
          <Link to="/blog" className="bg-[#ff914d] text-white px-4 py-2 rounded-md hover:bg-[#e8823d] transition-colors">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const categories = getCategoryNames(post);
  const tags = getTagNames(post);
  const featuredImage = getFeaturedImage(post);

  // Generate SEO data
  const postTitle = post.title.rendered.replace(/<\/?[^>]+(>|$)/g, '');
  const postExcerpt = post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, '').substring(0, 160);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${postTitle} - Luxé TimeTravel Blog`}
        description={postExcerpt}
        keywords={tags.map(tag => tag.name).join(', ')}
        image={featuredImage}
        type="article"
        published={post.date}
        modified={post.modified}
        author={getAuthorName(post)}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back to Blog Link */}
        <Link to="/blog" className="flex items-center text-[#104c57] hover:text-[#ff914d] mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to All Posts
        </Link>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {featuredImage && (
            <div className="h-96 w-full">
              <img 
                src={featuredImage} 
                alt={postTitle} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          <div className="p-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  to={`/blog/category/${category.slug}`}
                  className="bg-[#104c57] text-white text-xs px-3 py-1 rounded-full hover:bg-[#0d3d47] transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.title.rendered) }}
            />

            {/* Meta Info */}
            <div className="flex flex-wrap items-center text-gray-600 mb-8 text-sm">
              <div className="flex items-center mr-6 mb-2">
                {getAuthorAvatar(post) ? (
                  <img 
                    src={getAuthorAvatar(post)} 
                    alt={getAuthorName(post)} 
                    className="h-6 w-6 rounded-full mr-2" 
                  />
                ) : (
                  <User className="h-5 w-5 mr-2" />
                )}
                <span>{getAuthorName(post)}</span>
              </div>
              
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{formatDate(post.date)}</span>
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose max-w-none mb-8" 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.rendered) }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-8">
                <div className="flex flex-wrap items-center">
                  <Tag className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700 mr-2">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link 
                        key={tag.id}
                        to={`/blog/tag/${tag.slug}`}
                        className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Share Links */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">Share:</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => sharePost('facebook')} 
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => sharePost('twitter')} 
                    className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => sharePost('linkedin')} 
                    className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};