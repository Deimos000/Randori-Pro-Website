import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useText } from '../../context/LanguageContext';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, Globe, ArrowRight } from 'lucide-react';
import './Navbar.css';
import heroLogo from '../../assets/randori-logo.png';

export default function Navbar() {
  const { content, toggleLanguage, lang } = useText();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  // --- SCROLL LOGIC ---
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    // Hide navbar if scrolling down more than 150px
    if (latest > previous && latest > 150 && !isOpen) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    // Change background style after 50px
    setIsScrolled(latest > 50);
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // --- ANIMATION VARIANTS ---
  const menuVariants = {
    closed: {
      clipPath: "circle(0px at calc(100% - 40px) 40px)",
      transition: { type: "spring", stiffness: 400, damping: 40, delay: 0.1 }
    },
    open: {
      clipPath: "circle(150% at calc(100% - 40px) 40px)",
      transition: { type: "spring", stiffness: 20, restDelta: 2 }
    }
  };

  const linkWrapperVariants = {
    open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  };

  const linkItemVariants = {
    open: { y: 0, opacity: 1, transition: { y: { stiffness: 1000, velocity: -100 } } },
    closed: { y: 50, opacity: 0, transition: { y: { stiffness: 1000 } } }
  };

  return (
    <>
      {/* --- TOP NAVBAR --- */}
      <motion.nav
        className={`navbar ${location.pathname === '/contact' ? 'contact-mode' : (isScrolled ? 'scrolled' : 'transparent')}`}
        animate={isHidden ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <div className="navbar-container">

          {/* LOGO IMAGE REPLACEMENT */}
          <Link to="/" className="logo-link" onClick={() => setIsOpen(false)}>
            <img
              src={heroLogo}
              alt="Berlin Sports Logo"
              className="logo-img"
            />
          </Link>

          {/* DESKTOP MENU */}
          <div className="desktop-links">
            <DesktopLink to="/" text={content.nav.home} activePath={location.pathname} />
            <DesktopLink to="/trial-booking" text={content.nav.trial} activePath={location.pathname} />
            <DesktopLink to="/sports-overview" text={content.nav.sports} activePath={location.pathname} />
            <DesktopLink to="/about" text={content.nav.about} activePath={location.pathname} />
            <DesktopLink to="/contact" text={content.nav.contact} activePath={location.pathname} />

            <motion.button
              onClick={toggleLanguage}
              className="lang-btn-desktop"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe size={16} />
              <span>{lang.toUpperCase()}</span>
            </motion.button>
          </div>

          {/* MOBILE TOGGLE (HAMBURGER) - Only visible on mobile via CSS */}
          <div className="mobile-toggle-wrapper">
            <motion.button
              className="mobile-toggle open-btn"
              onClick={() => setIsOpen(true)}
              aria-label="Open Menu"
              whileTap={{ scale: 0.9 }}
            >
              <Menu size={32} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* --- MOBILE FULLSCREEN MENU --- */}
      <motion.div
        className="mobile-menu-bg"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={menuVariants}
      >
        {/* CLOSE BUTTON */}
        <motion.button
          className="mobile-toggle close-btn"
          onClick={() => setIsOpen(false)}
          whileTap={{ scale: 0.9 }}
          aria-label="Close Menu"
        >
          <X size={32} />
        </motion.button>

        <div className="mobile-menu-content">
          <motion.div className="mobile-links-list" variants={linkWrapperVariants}>
            <MobileLink to="/" text={content.nav.home} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />
            <MobileLink to="/trial-booking" text={content.nav.trial} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />
            <MobileLink to="/sports-overview" text={content.nav.sports} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />
            <MobileLink to="/about" text={content.nav.about} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />
            <MobileLink to="/contact" text={content.nav.contact} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />

            <motion.div variants={linkItemVariants} className="mobile-divider" />

            <motion.div variants={linkItemVariants}>
              <motion.button onClick={toggleLanguage} className="mobile-lang-btn">
                <Globe size={24} />
                <span>{content.nav.switchLang}</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

// --- DESKTOP LINK COMPONENT ---
function DesktopLink({ to, text, activePath }) {
  const isActive = activePath === to;

  return (
    <Link to={to} className="nav-link-wrapper">
      <motion.span
        className={`nav-link ${isActive ? 'active-text' : ''}`}
        animate={{ opacity: isActive ? 1 : 0.8 }}
        whileHover={!isActive ? { y: -2, opacity: 1 } : {}}
      >
        {text}
      </motion.span>

      {/* Sliding Underline */}
      {isActive && (
        <motion.div
          className="active-indicator"
          layoutId="underline"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </Link>
  );
}

// --- MOBILE LINK COMPONENT ---
function MobileLink({ to, text, setIsOpen, currentPath, variants }) {
  const isActive = currentPath === to;
  return (
    <motion.div variants={variants}>
      <Link
        to={to}
        onClick={() => setIsOpen(false)}
        className={`mobile-link-item ${isActive ? 'active' : ''}`}
      >
        <span className="link-text">{text}</span>
        <ArrowRight className="link-arrow" size={24} />
      </Link>
    </motion.div>
  );
}