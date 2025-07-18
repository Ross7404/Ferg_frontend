import { useEffect, useRef } from 'react';

export default function About() {
  // refs để scroll animation
  const headerRef = useRef(null);
  const sections = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  
  useEffect(() => {
    // Hàm xử lý animation khi scroll
    const handleScroll = () => {
      const elements = [headerRef.current, ...sections.map(ref => ref.current)];
      elements.forEach(el => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;
        if (isVisible) {
          el.classList.add('animate-fade-in');
          el.style.opacity = '1';
        }
      });
    };

    // Đăng ký sự kiện scroll
    window.addEventListener('scroll', handleScroll);
    // Gọi hàm một lần khi component mount để xử lý các phần tử đã hiển thị
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="bg-orange-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--accent-dark)] to-[var(--accent-color)] text-white">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://img.freepik.com/free-photo/cinema-elements-red-background-with-copy-space_23-2148457853.jpg" 
            alt="Cinema Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div 
          ref={headerRef} 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10 opacity-0 transition-opacity duration-1000"
        >
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="inline-block text-white">B Cinema</span>
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90">
              Experience world-class cinema in Vietnam
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <a 
                href="/" 
                className="inline-block px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Home
              </a>
              <a 
                href="#vision" 
                className="inline-block px-6 py-3 bg-white text-[var(--accent-dark)] font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 lg:h-20">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0 120L48 105C96 90 192 60 288 50C384 40 480 50 576 65C672 80 768 100 864 100C960 100 1056 80 1152 65C1248 50 1344 40 1392 35L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" fill="#FFF7ED"/>
          </svg>
        </div>
      </div>
      
      {/* Giới thiệu chung */}
      <div 
        id="intro" 
        ref={sections[0]} 
        className="py-16 md:py-24 opacity-0 bg-[var(--primary-dark)] transition-opacity duration-1000 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -left-6 -top-6 w-24 h-24 bg-yellow-200 rounded-full opacity-50"></div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-orange-200 rounded-full opacity-50"></div>
                <img 
                  src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000" 
                  alt="Cinema Experience" 
                  className="w-full h-auto rounded-xl shadow-xl relative z-10"
                />
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <h2 className="text-3xl font-bold mb-6">
                <span className="inline-block border-b-4 border-[var(--accent-color)] pb-1 text-[var(--primary-text)]">About Us</span>
              </h2>
              <p className="text-[var(--secondary-text)] mb-6 leading-relaxed">
                B Cinema was established in 2023 with a vision to bring world-class cinema experience to Vietnamese audiences. Starting with 5 cinema complexes in Hanoi and Ho Chi Minh City, we have quickly expanded and become one of the most beloved cinema chains in Vietnam.
              </p>
              <p className="text-[var(--secondary-text)] mb-6 leading-relaxed">
                With modern screening rooms equipped with Dolby Atmos sound technology, 4K screens, and premium seating systems, B Cinema delivers the ultimate movie-watching experience. We are proud to be the exclusive screening partner of many major film studios, bringing the latest and most outstanding movies to Vietnamese audiences.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tầm nhìn & Sứ mệnh */}
      <div 
        id="vision" 
        ref={sections[1]} 
        className="py-16 bg-[var(--secondary-dark)] opacity-0 transition-opacity duration-1000 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--primary-text)]">
              <span className="inline-block border-b-4 border-[var(--accent-color)] pb-1">Vision & Mission</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[var(--primary-dark)] p-8 rounded-xl border border-[var(--accent-color)] shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[var(--accent-color)] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--primary-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--primary-text)] text-center mb-4">Vision</h3>
              <p className="text-[var(--secondary-text)] text-center">
                To become Vietnam's leading cinema chain, delivering world-class cinematic experiences and contributing to the development of Vietnamese cinema.
              </p>
            </div>
            
            <div className="bg-[var(--primary-dark)] p-8 rounded-xl border border-[var(--accent-color)] p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[var(--accent-color)] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--primary-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--primary-text)] text-center mb-4">Mission</h3>
              <p className="text-[var(--secondary-text)] text-center">
                We are committed to providing audiences with the highest quality cinema experiences through dedicated service, modern facilities, and a diverse, rich selection of films.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Giá trị cốt lõi */}
      <div 
        id="values" 
        ref={sections[2]} 
        className="py-16 md:py-24 bg-[var(--primary-dark)] opacity-0 transition-opacity duration-1000 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--primary-text)]">
              <span className="inline-block border-b-4 border-[var(--accent-color)] pb-1">Core Values</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--secondary-dark)] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-[var(--accent-color)]">
              <div className="w-12 h-12 bg-[var(--accent-color)] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--primary-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--primary-text)] mb-2">Superior Quality</h3>
              <p className="text-[var(--secondary-text)] text-sm">
                We always prioritize quality, from sound and visual technology to space and service, delivering a perfect movie-watching experience.
              </p>
            </div>
            
            <div className="bg-[var(--secondary-dark)] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-[var(--accent-color)]">
              <div className="w-12 h-12 bg-[var(--accent-color)] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--primary-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--primary-text)] mb-2">Dedicated Service</h3>
              <p className="text-[var(--secondary-text)] text-sm">
                Our staff is trained to serve customers in the most professional, enthusiastic, and friendly manner.
              </p>
            </div>
            
            <div className="bg-[var(--secondary-dark)] p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-[var(--accent-color)]">
              <div className="w-12 h-12 bg-[var(--accent-color)] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--primary-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--primary-text)] mb-2">Continuous Innovation</h3>
              <p className="text-[var(--secondary-text)] text-sm">
                We continuously update and innovate to bring new, exciting, and more engaging experiences to our audiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dịch vụ của chúng tôi */}
      <div 
        id="services" 
        ref={sections[3]} 
        className="py-16 bg-[var(--secondary-dark)] to-yellow-50 opacity-0 transition-opacity duration-1000 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--primary-text)]">
              <span className="inline-block border-b-4 border-[var(--accent-color)] pb-1">Our Services</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex bg-[var(--primary-dark)] border border-[var(--accent-color)] rounded-xl shadow-md overflow-hidden">
              <div className="w-1/3 bg-orange-500">
                <img 
                  src="https://images.pexels.com/photos/7991121/pexels-photo-7991121.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Phòng chiếu cao cấp" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-2/3 p-6">
                <h3 className="text-lg font-bold text-[var(--primary-text)] mb-2">Premium Screening Rooms</h3>
                <p className="text-[var(--secondary-text)] text-sm">
                  Screening system with modern design, comfortable seating, relaxing space, and state-of-the-art sound and visual technology.
                </p>
              </div>
            </div>
            
            <div className="flex bg-[var(--primary-dark)] border border-[var(--accent-color)] rounded-xl shadow-md overflow-hidden">
              <div className="w-1/3 bg-orange-500">
                <img 
                  src="https://images.pexels.com/photos/5421530/pexels-photo-5421530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Ẩm thực đa dạng" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-2/3 p-6">
                <h3 className="text-lg font-bold text-[var(--primary-text)] mb-2">Diverse Dining Options</h3>
                <p className="text-[var(--secondary-text)] text-sm">
                  Rich menu of food and beverages, from traditional popcorn to special combos serving all audience needs.
                </p>
              </div>
            </div>
            
            <div className="flex bg-[var(--primary-dark)] border border-[var(--accent-color)] rounded-xl shadow-md overflow-hidden">
              <div className="w-1/3 bg-orange-500">
                <img 
                  src="https://images.pexels.com/photos/6803503/pexels-photo-6803503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Đặt vé trực tuyến" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-2/3 p-6">
                <h3 className="text-lg font-bold text-[var(--primary-text)] mb-2">Online Booking</h3>
                <p className="text-[var(--secondary-text)] text-sm">
                  Convenient and fast online booking system helps you easily choose movies, showtimes, and preferred seats.
                </p>
              </div>
            </div>
            
            <div className="flex bg-[var(--primary-dark)] border border-[var(--accent-color)] rounded-xl shadow-md overflow-hidden">
              <div className="w-1/3 bg-orange-500">
                <img 
                  src="https://images.pexels.com/photos/7876708/pexels-photo-7876708.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Thành viên VIP" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-2/3 p-6">
                <h3 className="text-lg font-bold text-[var(--primary-text)] mb-2">VIP Membership</h3>
                <p className="text-[var(--secondary-text)] text-sm">
                  Membership program with many privileges and attractive offers for B Cinema's loyal customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Con số ấn tượng */}
      <div 
        id="stats" 
        ref={sections[4]} 
        className="py-16 bg-[var(--primary-dark)] md:py-24 opacity-0 transition-opacity duration-1000 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--primary-text)]">
              <span className="inline-block border-b-4 border-[var(--accent-color)] pb-1">Impressive Numbers</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-[var(--accent-color)] mb-2">12+</div>
              <p className="text-[var(--secondary-text)]">Cinema Complexes Nationwide</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-[var(--accent-color)] mb-2">50+</div>
              <p className="text-[var(--secondary-text)]">Modern Screening Rooms</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[var(--accent-color)] mb-2">2M+</div>
              <p className="text-[var(--secondary-text)]">Customers per Year</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-[var(--accent-color)] mb-2">100+</div>
              <p className="text-[var(--secondary-text)]">Exclusive Movies</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[var(--accent-dark)] to-[var(--accent-color)] py-16 px-4 sm:px-6 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Experience Premium Cinema</h2>
          <p className="mb-8 text-white/90">
            Come to B Cinema to experience a completely different movie-watching experience with cutting-edge visual and sound technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/ticket-purchase" 
              className="px-8 py-3 bg-white text-[var(--accent-color)] font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Book Now
            </a>
            <a 
              href="/contact" 
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
      
      {/* CSS cho animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease forwards;
        }
      `}</style>
    </div>
  );
}

