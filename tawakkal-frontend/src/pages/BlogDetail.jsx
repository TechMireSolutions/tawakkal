import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchBlogPost } from '../api';
import { Calendar, User, ArrowLeft } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        // fetchBlogPost can accept ID or slug if backend supports it.
        // For now we assume ID or we use a search endpoint if backend doesn't support slug directly
        const data = await fetchBlogPost(id);
        
        // If data returns a paginated list due to search, handle it:
        const match = Array.isArray(data.results) ? data.results[0] : data;
        
        if (match) {
          setPost(match);
        } else {
          navigate('/404');
        }
      } catch (err) {
        console.error("Error loading blog post:", err);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="bg-ivory min-h-screen pt-32 pb-24 px-6 text-charcoal">
      <div className="max-w-4xl mx-auto">
        <Link to="/blogs" className="inline-flex items-center gap-2 text-gray-500 hover:text-gold font-medium mb-10 transition-colors uppercase tracking-widest text-[11px]">
          <ArrowLeft size={14} /> Back to Blogs
        </Link>
        
        <div className="text-center mb-12">
          {post.category && (
            <p className="text-gold tracking-[0.3em] uppercase text-[11px] font-bold mb-4">{post.category.name || post.category}</p>
          )}
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar size={14} />
              {new Date(post.created_at || new Date()).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-2">
              <User size={14} />
              {post.author?.name || "Tawakkal Team"}
            </span>
          </div>
        </div>

        {post.featured_image && (
          <div className="mb-16 w-full h-[50vh] min-h-[400px] overflow-hidden rounded-2xl shadow-xl">
            <img 
              src={typeof post.featured_image === 'object' ? post.featured_image.url : post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-3xl mx-auto prose-headings:font-bold prose-headings:tracking-tight prose-a:text-gold prose-a:no-underline hover:prose-a:underline text-gray-700" 
             dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  );
};

export default BlogDetail;
