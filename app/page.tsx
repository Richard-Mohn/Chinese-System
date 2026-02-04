'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const menuItems = [
  { name: "General Tso's Chicken", price: "$12.99", image: "/ChineseMenu1.webp" },
  { name: "Sweet & Sour Pork", price: "$11.99", image: "/ChineseMenu2.webp" },
  { name: "Beef with Broccoli", price: "$13.99", image: "/ChineseMenu1.webp" },
  { name: "Kung Pao Chicken", price: "$12.99", image: "/ChineseMenu2.webp" },
  { name: "Hot & Sour Soup", price: "$5.99", image: "/ChineseMenu1.webp" },
  { name: "Egg Rolls", price: "$4.99", image: "/ChineseMenu2.webp" },
];

export default function Home() {
  return (
    <div className="bg-white text-black">
      {/* Hero Section */}
      <motion.section 
        className="min-h-screen flex items-center justify-center text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div>
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            OrderFlow
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Mobile Ordering Platform for Restaurants.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="/#menu">
              <span className="px-8 py-3 bg-black text-white rounded-full font-medium">
                View Menu
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Menu Section */}
      <section id="menu" className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Our Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Image src={item.image} alt={item.name} width={400} height={300} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-primary mt-2">{item.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">About Us</h2>
          <p className="max-w-3xl mx-auto text-gray-600">
            The Golden Dragon has been serving authentic Chinese food to our community for over 20 years. We use only the freshest ingredients and traditional recipes to bring you a dining experience you won't forget.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Contact Us</h2>
          <p className="text-lg text-gray-600 mb-8">
            Order by phone: (555) 123-4567
          </p>
          <Link href="/#">
            <span className="px-8 py-3 bg-black text-white rounded-full font-medium">
              Get Directions
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
