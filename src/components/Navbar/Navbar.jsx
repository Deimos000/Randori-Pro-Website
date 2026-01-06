import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useText } from '../../context/LanguageContext';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, Globe, ArrowRight } from 'lucide-react';
import './Navbar.css';
import heroLogo from '../../assets/randori-logo.png';

export default function Navbar() {
  const { getText, toggleLanguage, lang, getImage } = useText();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150 && !isOpen) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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
        className={`navbar ${isScrolled ? 'scrolled' : 'transparent'}`}
        animate={isHidden ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <div className="navbar-container">

          {/* LOGO - A/B testable via getImage */}
          <Link to="/" className="logo-link" onClick={() => setIsOpen(false)}>
            <img
              src={getImage('nav.logo', heroLogo)}
              alt="Berlin Sports Logo"
              className="logo-img"
            />
          </Link>

          {/* DESKTOP MENU - All links A/B testable */}
          <div className="desktop-links">
            <DesktopLink to="/" text={getText('nav.home')} activePath={location.pathname} />
            <DesktopLink to="/trial-booking" text={getText('nav.trial')} activePath={location.pathname} />
            <DesktopLink to="/sports-overview" text={getText('nav.sports')} activePath={location.pathname} />
            <DesktopLink to="/about" text={getText('nav.about')} activePath={location.pathname} />
            <DesktopLink to="/contact" text={getText('nav.contact')} activePath={location.pathname} />

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

          {/* MOBILE TOGGLE */}
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
            <MobileLink to="/" text={getText('nav.home')} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />
            <MobileLink to="/trial-booking" text={getText('nav.trial')} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />
            <MobileLink to="/sports-overview" text={getText('nav.sports')} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />
            <MobileLink to="/about" text={getText('nav.about')} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />
            <MobileLink to="/contact" text={getText('nav.contact')} setIsOpen={setIsOpen} currentPath={location.pathname} variants={linkItemVariants} />

            <motion.div variants={linkItemVariants} className="mobile-divider" />

            <motion.div variants={linkItemVariants}>
              <motion.button onClick={toggleLanguage} className="mobile-lang-btn">
                <Globe size={24} />
                <span>{getText('nav.switchLang')}</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

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