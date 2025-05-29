import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 shadow-xl">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        {/* Logo Section */}
        <div className="flex items-center">
          <img
            src="/code_devils.jpg"
            alt="Logo"
            className="h-32 w-32 rounded-full border-4 border-white shadow-2xl object-cover"
          />
          <Link
            to="/"
            className="text-white font-extrabold text-3xl ml-4 hover:text-yellow-400 hover:underline hover:underline-offset-8"
          >
            WhiteDevil-GS
          </Link>
        </div>

        {/* Navigation Links and Social Media Icons */}
        <div className="flex space-x-8">
          {/* GitHub Link */}
          <a
            href="https://github.com/WhiteDevil-GS" // Replace with your GitHub URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold text-xl hover:text-yellow-400 transition duration-300"
          >
            GitHub
          </a>

          {/* LinkedIn Link */}
          <a
            href="https://www.linkedin.com/in/ganesh-g-soppin-gs-497910256" // Replace with your LinkedIn URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold text-xl hover:text-yellow-400 transition duration-300"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
