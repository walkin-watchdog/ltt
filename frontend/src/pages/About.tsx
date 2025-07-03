import { useState, useEffect } from 'react';
import { Users, Award, Globe, Heart } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { useTranslation } from '../contexts/TranslationContext';
import { translateFields } from '../utils/translate';


interface TeamMember {
  id: string;
  name: string;
  jobTitle: string;
  description: string;
  imageUrl?: string;
}

export const About = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/about`);
        if (response.ok) {
          const raw = await response.json();
          const data = await Promise.all(
            raw.map((m: TeamMember) =>
              translateFields(m, ['jobTitle', 'description'], (s: string) => t(s) as Promise<string>)
            )
          );
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, [t]);

  const achievements = [
    { icon: Award, title: '500+ Happy Travelers', description: 'Consistently rated 5 stars by our guests' },
    { icon: Globe, title: '25+ Destinations', description: 'Covering India\'s most spectacular locations' },
    { icon: Heart, title: '98% Satisfaction Rate', description: 'Exceeding expectations on every journey' },
    { icon: Users, title: 'Expert Local Guides', description: 'Passionate storytellers and culture enthusiasts' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="About Us - Luxé TimeTravel"
        description="Discover the story behind Luxé TimeTravel. Our mission to create extraordinary travel experiences that showcase India's rich heritage and culture."
        keywords="about luxe timetravel, luxury travel company, travel agency india, heritage tours"
      />

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Luxé TimeTravel</h1>
            <p className="text-xl text-gray-200">
              Crafting extraordinary journeys that reveal the soul of India
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#104c57] mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Born from a passion for India's incredible diversity, Luxé TimeTravel was founded with a simple yet profound mission: to create travel experiences that go beyond the ordinary.
                </p>
                <p>
                  We believe that travel should be transformative, connecting you with the authentic spirit of each destination. Our carefully curated journeys showcase India's magnificent heritage, vibrant cultures, and hidden gems through the eyes of passionate local experts.
                </p>
                <p>
                  Every tour is designed to create lasting memories, foster cultural understanding, and provide you with stories that will be treasured for a lifetime.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/1309899/pexels-photo-1309899.jpeg"
                alt="Traditional Indian architecture"
                className="rounded-lg shadow-lg w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">Our Mission & Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are committed to sustainable, responsible tourism that benefits local communities while providing our guests with unparalleled experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#104c57] mb-2">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">
              The passionate individuals behind your extraordinary experiences
            </p>
          </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {isLoading ? (
             // Skeleton loading
             [...Array(3)].map((_, index) => (
               <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                 <div className="h-64 bg-gray-300"></div>
                 <div className="p-6">
                   <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                   <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                   <div className="h-16 bg-gray-300 rounded"></div>
                 </div>
               </div>
             ))
           ) : teamMembers.length > 0 ? (
             teamMembers.map((member) => (
               <div key={member.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                 <img
                   src={member.imageUrl || 'https://via.placeholder.com/300x300'}
                   alt={member.name}
                   className="w-full h-64 object-cover"
                 />
                 <div className="p-6">
                   <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                   <p className="text-[#ff914d] font-medium mb-3">{member.jobTitle}</p>
                   <p className="text-sm text-gray-700">{member.description}</p>
                 </div>
               </div>
             ))
           ) : (
             // Empty state
             <div className="col-span-3 text-center py-8">
               <p className="text-gray-500">Team information coming soon...</p>
             </div>
           )}
         </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">Why Choose Luxé TimeTravel</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#104c57] mb-3">Authentic Experiences</h3>
              <p className="text-gray-600">
                We partner with local communities to offer genuine cultural immersion and authentic experiences that respect traditional ways of life.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#104c57] mb-3">Expert Curation</h3>
              <p className="text-gray-600">
                Every experience is carefully designed by our travel experts who have intimate knowledge of each destination and its hidden treasures.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#104c57] mb-3">Personalized Service</h3>
              <p className="text-gray-600">
                From planning to execution, we provide personalized attention to ensure every detail exceeds your expectations.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#104c57] mb-3">Sustainable Tourism</h3>
              <p className="text-gray-600">
                We are committed to responsible travel practices that preserve cultural heritage and support local economies.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#104c57] mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Our dedicated support team is available around the clock to assist you before, during, and after your journey.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#104c57] mb-3">Safety First</h3>
              <p className="text-gray-600">
                Your safety and well-being are our top priorities. We maintain the highest safety standards in all our operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#104c57] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Discover the Extraordinary?</h2>
          <p className="text-xl mb-8">
            Let us craft a personalized journey that will create memories to last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/plan-your-trip"
              className="bg-[#ff914d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors"
            >
              Plan Your Journey
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#104c57] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};