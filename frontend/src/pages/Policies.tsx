import { useState } from 'react';
import { FileText, Shield, Eye, CreditCard } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

export const Policies = () => {
  const [activePolicy, setActivePolicy] = useState('privacy');

  const policies = [
    { id: 'privacy', title: 'Privacy Policy', icon: Shield },
    { id: 'terms', title: 'Terms & Conditions', icon: FileText },
    { id: 'cancellation', title: 'Cancellation Policy', icon: CreditCard },
    { id: 'cookie', title: 'Cookie Policy', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Privacy Policy & Terms - Luxé TimeTravel"
        description="Read our privacy policy, terms and conditions, cancellation policy, and cookie policy. Understand how we protect your data and your rights as our customer."
        keywords="privacy policy, terms conditions, cancellation policy, cookie policy, data protection"
      />

      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-[#104c57] to-[#ff914d] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Policies & Legal Information
            </h1>
            <p className="text-xl text-gray-200">
              Your rights and our commitments
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Policy Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies</h3>
              <nav className="space-y-2">
                {policies.map((policy) => (
                  <button
                    key={policy.id}
                    onClick={() => setActivePolicy(policy.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      activePolicy === policy.id
                        ? 'bg-[#ff914d] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <policy.icon className="h-4 w-4 mr-3" />
                    {policy.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Policy Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {activePolicy === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">
                      <strong>Last updated:</strong> January 2024
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
                    <p className="text-gray-700 mb-4">
                      We collect information you provide directly to us, such as when you create an account, 
                      make a booking, contact us for support, or subscribe to our newsletter.
                    </p>
                    
                    <h4 className="font-medium text-gray-900 mb-2">Personal Information:</h4>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>Name, email address, phone number</li>
                      <li>Travel preferences and requirements</li>
                      <li>Payment information (processed securely)</li>
                      <li>Communication preferences</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>To provide and improve our services</li>
                      <li>To process bookings and payments</li>
                      <li>To communicate with you about your travels</li>
                      <li>To send promotional materials (with consent)</li>
                      <li>To comply with legal obligations</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Information Sharing</h3>
                    <p className="text-gray-700 mb-4">
                      We do not sell, trade, or rent your personal information to third parties. 
                      We may share your information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>With your explicit consent</li>
                      <li>With service providers who assist us in operations</li>
                      <li>When required by law or to protect our rights</li>
                      <li>In connection with a business transfer</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security</h3>
                    <p className="text-gray-700 mb-4">
                      We implement appropriate security measures to protect your personal information 
                      against unauthorized access, alteration, disclosure, or destruction.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Your Rights</h3>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>Access and update your personal information</li>
                      <li>Request deletion of your data</li>
                      <li>Opt-out of marketing communications</li>
                      <li>Request data portability</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Contact Us</h3>
                    <p className="text-gray-700">
                      If you have questions about this Privacy Policy, please contact us at:
                      <br />
                      Email: admin@luxetimetravel.com
                      <br />
                      Phone: +91 78210 01995
                    </p>
                  </div>
                </div>
              )}

              {activePolicy === 'terms' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms & Conditions</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">
                      <strong>Last updated:</strong> January 2024
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                    <p className="text-gray-700 mb-4">
                      By accessing and using Luxé TimeTravel services, you accept and agree to be bound 
                      by the terms and provision of this agreement.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Services</h3>
                    <p className="text-gray-700 mb-4">
                      Luxé TimeTravel provides travel booking services, tour packages, and related 
                      travel experiences. All services are subject to availability.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Booking and Payment</h3>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>All bookings are subject to availability and confirmation</li>
                      <li>Payment is required at the time of booking unless otherwise stated</li>
                      <li>Prices are subject to change without notice</li>
                      <li>We accept major credit cards and digital payment methods</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Travel Documents</h3>
                    <p className="text-gray-700 mb-4">
                      Travelers are responsible for ensuring they have valid passports, visas, 
                      and other required documents for their destination.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Liability</h3>
                    <p className="text-gray-700 mb-4">
                      Luxé TimeTravel acts as an intermediary between travelers and service providers. 
                      Our liability is limited to the amount paid for services.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Force Majeure</h3>
                    <p className="text-gray-700 mb-4">
                      We are not liable for delays or cancellations due to circumstances beyond 
                      our control, including but not limited to natural disasters, strikes, or government actions.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Modifications</h3>
                    <p className="text-gray-700">
                      We reserve the right to modify these terms at any time. Changes will be 
                      effective immediately upon posting on our website.
                    </p>
                  </div>
                </div>
              )}

              {activePolicy === 'cancellation' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cancellation & Refund Policy</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">
                      <strong>Last updated:</strong> January 2024
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">1. General Cancellation Terms</h3>
                    <p className="text-gray-700 mb-4">
                      Cancellations must be made in writing via email or through your booking account. 
                      Cancellation fees apply based on the timing of cancellation.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Refund Schedule</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">For Tours & Experiences:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>24+ hours before:</strong> Full refund (100%)</li>
                        <li><strong>12-24 hours before:</strong> 50% refund</li>
                        <li><strong>Less than 12 hours:</strong> No refund</li>
                        <li><strong>No-show:</strong> No refund</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">For Multi-day Packages:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>30+ days before:</strong> Full refund minus ₹5,000 processing fee</li>
                        <li><strong>15-30 days before:</strong> 75% refund</li>
                        <li><strong>7-15 days before:</strong> 50% refund</li>
                        <li><strong>Less than 7 days:</strong> 25% refund</li>
                      </ul>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Weather-Related Cancellations</h3>
                    <p className="text-gray-700 mb-4">
                      If we cancel a tour due to extreme weather conditions or safety concerns, 
                      you will receive a full refund or the option to reschedule at no additional cost.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Medical Emergencies</h3>
                    <p className="text-gray-700 mb-4">
                      Cancellations due to medical emergencies (with valid medical certificate) 
                      may be eligible for full refund, subject to review.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Refund Processing</h3>
                    <ul className="list-disc pl-6 text-gray-700 mb-4">
                      <li>Refunds are processed within 5-7 business days</li>
                      <li>Refunds are credited to the original payment method</li>
                      <li>Processing fees may apply as per payment gateway policies</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Modifications</h3>
                    <p className="text-gray-700">
                      Changes to bookings are subject to availability and may incur additional costs. 
                      Contact us at least 48 hours before your tour to request modifications.
                    </p>
                  </div>
                </div>
              )}

              {activePolicy === 'cookie' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookie Policy</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">
                      <strong>Last updated:</strong> January 2024
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">1. What Are Cookies</h3>
                    <p className="text-gray-700 mb-4">
                      Cookies are small text files stored on your device when you visit our website. 
                      They help us provide you with a better experience and analyze website usage.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Types of Cookies We Use</h3>
                    
                    <h4 className="font-medium text-gray-900 mb-2">Essential Cookies:</h4>
                    <p className="text-gray-700 mb-4">
                      Required for basic website functionality, including security, navigation, and access to secure areas.
                    </p>

                    <h4 className="font-medium text-gray-900 mb-2">Performance Cookies:</h4>
                    <p className="text-gray-700 mb-4">
                      Help us understand how visitors interact with our website by collecting anonymous information.
                    </p>

                    <h4 className="font-medium text-gray-900 mb-2">Functionality Cookies:</h4>
                    <p className="text-gray-700 mb-4">
                      Remember your preferences and provide enhanced, personalized features.
                    </p>

                    <h4 className="font-medium text-gray-900 mb-2">Marketing Cookies:</h4>
                    <p className="text-gray-700 mb-4">
                      Track your browsing habits to show you relevant advertisements across different websites.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Third-Party Cookies</h3>
                    <p className="text-gray-700 mb-4">
                      We may use third-party services like Google Analytics, payment processors, 
                      and social media platforms that may set their own cookies.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Managing Cookies</h3>
                    <p className="text-gray-700 mb-4">
                      You can control cookies through your browser settings. However, disabling certain 
                      cookies may affect website functionality.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Cookie Consent</h3>
                    <p className="text-gray-700">
                      By continuing to use our website, you consent to our use of cookies as described 
                      in this policy. You can withdraw consent at any time by adjusting your browser settings.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};