import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Contact Us - Luxé TimeTravel"
        description="Get in touch with Luxé TimeTravel for any inquiries about our luxury tours and experiences. We're here to help plan your perfect journey."
        keywords="contact luxe timetravel, travel inquiry, luxury travel contact, tour booking help"
      />

      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-200">
              We're here to help plan your extraordinary journey
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Maps Section */}
          <div>
            <h2 className="text-3xl font-bold text-[#104c57] mb-8 text-center">Find Us</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.2233913121413!2d77.20902361508081!3d28.54340688245398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce26d1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Luxé TimeTravel Location"
              ></iframe>
            </div>
          </div>
        
          {/* Contact Information */}
          <div className="ml-40">
            <h2 className="text-3xl font-bold text-[#104c57] mb-8">Get in Touch</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="bg-[#ff914d] p-3 rounded-lg mr-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-600">
                    375, Masjid Moth Rd,<br />
                    South Extension II, Block A,<br />
                    New Delhi, India 110049
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#ff914d] p-3 rounded-lg mr-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                  <p className="text-gray-600">
                    <a href="tel:+917821001995" className="hover:text-[#ff914d] transition-colors">
                      +91 78210 01995
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#ff914d] p-3 rounded-lg mr-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:admin@luxetimetravel.com" className="hover:text-[#ff914d] transition-colors">
                      admin@luxetimetravel.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#ff914d] p-3 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                    <p>Saturday: 10:00 AM - 6:00 PM</p>
                    <p>Sunday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Contact Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Contact</h3>
          <div className="space-y-3">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full p-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors"
            >
              <span className="mr-3">📱</span>
              Chat on WhatsApp
            </a>
            <a
              href="tel:+917821001995"
              className="flex items-center w-full p-3 bg-[#ff914d] text-white rounded-lg hover:bg-[#e8823d] transition-colors"
            >
              <Phone className="h-5 w-5 mr-3" />
              Call Now
            </a>
            <a
              href="mailto:admin@luxetimetravel.com"
              className="flex items-center w-full p-3 bg-[#104c57] text-white rounded-lg hover:bg-[#0d3d47] transition-colors"
            >
              <Mail className="h-5 w-5 mr-3" />
              Send Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};