import React from 'react';
import Navbar from '../../src/components/layout/Navbar';
import Footer from '../../src/components/layout/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-navy-deep">
        {children}
      </main>
      <Footer />
    </div>
  );
}
