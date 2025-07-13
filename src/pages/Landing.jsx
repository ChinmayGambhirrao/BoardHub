import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutPanelLeft, 
  RefreshCw, 
  Copy, 
  Play,
  Twitter,
  Github,
  ArrowRight,
  Check,
  Star,
  Users,
  Zap
} from 'lucide-react';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [animatedSections, setAnimatedSections] = useState(new Set());
  const sectionRefs = useRef({});

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId) {
            setAnimatedSections(prev => new Set([...prev, sectionId]));
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const fadeInUp = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'all 0.6s ease-out'
  };

  const staggerDelay = (index) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.6s ease-out ${index * 0.1}s`
  });

  const sectionAnimation = (sectionId) => ({
    opacity: animatedSections.has(sectionId) ? 1 : 0,
    transform: animatedSections.has(sectionId) ? 'translateY(0)' : 'translateY(50px)',
    transition: 'all 0.8s ease-out'
  });

  const addSectionRef = (id, ref) => {
    if (ref) {
      sectionRefs.current[id] = ref;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full transition-all duration-300 z-50 ${
        scrollY > 50 ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 group">
              <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-200 animate-float">
                BoardHub
              </div>
              <div className="text-sm text-muted-foreground hidden sm:block group-hover:text-primary transition-colors duration-200">
                Organize work, your way
              </div>
            </div>

            {/* Center Links */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Templates', 'Pricing'].map((link, index) => (
                <a 
                  key={link}
                  href={`#${link.toLowerCase()}`} 
                  className="text-foreground hover:text-primary transition-all duration-200 relative group"
                  style={staggerDelay(index)}
                >
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-foreground hover:text-primary transition-all duration-200 hover:scale-105 hover-lift"
              >
                Log In
              </Link>
              <Link 
                to="/register"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 animate-glow"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div style={fadeInUp}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
              Task management made simple
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Drag, drop, and collaborate with BoardHub's intuitive kanban boards
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16" style={staggerDelay(1)}>
            <Link 
              to="/register"
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-md font-medium text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 flex items-center space-x-2 hover-lift"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <button className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-all duration-200 hover:scale-105 group gentle-pulse">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                <Play className="w-5 h-5" />
              </div>
              <span>Watch Demo</span>
            </button>
          </div>
          
          {/* Hero Visual */}
          <div className="mt-16 max-w-4xl mx-auto" style={staggerDelay(2)}>
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] hover-lift">
              <div className="bg-gradient-to-br from-muted to-muted/50 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
                <div className="text-center relative z-10">
                  <div className="text-6xl mb-4 animate-bounce">📋</div>
                  <p className="text-muted-foreground font-medium">BoardHub App Interface</p>
                  <p className="text-sm text-muted-foreground mt-2">Your kanban boards will appear here</p>
                </div>
                {/* Floating elements */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-primary/30 rounded-full animate-ping"></div>
                <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 left-1/4 w-4 h-4 bg-purple-400/30 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30 backdrop-blur-sm relative"
        ref={(ref) => addSectionRef('features', ref)}
        data-section="features"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" style={sectionAnimation('features')}>
            <h2 className="text-3xl font-bold mb-4">Everything you need to stay organized</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features that help teams collaborate and get work done efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: LayoutPanelLeft,
                title: "Boards & Cards",
                description: "Organize tasks with drag-and-drop cards",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: RefreshCw,
                title: "Real-Time Sync",
                description: "See updates instantly with teammates",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Copy,
                title: "Templates",
                description: "Start fast with project templates",
                color: "from-purple-500 to-purple-600"
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 hover-lift stagger-item"
                style={staggerDelay(index)}
              >
                <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-rotate-in`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200">{feature.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section 
        id="templates" 
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        ref={(ref) => addSectionRef('templates', ref)}
        data-section="templates"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" style={sectionAnimation('templates')}>
            <h2 className="text-3xl font-bold mb-4">Start in seconds with templates</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our collection of pre-built templates to get started quickly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Project Management', color: 'from-blue-500 to-blue-600', icon: '📊' },
              { name: 'Personal Tasks', color: 'from-green-500 to-green-600', icon: '✅' },
              { name: 'Sprint Planning', color: 'from-purple-500 to-purple-600', icon: '🏃' },
              { name: 'Student Planner', color: 'from-orange-500 to-orange-600', icon: '📚' }
            ].map((template, index) => (
              <div 
                key={index} 
                className="group bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 hover-lift stagger-item"
                style={staggerDelay(index)}
              >
                <div className={`bg-gradient-to-br ${template.color} h-32 flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-white text-4xl animate-scale-in">{template.icon}</div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors duration-200">{template.name}</h3>
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center space-x-2 group hover-glow">
                    <span>Use Template</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30 backdrop-blur-sm"
        ref={(ref) => addSectionRef('stats', ref)}
        data-section="stats"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users, number: "10K+", label: "Active Users", color: "text-blue-400" },
              { icon: Star, number: "4.9", label: "User Rating", color: "text-yellow-400" },
              { icon: Zap, number: "99.9%", label: "Uptime", color: "text-green-400" }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover-lift stagger-item"
                style={staggerDelay(index)}
              >
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-float`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors duration-200">{stat.number}</div>
                <div className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section 
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        ref={(ref) => addSectionRef('testimonials', ref)}
        data-section="testimonials"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12" style={sectionAnimation('testimonials')}>What our users say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                initials: "AT",
                name: "Alex T.",
                role: "Freelancer",
                quote: "BoardHub replaced our messy spreadsheets!",
                rating: 5
              },
              {
                initials: "JL",
                name: "Jamie L.",
                role: "Startup Founder",
                quote: "My team's productivity doubled.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className="group bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 hover-lift stagger-item"
                style={staggerDelay(index)}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-bold mr-4 group-hover:scale-110 transition-transform duration-300 animate-scale-in">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold group-hover:text-primary transition-colors duration-200">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-200 italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section 
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        ref={(ref) => addSectionRef('cta', ref)}
        data-section="cta"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover-lift">
            <h2 className="text-3xl font-bold mb-6" style={sectionAnimation('cta')}>Ready to organize your work?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" style={staggerDelay(1)}>
              <Link 
                to="/register"
                className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-md font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center space-x-2 hover-lift attention-bounce"
              >
                <span>Sign Up Free</span>
                <Check className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </Link>
              <button className="group border border-border hover:bg-card px-8 py-3 rounded-md font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 hover-lift">
                <span>Explore Templates</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-primary mb-4 hover:scale-110 transition-transform duration-200 cursor-pointer animate-float">BoardHub</div>
              <p className="text-muted-foreground">
                Organize work, your way
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {['Features', 'Templates', 'Pricing'].map((link) => (
                  <li key={link}>
                    <a 
                      href={`#${link.toLowerCase()}`} 
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {['Privacy', 'Terms'].map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Social</h3>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 hover:rotate-12"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 hover:rotate-12"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            © 2024 BoardHub. Built by Chinmay G.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
