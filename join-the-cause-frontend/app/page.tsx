"use client";

import { useEffect } from "react";
import Navbar from "./components/navbar.js";
import './globals.css';

export default function Index() {
  useEffect(() => {
    // Ensure localStorage is accessible only in the browser
    if (typeof window === "undefined") return;
  }, []);

  const handleFindOpportunities = () => {
    const email = localStorage.getItem("userEmail");
    window.location.href = email ? "/explore" : "/register";
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 text-gray-800 font-sans">
        <section className="bg-cover bg-center h-[50vh] bg-gray-100 text-gray-800 flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Make a difference in your community</h1>
          <p className="text-lg md:text-xl max-w-3xl mb-8">
            JoinTheCause.org connects you to local events, volunteer opportunities, and resources to help you get involved and make a positive impact.
          </p>
          <button
            onClick={handleFindOpportunities}
            className="bg-[#3498db] hover:bg-[#2980b9] text-white py-3 px-6 rounded text-lg transition-colors duration-300"
          >
            Find Opportunities
          </button>
        </section>

        <section className="py-16 px-8 flex flex-wrap justify-around max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg shadow-md text-center p-8 m-4 flex-1 min-w-[300px]">
            <div className="bg-[#3498db] w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-6">🤝</div>
            <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Volunteer</h3>
            <p>Discover meaningful volunteer opportunities in your area that match your skills, interests, and availability.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md text-center p-8 m-4 flex-1 min-w-[300px]">
            <div className="bg-[#3498db] w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-6">📅</div>
            <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Local Events</h3>
            <p>Stay informed about community events, workshops, and gatherings happening near you.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md text-center p-8 m-4 flex-1 min-w-[300px]">
            <div className="bg-[#3498db] w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-6">💼</div>
            <h3 className="text-xl font-semibold text-[#2c3e50] mb-4">Resources</h3>
            <p>Access community resources, guides, and information to help you make a difference.</p>
          </div>
        </section>

        <section className="py-16 px-8 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2c3e50] mb-6">Stay Connected</h2>
          <p className="text-gray-600 mb-8">Sign up for our newsletter to receive updates about community events, volunteer opportunities, and resources.</p>
          <form className="flex flex-col sm:flex-row max-w-xl mx-auto">
            <input type="email" placeholder="Your email address" className="flex-1 py-3 px-4 border border-gray-300 rounded-l sm:rounded-none sm:rounded-l-md text-base mb-4 sm:mb-0" />
            <button type="submit" className="bg-[#3498db] hover:bg-[#2980b9] text-white py-3 px-6 rounded sm:rounded-none sm:rounded-r-md transition-colors duration-300">Subscribe</button>
          </form>
        </section>

        <footer className="bg-[#2c3e50] text-white py-12 px-8 text-center">
          <div className="max-w-screen-xl mx-auto flex flex-wrap justify-between">
            <div className="flex-1 min-w-[250px] text-left mb-8 px-4">
              <h3 className="text-[#3498db] mb-6 text-lg font-semibold">About Us</h3>
              <p>JoinTheCause.org is dedicated to connecting community members with local events, volunteer opportunities, and resources to foster civic engagement.</p>
            </div>
            <div className="flex-1 min-w-[250px] text-left mb-8 px-4">
              <h3 className="text-[#3498db] mb-6 text-lg font-semibold">Quick Links</h3>
              <ul className="list-none">
                <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Home</a></li>
                <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Events</a></li>
                <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Volunteer</a></li>
                <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Resources</a></li>
                <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">About</a></li>
              </ul>
            </div>
            <div className="flex-1 min-w-[250px] text-left mb-8 px-4">
              <h3 className="text-[#3498db] mb-6 text-lg font-semibold">Contact</h3>
              <ul className="list-none">
                <li className="mb-2">Email: info@jointhecause.org</li>
                <li className="mb-2">Phone: (555) 123-4567</li>
                <li>Address: 123 Community Ave, Town</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#34495e] text-gray-400">
            <p>&copy; 2025 JoinTheCause.org. All rights reserved.</p>
          </div>
        </footer>
      </main>
      </>
    );
  }