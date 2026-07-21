import { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { fetchBlogPosts, getMediaUrl } from '../api';
import { Link } from 'react-router-dom';

const Blogs = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadPosts = async () => {
      try {
        const data = await fetchBlogPosts();
        setBlogPosts(data.filter(p => p.is_active));
      } catch (err) {
        console.error("Error loading blog posts:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-charcoal">Loading...</div>;



  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">Stories & Insights</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            Our <span className="italic font-serif text-gold">Blog</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Fashion tips, styling guides, and the latest trends
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.length > 0 ? blogPosts.map((post) => (
              <Link to={`/blog/${post.id || post.slug}`} key={post.id} className="bg-white shadow-sm group cursor-pointer block">
                <article>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={post.featured_image_url ? getMediaUrl(post.featured_image_url) : "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800"} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      {post.category_name && (
                        <span className="text-gold font-medium">{post.category_name}</span>
                      )}
                      {post.category_name && <span>•</span>}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.created_at || new Date()).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 tracking-tight group-hover:text-gold transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt || post.content?.replace(/<[^>]+>/g, '').substring(0, 100) + '...'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User size={12} />
                        {post.author?.name || "Tawakkal Team"}
                      </span>
                      <span className="text-xs font-bold text-gold flex items-center gap-1">
                        Read More
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )) : (
              <div className="col-span-full text-center text-gray-500 py-12">No blog posts found.</div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-black/5 border-y border-gold/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Stay <span className="italic font-serif text-gold">Updated</span>
          </h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter for the latest blog posts, fashion tips, and exclusive offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address"
              className="flex-1 bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
            />
            <button className="bg-charcoal text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-gold transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Blogs;
