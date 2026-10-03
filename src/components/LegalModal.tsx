import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | null;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state when opened
      setHasScrolledToBottom(false);
      setIsChecked(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      setHasScrolledToBottom(true);
    }
  };

  if (!isOpen || !type) return null;

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12 font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h2 className="text-[22px] font-medium text-gray-900 tracking-tight">{title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div 
            className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide bg-white"
            onScroll={handleScroll}
          >
            <div className="prose prose-sm md:prose-base max-w-none prose-p:text-gray-600 prose-headings:text-gray-900 prose-headings:font-medium prose-a:text-red-600 prose-strong:text-gray-900 leading-relaxed">
              
              {type === 'terms' ? (
                <>
                  <p className="text-gray-500 text-sm mb-6">Last Updated: {new Date().toLocaleDateString()}</p>
                  
                  <h3 className="text-lg">1. Acceptance of Terms</h3>
                  <p>By accessing, browsing, or using the DRIPEON website ("Site") and our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Site or purchase our exclusive drops.</p>

                  <h3 className="text-lg">2. Digital Personal Data Protection (DPDP) Act Compliance</h3>
                  <p>In accordance with the Digital Personal Data Protection Act, 2023, DRIPEON ensures the fair, transparent, and secure processing of your personal data. By creating an account and participating in our drops, you provide explicit consent for the collection and processing of data strictly necessary for order fulfillment, fraud prevention, and personalized luxury experiences. You retain the right to withdraw this consent and request data deletion at any time by contacting our privacy officer.</p>

                  <h3 className="text-lg">3. Product Availability & Drops</h3>
                  <p>All items on DRIPEON are subject to extreme scarcity. Placement of an item in a cart does not reserve the item. A transaction is only confirmed once payment is processed and an Order Confirmation is issued. We reserve the right to cancel any orders suspected of bot activity, reselling, or fraud.</p>

                  <h3 className="text-lg">4. Intellectual Property</h3>
                  <p>All content included on the Site, such as text, graphics, logos, images, audio clips, digital downloads, and software, is the property of DRIPEON or its content suppliers and protected by international copyright and trademark laws. The unauthorized reproduction, modification, or distribution of any content is strictly prohibited.</p>

                  <h3 className="text-lg">5. Limitation of Liability</h3>
                  <p>DRIPEON shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or products, including but not limited to reliance by a user on any information obtained from the Site.</p>

                  <h3 className="text-lg">6. Governing Law</h3>
                  <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-sm mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

                  <h3 className="text-lg">1. Information We Collect</h3>
                  <p>DRIPEON strictly adheres to data minimization principles. We collect only the information necessary to provide our premium services. This includes:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Identity Data:</strong> First name, last name, and username.</li>
                    <li><strong>Contact Data:</strong> Email address, billing address, delivery address, and telephone numbers.</li>
                    <li><strong>Financial Data:</strong> Encrypted payment card details (processed securely via Stripe/Razorpay; we do not store full card numbers).</li>
                    <li><strong>Transaction Data:</strong> Details about payments and luxury items you have purchased from us.</li>
                  </ul>

                  <h3 className="text-lg">2. DPDP Act & Your Data Rights</h3>
                  <p>Under the Digital Personal Data Protection (DPDP) Act, 2023, you have the following rights concerning your personal data:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Right to Information:</strong> You can request a summary of the personal data we process.</li>
                    <li><strong>Right to Correction & Erasure:</strong> You can update inaccurate data or request the deletion of your account and associated data.</li>
                    <li><strong>Right to Nominate:</strong> You may nominate another individual to exercise these rights in the event of death or incapacity.</li>
                    <li><strong>Right to Grievance Redressal:</strong> You may raise complaints regarding your data processing directly with our Data Protection Officer.</li>
                  </ul>

                  <h3 className="text-lg">3. How We Use Your Data</h3>
                  <p>Your data is exclusively used for:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Processing and fulfilling your archive orders.</li>
                    <li>Managing your collector account and authenticating logins securely.</li>
                    <li>Notifying you about highly restricted upcoming drops (only if you have opted in).</li>
                    <li>Preventing fraudulent transactions to protect the integrity of our releases.</li>
                  </ul>

                  <h3 className="text-lg">4. Data Security</h3>
                  <p>We have implemented state-of-the-art security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. Access to your personal data is limited to those employees, agents, and contractors who have a strict business need to know.</p>

                  <h3 className="text-lg">5. Contacting the Data Protection Officer</h3>
                  <p>If you have any questions about this Privacy Policy or wish to exercise your legal rights under the DPDP Act, please contact our Data Protection Officer at: <a href="mailto:privacy@dripeon.com">privacy@dripeon.com</a>.</p>
                </>
              )}
              
            </div>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
