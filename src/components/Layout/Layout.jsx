import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer'; // <--- Uncomment this

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer /> {/* <--- Uncomment this */}
    </div>
  );
}