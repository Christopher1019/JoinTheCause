"use client";

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/navbar';
import Faqitem from '../components/faqitem';
import '../globals.css';

const faqs = [
  {
    question: 'What is JoinTheCause?',
    answer:
      'JoinTheCause is a platform that connects people with volunteer opportunities and community initiatives.',
  },
  {
    question: 'Who should use JoinTheCause?',
    answer:
      'Anyone looking to contribute to their community, whether as a volunteer, organizer, or supporter.',
  },
  {
    question: 'Is JoinTheCause free?',
    answer:
      'Yes! It is completely free to use for both individuals and organizations.',
  },
  {
    question: 'How do I create an account?',
    answer:
      "You can sign up by clicking the 'Find Opportunities' button on the homepage.",
  },
];

export default function Index() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen w-full bg-gray-100">
    <Navbar />
    <div className="max-w-6xl mx-auto mt-10 bg-white shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: FAQ List */}
        <div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">FAQs</h2>
          <div>
            {faqs.map((faq, index) => (
              <Faqitem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                toggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
  
        {/* Right Column: Static FAQ Picture */}
        <div className="flex items-end justify-center">
          <div className="relative w-full h-[400px]"> {/* Fixed height */}
            <Image
              src="/FAQPic.png"
              alt="FAQ illustration"
              fill
              className="object-contain"
            />
          </div>
        </div>
  
      </div>
    </div>
  </div>
  );
}
