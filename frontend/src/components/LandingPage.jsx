import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight text-white mb-6">
                Discover the Power of <span className="text-primary">DARWIN</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8">
                A revolutionary platform designed to transform the way you interact with data and make decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="btn btn-primary shadow-glow text-center">
                  Get Started
                </Link>
                <button className="btn btn-outline">Learn More</button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 shadow-glow">
                <div className="aspect-video bg-gradient-to-br from-primary/30 via-primary/20 to-dark-900 rounded-lg flex items-center justify-center">
                  <div className="text-6xl text-primary font-serif">DARWIN</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-dark-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto">
              Discover what makes DARWIN the ultimate solution for modern challenges
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 hover:transform hover:scale-105">
                <div className="w-14 h-14 flex items-center justify-center bg-primary/20 text-primary rounded-lg mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Use Cases
            </h2>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto">
              See how DARWIN can be applied to various industries and domains
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="card overflow-hidden shadow-lg">
                <div className="h-48 accent-gradient flex items-center justify-center">
                  <span className="text-2xl font-serif text-white">{useCase.title}</span>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-4">{useCase.description}</p>
                  <button className="text-primary hover:text-accent font-medium">
                    Learn more →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-primary/30 via-dark-900 to-dark-950">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Ready to Experience DARWIN?
            </h2>
            <p className="text-lg text-gray-200 mb-8">
              Join thousands of users who are already transforming their workflow with DARWIN.
            </p>
            <Link to="/login" className="btn btn-primary px-8 py-4 text-lg shadow-glow inline-block">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 border-t border-dark-800 py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-serif text-primary font-bold">DARWIN</span>
              <p className="text-gray-400 mt-2">© 2025 All Rights Reserved</p>
            </div>
            <div className="flex space-x-6">
              <a href="/" className="text-gray-300  hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/" className="text-gray-300  hover:text-primary transition-colors">Terms of Service</a>
              <a href="/" className="text-gray-300  hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sample data
const features = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>,
    title: 'Advanced Security',
    description: 'State-of-the-art security protocols to keep your data safe and protected at all times.'
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
    title: 'Lightning Fast Performance',
    description: 'Optimized algorithms ensure quick processing and real-time data analysis.'
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>,
    title: 'Seamless Integration',
    description: 'Easily integrate with your existing workflows and tools for a smooth experience.'
  }
];

const useCases = [
  {
    title: 'Healthcare',
    description: 'Transforming patient care through advanced data analysis and predictive diagnosis.'
  },
  {
    title: 'Finance',
    description: 'Optimize investment strategies and risk assessment with our powerful algorithms.'
  },
  {
    title: 'Education',
    description: 'Personalized learning experiences powered by adaptive content delivery systems.'
  },
  {
    title: 'Manufacturing',
    description: 'Streamline production processes and improve quality control measures.'
  }
];

export default LandingPage;