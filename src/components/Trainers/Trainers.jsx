// src/components/Trainers/Trainers.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useText } from '../../context/LanguageContext';
import { motion, useTransform, useScroll } from 'framer-motion';
import './Trainers.css';

// ==========================================
// VITE AUTOMATIC IMAGE LOADER
// ==========================================
const imagesGlob = import.meta.glob('./Images/*.{png,jpg,jpeg,svg,webp}', {
  eager: true,
  as: 'url'
});

const trainersData = Object.keys(imagesGlob).map((filePath, index) => {
  const fileNameWithExt = filePath.split('/').pop();
  const cleanName = fileNameWithExt
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]/g, " ")
    .toUpperCase();

  return {
    id: index,
    name: cleanName,
    img: imagesGlob[filePath]
  };
});

// ==========================================
// COMPONENT
// ==========================================

const Trainers = () => {
  const { content } = useText();
  const targetRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const [scrollRange, setScrollRange] = useState(0);

  // 1. Calculate the exact width of the scrollable content
  useEffect(() => {
    if (cardsContainerRef.current) {
      const calculateWidth = () => {
        const containerWidth = cardsContainerRef.current.scrollWidth;
        const windowWidth = window.innerWidth;
        // The distance we need to move is the overflowing width
        // We add a little buffer (e.g., 5vw) so the last image isn't glued to the edge
        const distance = containerWidth - windowWidth;
        // Ensure we don't scroll if content fits on screen
        setScrollRange(distance > 0 ? distance : 0);
      };

      calculateWidth();
      window.addEventListener('resize', calculateWidth);
      return () => window.removeEventListener('resize', calculateWidth);
    }
  }, [trainersData]);

  // 2. Bind vertical scroll to the horizontal movement
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Map 0-1 vertical scroll to 0 to -scrollRange px horizontal
  const x = useTransform(scrollYProgress, [0, 1], ["1%", `-${scrollRange}px`]);

  return (
    <section ref={targetRef} className="trainers-section">
      <div className="trainers-sticky-wrapper">

        <h2 className="trainers-header">{content.trainers.title}</h2>

        {/* 
           We attach the ref here to measure width.
           We apply the 'x' transform to move it left.
        */}
        <motion.div
          ref={cardsContainerRef}
          style={{ x }}
          className="trainers-cards-container"
        >
          {trainersData.length > 0 ? (
            trainersData.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))
          ) : (
            <p className="no-images-msg">
              Please add images to: <code>src/components/Trainers/images/</code>
            </p>
          )}
        </motion.div>

      </div>
    </section>
  );
};

// Separated Card Component for cleaner animation logic
const TrainerCard = ({ trainer }) => {
  return (
    <motion.div
      className="trainer-card"
      // Animation Logic
      initial={{ scale: 0.8, opacity: 0.5, filter: "blur(5px)" }}
      whileInView={{
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: "easeOut" }
      }}
      viewport={{ amount: 0.6, once: false }} // 0.6 means animation triggers when 60% of card is visible
    >
      <img
        src={trainer.img}
        alt={trainer.name}
      />
      <div className="trainer-overlay">
        <span className="trainer-name">{trainer.name}</span>
      </div>
    </motion.div>
  );
};

export default Trainers;