import { useState, useEffect } from "react";
import logoHeader from "../../public/LogoHeader.jpg";
import { Link, useLocation } from "react-router-dom";
import AccountDropdown from "../AccountDropdown";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
    // When menu is open, prevent page scrolling
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  // Close menu when changing pages
  useEffect(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[var(--accent-dark)] !text-white ${scrolled ? "py-3 shadow-sm" : "py-4"
        }`}
    >
      <div className="h-[2px] bg-[var(--primary-dark)] absolute bottom-0 left-0 right-0"></div>
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-6">
        {/* Logo for Desktop only */}
        <Link to="/" className="max-sm:hidden rounded-lg overflow-hidden">
          <img
            src={logoHeader}
            alt="logo"
            className="h-12 object-contain"
          />
        </Link>

        {/* Logo for Mobile */}
        <Link to="/" className="hidden max-sm:block">
          <img
            src={logoHeader}
            alt="logo"
            className="h-10 object-contain"
          />
        </Link>

        {/* Menu Section - Improved mobile menu */}
        <div className="lg:block">
          {/* Overlay for mobile menu */}
          {isMenuOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
              onClick={handleClick}
            ></div>
          )}

          {/* Menu content */}
          <div
            className={`
              lg:static fixed top-0 right-0 h-full w-[300px] max-w-full
              lg:w-auto lg:h-auto lg:bg-transparent bg-[var(--secondary-dark)]
              lg:translate-x-0 transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
              ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            {/* Close button */}
            <button
              onClick={handleClick}
              className="lg:hidden absolute top-4 right-4 z-[60] rounded-full bg-[var(--primary-dark)] text-[var(--pimary-dark)] w-8 h-8 flex items-center justify-center shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Menu Items */}
            <div className="lg:block h-full flex flex-col">
              <div className="lg:hidden py-5 px-6 border-b border-[var(--primary-dark)] flex justify-center">
                <h1 className="text-xl font-bold text-[var(--primary-dark)]">MENU</h1>
              </div>

              <ul className="lg:flex items-center lg:space-x-1 lg:space-y-0 py-4 lg:py-0 text-[var(--primary-dark)] overflow-y-auto flex-grow">
                <li>
                  <Link
                    to="/"
                    onClick={handleClick}
                    className={`block px-6 py-3 lg:py-2.5 lg:px-4 text-base text-[var(--primary-dark)] border-b lg:border-b-0 border-[var(--primary-dark)] ${isActive("/")
                        ? "text-[var(--accent-color)] font-medium"
                        : "hover:text-[var(--accent-color)]"
                      }`}
                  >
                    Home
                  </Link>
                </li>

                <li>
                  <Link
                    to="/movies"
                    onClick={handleClick}
                    className={`block px-6 py-3 lg:py-2.5 lg:px-4 text-base text-[var(--primary-dark)] border-b lg:border-b-0 border-[var(--primary-dark)] ${isActive("/movies")
                        ? "text-[var(--accent-color)] font-medium"
                        : "hover:text-[var(--accent-color)]"
                      }`}
                  >
                    Movies
                  </Link>
                </li>

                <li>
                  <Link
                    to="/blog"
                    onClick={handleClick}
                    className={`block px-6 py-3 lg:py-2.5 lg:px-4 text-base text-[var(--primary-dark)] border-b lg:border-b-0 border-[var(--primary-dark)] ${isActive("/blog")
                        ? "text-[var(--accent-color)] font-medium"
                        : "hover:text-[var(--accent-color)]"
                      }`}
                  >
                    Blog
                  </Link>
                </li>

                <li>
                  <Link
                    to="/about"
                    onClick={handleClick}
                    className={`block px-6 py-3 lg:py-2.5 lg:px-4 text-base text-[var(--primary-dark)] border-b lg:border-b-0 border-[var(--primary-dark)] ${isActive("/about")
                        ? "text-[var(--accent-color)] font-medium"
                        : "hover:text-[var(--accent-color)]"
                      }`}
                  >
                    About
                  </Link>
                </li>

                <li>
                  <Link
                    to="/contact"
                    onClick={handleClick}
                    className={`block px-6 py-3 lg:py-2.5 lg:px-4 text-base text-[var(--primary-dark)] border-b lg:border-b-0 border-[var(--primary-dark)] ${isActive("/contact")
                        ? "text-[var(--accent-color)] font-medium"
                        : "hover:text-[var(--accent-color)]"
                      }`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>

              {/* Mobile Menu Footer */}
              <div className="lg:hidden mt-auto p-6 border-t border-[var(--primary-dark)]">
                {/* Empty footer now */}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Ticket link - removed */}

          {/* User account dropdown */}
          <AccountDropdown />

          {/* Mobile menu button */}
          <button
            onClick={handleClick}
            className="lg:hidden ml-3 hover:text-yellow-500 focus:outline-none"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
