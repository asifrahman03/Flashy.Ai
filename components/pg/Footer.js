// components/pg/Footer.js

import React from 'react';

const Footer = () => (
  <footer className="bg-gray-800 text-white py-4 mt-auto">
    <div className="container mx-auto text-center">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Flashy.AI All rights reserved.
      </p>
      {/* You can add more footer content or links here */}
    </div>
  </footer>
);

export default Footer;
