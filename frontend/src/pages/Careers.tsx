import { Briefcase, MapPin, Clock, Heart, Users, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';

export const Careers = () => {
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior Travel Consultant',
      department: 'Sales & Operations',
      location: 'New Delhi',
      type: 'Full-time',
      experience: '3-5 years',
      description: 'We are looking for an experienced travel consultant to join our team and help create extraordinary travel experiences for our clients.',
      responsibilities: [
        'Consult with clients to understand their travel preferences and requirements',
        'Design customized travel itineraries and experiences',
        'Coordinate with suppliers and vendors for bookings',
        'Provide exceptional customer service throughout the travel process',
        'Build and maintain relationships with clients'
      ],
      requirements: [
        'Bachelor\'s degree in Tourism, Hospitality, or related field',
        '3-5 years of experience in luxury travel or hospitality industry',
        'Excellent communication and interpersonal skills',
        'Strong attention to detail and organizational abilities',
        'Proficiency in travel booking systems and CRM software'
      ],
      benefits: [
        'Competitive salary with performance bonuses',
        'Health insurance and wellness benefits',
        'Travel allowances and familiarization trips',
        'Professional development opportunities',
        'Flexible working arrangements'
      ]
    },
    {
      id: 2,
      title: 'Marketing Manager - Digital',
      department: 'Marketing',
      location: 'New Delhi',
      type: 'Full-time',
      experience: '4-6 years',
      description: 'Join our marketing team to develop and execute digital marketing strategies that showcase our luxury travel experiences.',
      responsibilities: [
        'Develop and implement comprehensive digital marketing strategies',
        'Manage social media channels and content creation',
        'Execute SEO/SEM campaigns and analyze performance',
        'Collaborate with design team for marketing materials',
        'Track and report on marketing KPIs and ROI'
      ],
      requirements: [
        'Bachelor\'s degree in Marketing, Communications, or related field',
        '4-6 years of experience in digital marketing',
        'Expertise in Google Analytics, AdWords, and social media platforms',
        'Strong analytical and project management skills',
        'Experience in travel or hospitality industry preferred'
      ],
      benefits: [
        'Competitive salary package',
        'Creative freedom and autonomy',
        'Learning and development budget',
        'Remote work flexibility',
        'Team travel experiences'
      ]
    },
    {
      id: 3,
      title: 'Customer Experience Executive',
      department: 'Customer Service',
      location: 'New Delhi',
      type: 'Full-time',
      experience: '1-3 years',
      description: 'Help us deliver exceptional customer experiences by managing client relationships and ensuring smooth travel operations.',
      responsibilities: [
        'Handle customer inquiries and provide travel assistance',
        'Coordinate with tour guides and local operators',
        'Resolve customer issues and complaints promptly',
        'Maintain customer databases and travel records',
        'Support booking and payment processes'
      ],
      requirements: [
        'Bachelor\'s degree in any field',
        '1-3 years of customer service experience',
        'Excellent verbal and written communication skills',
        'Multi-lingual abilities preferred (Hindi, English, others)',
        'Problem-solving mindset and patience'
      ],
      benefits: [
        'Attractive salary and incentives',
        'Comprehensive training program',
        'Career growth opportunities',
        'Health and life insurance',
        'Performance recognition programs'
      ]
    },
    {
      id: 4,
      title: 'Business Development Manager',
      department: 'Business Development',
      location: 'Mumbai',
      type: 'Full-time',
      experience: '5-8 years',
      description: 'Drive business growth by developing strategic partnerships and expanding our market presence in luxury travel segment.',
      responsibilities: [
        'Identify and pursue new business opportunities',
        'Build relationships with hotels, suppliers, and partners',
        'Negotiate contracts and partnership agreements',
        'Develop market entry strategies for new destinations',
        'Analyze market trends and competitive landscape'
      ],
      requirements: [
        'MBA or Bachelor\'s degree in Business Administration',
        '5-8 years of business development experience',
        'Strong negotiation and relationship-building skills',
        'Knowledge of luxury travel and hospitality industry',
        'Willingness to travel extensively'
      ],
      benefits: [
        'Executive compensation package',
        'Stock options and equity participation',
        'International travel opportunities',
        'Executive healthcare benefits',
        'Leadership development programs'
      ]
    }
  ];

  const companyValues = [
    {
      icon: Heart,
      title: 'Passion for Travel',
      description: 'We believe in the transformative power of travel and are passionate about creating meaningful experiences.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'We work together as a cohesive team, supporting each other to achieve common goals.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Learning',
      description: 'We encourage continuous learning and professional development for all team members.'
    },
    {
      icon: Briefcase,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from customer service to product quality.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Careers - Join Our Team at Luxé TimeTravel"
        description="Explore exciting career opportunities in luxury travel. Join our passionate team and help create extraordinary travel experiences for discerning travelers."
        keywords="travel jobs, luxury travel careers, tourism jobs, travel industry careers, hospitality jobs"
      />

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Build Your Career with Us
            </h1>
            <p className="text-xl text-gray-200">
              Join our passionate team and help create extraordinary travel experiences
            </p>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Why Work with Luxé TimeTravel?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're not just a travel company – we're a team of passionate individuals 
              committed to creating unforgettable experiences and fostering personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#ff914d] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#104c57] mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Current Openings
            </h2>
            <p className="text-lg text-gray-600">
              Explore exciting opportunities to join our growing team
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Listings */}
            <div className="space-y-4">
              {jobOpenings.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-colors ${
                    selectedJob?.id === job.id ? 'border-[#ff914d]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <span className="bg-[#ff914d] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {job.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="text-sm">{job.department}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{job.experience} experience</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
                </div>
              ))}
            </div>

            {/* Job Details */}
            <div className="lg:sticky lg:top-8">
              {selectedJob ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedJob.title}</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Department:</span>
                      <p className="text-gray-900">{selectedJob.department}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Location:</span>
                      <p className="text-gray-900">{selectedJob.location}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Type:</span>
                      <p className="text-gray-900">{selectedJob.type}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Experience:</span>
                      <p className="text-gray-900">{selectedJob.experience}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
                      <p className="text-gray-700">{selectedJob.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Responsibilities</h3>
                      <ul className="space-y-1">
                        {selectedJob.responsibilities.map((responsibility: string, index: number) => (
                          <li key={index} className="flex items-start text-gray-700">
                            <span className="text-[#ff914d] mr-2">•</span>
                            <span className="text-sm">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                      <ul className="space-y-1">
                        {selectedJob.requirements.map((requirement: string, index: number) => (
                          <li key={index} className="flex items-start text-gray-700">
                            <span className="text-[#ff914d] mr-2">•</span>
                            <span className="text-sm">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Benefits</h3>
                      <ul className="space-y-1">
                        {selectedJob.benefits.map((benefit: string, index: number) => (
                          <li key={index} className="flex items-start text-gray-700">
                            <span className="text-[#ff914d] mr-2">•</span>
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8">
                    <a
                      href={`mailto:careers@luxetimetravel.com?subject=Application for ${selectedJob.title}&body=Dear Hiring Team,%0D%0A%0D%0AI am interested in applying for the ${selectedJob.title} position.%0D%0A%0D%0APlease find my resume attached.%0D%0A%0D%0ABest regards`}
                      className="w-full bg-[#ff914d] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors text-center block"
                    >
                      Apply for This Position
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Position
                  </h3>
                  <p className="text-gray-600">
                    Click on any job opening to view detailed information and apply
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#104c57] mb-4">
              Application Process
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to join our team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#ff914d] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply</h3>
              <p className="text-gray-600">
                Submit your application with resume and cover letter
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review</h3>
              <p className="text-gray-600">
                Our HR team reviews your application and qualifications
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview</h3>
              <p className="text-gray-600">
                Participate in interviews with our team members
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#ff914d] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome</h3>
              <p className="text-gray-600">
                Join our team and start your journey with us
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#104c57] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8">
            Don't see the perfect role? Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:careers@luxetimetravel.com"
              className="bg-[#ff914d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e8823d] transition-colors"
            >
              Send Your Resume
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#104c57] transition-colors"
            >
              Contact HR Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};