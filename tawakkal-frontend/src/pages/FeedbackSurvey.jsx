import { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

const FeedbackSurvey = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    rating: 0,
    experience: '',
    productQuality: '',
    deliverySatisfaction: '',
    customerService: '',
    comments: '',
    recommend: '',
    hearAbout: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRating = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '', email: '', orderNumber: '', rating: 0,
        experience: '', productQuality: '', deliverySatisfaction: '',
        customerService: '', comments: '', recommend: '', hearAbout: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="bg-ivory min-h-screen text-charcoal">
        <section className="py-32 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-8">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve our services.
            </p>
            <a href="/" className="inline-block bg-gold text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-charcoal transition-colors">
              Back to Home
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">Your Opinion Matters</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            Feedback <span className="italic font-serif text-gold">Survey</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Help us improve by sharing your experience with us
          </p>
        </div>
      </section>

      {/* Survey Form */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Info */}
            <div className="bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gold" />
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Order Number (Optional)</label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    placeholder="e.g., ORD-123456"
                  />
                </div>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 tracking-tight">Overall Rating *</h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    className={`w-12 h-12 ${formData.rating >= star ? 'text-gold' : 'text-gray-300'} hover:text-gold transition-colors`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formData.rating === 1 && 'Poor'}
                {formData.rating === 2 && 'Fair'}
                {formData.rating === 3 && 'Good'}
                {formData.rating === 4 && 'Very Good'}
                {formData.rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Experience Questions */}
            <div className="bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 tracking-tight">Your Experience</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-3">How was your overall shopping experience?</label>
                  <div className="flex gap-4">
                    {['Excellent', 'Good', 'Average', 'Poor'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="experience"
                          value={option}
                          checked={formData.experience === option}
                          onChange={handleChange}
                          className="text-gold focus:ring-gold"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-3">Product Quality</label>
                    <select
                      name="productQuality"
                      value={formData.productQuality}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-3">Delivery Service</label>
                    <select
                      name="deliverySatisfaction"
                      value={formData.deliverySatisfaction}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-3">Customer Service</label>
                    <select
                      name="customerService"
                      value={formData.customerService}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 tracking-tight">Would you recommend us?</h2>
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    value="yes"
                    checked={formData.recommend === 'yes'}
                    onChange={handleChange}
                    className="text-gold focus:ring-gold"
                  />
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Yes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    value="no"
                    checked={formData.recommend === 'no'}
                    onChange={handleChange}
                    className="text-gold focus:ring-gold"
                  />
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">No</span>
                </label>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 tracking-tight">Additional Comments</h2>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={5}
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                placeholder="Tell us more about your experience, suggestions, or concerns..."
              />
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-charcoal text-white px-12 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-colors flex items-center gap-3 mx-auto disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default FeedbackSurvey;
