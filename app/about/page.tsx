'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="bg-white text-black">
      <motion.section 
        className="py-40 text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Our Story
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          The OrderFlow team is dedicated to empowering restaurants and food businesses.
        </motion.p>
      </motion.section>

      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">From Our Family to Yours</h2>
              <p className="text-gray-600 mb-4">
                Founded by experienced restaurateurs, OrderFlow was born from a simple idea: to create a powerful, affordable ordering platform that puts business owners first. We understand the challenges of the food service industry because we've lived them.
              </p>
              <p className="text-gray-600">
                Our mission is to provide you with the tools to thrive in a competitive market, offering transparent pricing and robust features that empower you to connect directly with your customers.
              </p>
            </div>
            <div>
              <motion.div 
                className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* You can place an image here */}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Authenticity</h3>
              <p className="text-gray-600">True to our roots, we cook with traditional methods and authentic spices.</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Quality</h3>
              <p className="text-gray-600">We source the best ingredients to ensure every dish is fresh and flavorful.</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Community</h3>
              <p className="text-gray-600">We are proud to be a part of this neighborhood and to serve our friends and neighbors.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
