"use client";

import Image, { StaticImageData } from 'next/image';
import { inter } from './fonts';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowTopRightOnSquareIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useTranslations } from "next-intl"; // Add this import

interface ResourceProps {
  title: string;
  description: string;
  pathToImage: StaticImageData;
  link: string;
}

export default function Resource({ title, description, pathToImage, link }: ResourceProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const t = useTranslations("resource"); // Use "resource" namespace

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
    <motion.div 
      className="bg-gradient-to-r from-orange-600/10 to-red-600/10 border-2 border-orange-600/75 flex flex-row items-center justify-center gap-8 w-full h-36 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        borderColor: "rgba(234, 88, 12, 0.9)",
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className="flex-shrink-0 w-[120px] h-[120px] flex items-center justify-center p-4 overflow-hidden"
        whileHover={{ 
          scale: 1.05, 
          rotate: 3,
          transition: { duration: 0.3, type: "spring", stiffness: 200, damping: 15 }
        }}
      >
        <Image 
          src={pathToImage}
          alt={`Logo of ${title}`}
          className="rounded-lg shadow-sm object-contain max-w-full max-h-full"
          width={80}
          height={80}
          placeholder="blur"
        />
      </motion.div>
      
      <div className="flex flex-col justify-center h-24 w-5/6 space-y-2">
        <motion.a 
          href={link} 
          onClick={handleLinkClick}
          className="text-xl font-extrabold text-black hover:text-orange-600 transition-all duration-200 flex items-center gap-2 group-hover:gap-3 cursor-pointer"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          <span>{title}</span>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5 text-orange-600" />
          </motion.div>
        </motion.a>
        
        <motion.p 
          className={`${inter.className} antialiased text-gray-700 text-sm leading-relaxed`}
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {description}
        </motion.p>
      </div>
      
      {/* Hover effect overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.div>

    {/* Confirmation Modal */}
    <AnimatePresence>
      {showConfirmModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">{t("externalLink")}</h3>
            </div>
            <p className="text-gray-600 mb-2">
              {t("aboutToVisit")}
            </p>
            <p className="text-sm font-semibold text-orange-600 mb-4 break-all">
              {link}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t("newTabConfirm")}
            </p>
            <div className="flex justify-end gap-3">
              <motion.button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("cancel")}
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("continue")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}