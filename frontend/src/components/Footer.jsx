import React from "react";

const Footer = () => {
  return (
    <footer className="flex justify-center bg-cyan-500 fixed bottom-0 w-full p-4"> {/* Adjusted padding */}
      <div className="text-center text-white">
        <p className="text-sm font-semibold"> {/* Reduced text size */}
          <span className="font-extrabold text-yellow-400">Team Devils</span> | Created by <b>Ganesh Soppin</b>
        </p>
        <p className="text-xs mt-1"> {/* Reduced text size */}
          <span>Contact:</span> <a href="tel:+yourphonenumber" className="hover:text-yellow-400">gswhitedevil@gmail.com</a>
        </p>
        <p className="text-xxl mt-1"> {/* Reduced text size */}
          &copy; {new Date().getFullYear()} Code Devils. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
