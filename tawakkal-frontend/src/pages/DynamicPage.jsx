import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../admin/services/axios';

const DynamicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        // Find page by slug or ID
        const res = await api.get(`/cms/pages/?search=${slug}`);
        const data = res.results || res;
        
        // Find exact match
        const match = Array.isArray(data) ? data.find(p => p.slug === slug || p.id === slug) : data;
        
        if (match) {
          setPageData(match);
        } else {
          navigate('/404');
        }
      } catch (err) {
        console.error("Error fetching page:", err);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!pageData) return null;

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black text-charcoal mb-8 text-center uppercase tracking-tight">
          {pageData.title}
        </h1>
        {pageData.featured_image && (
          <div className="mb-12 w-full h-[400px] overflow-hidden rounded-3xl">
            <img 
              src={typeof pageData.featured_image === 'object' ? pageData.featured_image.url : pageData.featured_image} 
              alt={pageData.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="prose prose-lg max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: pageData.content }} />
      </div>
    </div>
  );
};

export default DynamicPage;
