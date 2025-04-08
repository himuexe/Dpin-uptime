"use client"
import React, { useEffect, useState } from 'react';
import { Activity, Bell, Clock, Server, ArrowRight, Check, } from 'lucide-react';
import { useRouter } from 'next/navigation';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for system preference initially
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    // Add listener for changes to system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Keep Your Services <span className="text-indigo-600 dark:text-indigo-400">Always Online</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
                Powerful monitoring for your websites, APIs, and services with real-time alerts when issues occur. Never miss a downtime again.
              </p>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <button 
                  onClick={() => router.push('/dashboard')} 
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center text-lg font-medium shadow-lg shadow-indigo-600/20"
                >
                  Start Monitoring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-lg font-medium">
                  Watch Demo
                </button>
              </div>
              
              <div className="mt-8 flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="mx-auto text-sm font-medium text-gray-500 dark:text-gray-400">UptimeGuard Dashboard</div>
                </div>
                <img
                  src="/Dashboard.png"
                  alt="Dashboard Preview"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-40 left-12 w-24 h-24 bg-indigo-400 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute bottom-40 right-12 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              Everything you need for reliable monitoring
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Our platform provides comprehensive tools to ensure your services stay online and perform optimally
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Bell className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
              title="Instant Alerts"
              description="Get notified immediately through SMS, email, Slack, or webhook when your services experience issues."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
              title="24/7 Monitoring"
              description="Round-the-clock monitoring from multiple global locations ensures comprehensive coverage."
            />
            <FeatureCard
              icon={<Server className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
              title="Detailed Reports"
              description="Comprehensive reports and analytics help you identify patterns and optimize performance."
            />
            <FeatureCard
              icon={<Activity className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
              title="Uptime Metrics"
              description="Track your service's availability with detailed metrics and SLA compliance reports."
            />
            <FeatureCard
              icon={<Bell className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
              title="Status Pages"
              description="Create beautiful, branded status pages to keep your customers informed about your services."
            />
            <FeatureCard
              icon={<Server className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
              title="API Access"
              description="Integrate monitoring data with your existing tools using our powerful REST API."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              Trusted by companies worldwide
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              See what our customers are saying about UptimeGuard
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="UptimeGuard has been essential in ensuring our services remain reliable. The instant alerts have saved us from several potential outages."
              name="Sarah Johnson"
              title="CTO, TechCorp"
            />
            <TestimonialCard
              quote="The comprehensive monitoring and detailed reports have helped us identify and fix performance bottlenecks we weren't even aware of."
              name="Michael Chen"
              title="DevOps Lead, CloudSolutions"
            />
            <TestimonialCard
              quote="Setting up UptimeGuard was incredibly easy, and the customer support has been outstanding whenever we've needed assistance."
              name="Emily Rodriguez"
              title="IT Director, GlobalRetail"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that works best for your business needs
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Starter"
              price="29"
              description="Perfect for small websites and personal projects"
              features={[
                "10 monitors",
                "1-minute checks",
                "Email notifications",
                "5 team members",
                "24h data retention"
              ]}
            />
            <PricingCard
              title="Professional"
              price="79"
              description="Ideal for growing businesses with multiple services"
              featured={true}
              features={[
                "50 monitors",
                "30-second checks",
                "All notification channels",
                "Unlimited team members",
                "30-day data retention",
                "API access"
              ]}
            />
            <PricingCard
              title="Enterprise"
              price="199"
              description="For large organizations with complex requirements"
              features={[
                "Unlimited monitors",
                "15-second checks",
                "Priority support",
                "Custom solutions",
                "90-day data retention",
                "SLA guarantee"
              ]}
            />
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Need a custom solution?</p>
            <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to ensure your services are always online?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that trust UptimeGuard to monitor their critical services
          </p>
          <button 
            onClick={() => router.push('/signup')}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-lg font-medium shadow-lg"
          >
            Start your 14-day free trial
          </button>
          <p className="mt-4 text-indigo-200">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold">UptimeGuard</span>
              </div>
              <p className="mt-4 text-gray-400 max-w-md">
                UptimeGuard helps you monitor your services 24/7 and alerts you instantly when issues occur, ensuring maximum uptime for your business.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  {/* Twitter icon */}
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  {/* LinkedIn icon */}
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  {/* GitHub icon */}
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2025 UptimeGuard. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100 dark:border-gray-700 group">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl inline-flex mb-6 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, title }) {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="text-indigo-600 dark:text-indigo-400 mb-4">
        {/* Quote icon */}
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{quote}</p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div className="ml-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ title, price, description, features, featured = false }) {
  return (
    <div className={`relative p-8 rounded-2xl transition-all duration-300 h-full flex flex-col ${
      featured
        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/20 scale-105 z-10'
        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl'
    }`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-900 text-white text-sm font-medium px-4 py-1 rounded-full">
          Most Popular
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className={`text-sm mb-6 ${featured ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {description}
      </p>
      
      <div className="mb-6">
        <span className="text-4xl font-bold">${price}</span>
        <span className={`text-sm ${featured ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>/month</span>
      </div>
      
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-3">
            <Check className={`h-5 w-5 ${featured ? 'text-indigo-200' : 'text-indigo-500 dark:text-indigo-400'}`} />
            <span className={featured ? 'text-indigo-50' : ''}>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        className={`w-full py-3 rounded-lg transition font-medium ${
          featured
            ? 'bg-white text-indigo-600 hover:bg-indigo-50'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        Get Started
      </button>
    </div>
  );
}

export default App;