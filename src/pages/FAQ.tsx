import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqData = [
  {
    category: "Shipping",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Standard orders undergo a 1-3 business days packaging process and arrive in 3-7 business days Worldwide. Express shipping (1-2 days) is available at checkout for an extra ₹50."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship Worldwide. International delivery takes 3-7 business days via express air carriage, and customs/duty fees (if any) are the buyer's responsibility unless stated otherwise."
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping is complimentary on orders over ₹200. Orders below that threshold are charged a flat rate of ₹15 for standard delivery."
      },
      {
        q: "How can I track my order?",
        a: "You'll receive a tracking link and manifest number by email/SMS within 24 hours of your order shipping. You can also track it anytime from \"My Orders\" in your account."
      },
      {
        q: "What happens if my package is lost or damaged in transit?",
        a: "Contact us at aurora.web011@gmail.com within 48 hours of delivery (or expected delivery) with your order number and photos if damaged — we'll send a replacement or full refund."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for unworn, unwashed items with original tags and side buckles attached. Refunds are processed to your original payment method or as store credit within 5-7 business days of us receiving the item."
      },
      {
        q: "Do you offer free returns?",
        a: "Yes, first return is free. You can start a return from \"My Orders\" in your account."
      },
      {
        q: "Can I exchange an item for a different size?",
        a: "Yes, exchanges are free within 7 days, subject to stock availability. Submit an exchange request in your account portal."
      },
      {
        q: "What items are non-returnable?",
        a: "Innerwear, swimwear, and sale items marked \"Final Sale\" cannot be returned for hygiene/pricing reasons."
      },
      {
        q: "How long does a refund take to process?",
        a: "Once we receive your returned item, refunds are processed within 5-7 business days and may take an additional 3-5 days to reflect depending on your bank."
      }
    ]
  },
  {
    category: "Sizing & Fit",
    questions: [
      {
        q: "How do I find my size?",
        a: "Use our size chart on every product page — enter your bust/chest, waist, and hip measurements in cm/inches to find your best match."
      },
      {
        q: "Does this brand run true to size, small, or large?",
        a: "Our styles run true to size with a relaxed fit. Fit notes are also listed on each individual product page."
      },
      {
        q: "What if I'm between two sizes?",
        a: "We recommend sizing up for a relaxed fit or down for a fitted look. Check the \"Model is wearing size M, height 5'10\"\" note on the product page for reference."
      },
      {
        q: "Do you offer plus sizes / petite / tall fits?",
        a: "Yes, we carry sizes S-XL across most collections. Filter by size on the category page to see availability."
      },
      {
        q: "How do I measure myself at home for the right size?",
        a: "Use a soft measuring tape: bust — around the fullest part of your chest; waist — around your natural waistline; hips — around the widest part. Compare to our size chart in cm/in."
      }
    ]
  },
  {
    category: "Product, Material & Care",
    questions: [
      {
        q: "What fabric/material is this made of?",
        a: "Each product page lists exact fabric composition. We prioritize breathable, sustainable, pre-shrunk fabrics across our collections."
      },
      {
        q: "How do I wash and care for this item?",
        a: "Cold hand wash only with pH-neutral silhouette fluid washes. Lay flat to air-dry under high archive shadow. Do not machine tumble dry or inflict raw flat iron heavy surface static. Full care instructions are on the garment label and product page."
      },
      {
        q: "Will the colors fade or the fabric shrink after washing?",
        a: "Our fabrics are pre-shrunk and colorfast-tested, but we still recommend cold hand wash and low heat to preserve color and fit long-term."
      },
      {
        q: "Are your clothes true-to-photo in color?",
        a: "We photograph all products in natural daylight for accuracy, but screen settings can cause slight variation. Check the listed hex/color name for the closest match."
      }
    ]
  },
  {
    category: "Ordering, Payment & Account",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept credit/debit cards, UPI, net banking, and Cash on Delivery. All payments are encrypted and processed securely via Razorpay."
      },
      {
        q: "Can I cancel or modify my order after placing it?",
        a: "You can cancel or edit your order within 1 hour of placing it from \"My Orders.\" After that, it enters processing and can't be changed."
      },
      {
        q: "Is Cash on Delivery (COD) available?",
        a: "Yes, COD is available on orders under ₹500 in select regions, with a ₹20 COD handling fee."
      },
      {
        q: "Do I need an account to place an order?",
        a: "No, guest checkout is available. Creating an account lets you track orders, save addresses, and access faster checkout next time."
      },
      {
        q: "Is my payment and personal information secure?",
        a: "Yes. All transactions are SSL-encrypted and we never store your full card details. See our Privacy Policy for details."
      }
    ]
  },
  {
    category: "Trust, Sustainability & Brand",
    questions: [
      {
        q: "Where are your clothes made?",
        a: "Our garments are manufactured Worldwide, and we work with audited factories that meet fair labor and sustainability standards."
      },
      {
        q: "Are your products sustainable or ethically made?",
        a: "We use ethically sourced materials and small-batch production to minimize waste and ensure high-quality craftsmanship."
      },
      {
        q: "How do I contact customer support?",
        a: "Reach us via aurora.web011@gmail.com, live chat, or WhatsApp at +1 234 567 8900. Average response time is under 24 hours."
      },
      {
        q: "Do you have a physical store I can visit?",
        a: "We are an online-only studio, but offer free/easy exchanges so you can shop with confidence."
      }
    ]
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.flatMap(category => 
      category.questions.map(q => ({
        "@type": "Question",
        "name": q.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.a
        }
      }))
    )
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DRIPEON",
    "url": "https://dripeon.com",
    "logo": "https://dripeon.com/logo.png",
    "sameAs": [
      "https://www.instagram.com/dripeon_?igsh=ZHVqenU1MnpscXRi",
      "https://youtube.com/@DRIPEON",
      "https://www.facebook.com/share/1C5TEGrk8j/?mibextid=wwXIfr"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "aurora.web011@gmail.com",
      "contactType": "customer support"
    }
  };

  return (
    <div className="flex-grow pt-32 pb-24 font-sans px-6 max-w-4xl mx-auto min-h-screen text-left space-y-12 animate-fade-in">
      {/* Inject JSON-LD Script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      {/* Header */}
      <div className="border-b border-gray-200 pb-5 space-y-2 select-none">
        <span className="text-xs font-medium text-red-600 uppercase tracking-widest">DRIPEON Support</span>
        <h1 className="font-sans text-3xl uppercase tracking-wider text-gray-900">Frequently Asked Questions</h1>
        <p className="text-xs text-gray-500 uppercase">Find answers to common questions about our products, shipping, and policies.</p>
      </div>

      <div className="space-y-10">
        {faqData.map((category, cIdx) => (
          <div key={cIdx} className="space-y-4">
            <h2 className="font-sans text-lg text-gray-900 uppercase font-bold tracking-widest flex items-center gap-2 border-b border-gray-200/40 pb-2">
              <MessageCircle className="w-5 h-5 text-red-600" /> {category.category}
            </h2>
            <div className="space-y-3">
              {category.questions.map((q, qIdx) => {
                const uniqueId = `${cIdx}-${qIdx}`;
                const isOpen = openIndex === uniqueId;
                
                return (
                  <div key={qIdx} className="border border-gray-200/40 rounded-sm bg-white overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggleAccordion(uniqueId)}
                      className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <h3 className="text-xs uppercase tracking-wider font-bold text-gray-900 pr-4">
                        {q.q}
                      </h3>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-red-600' : ''}`} 
                      />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="p-4 pt-0 text-xs text-gray-500 uppercase tracking-wide leading-relaxed font-light border-t border-gray-100">
                        {q.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer support contact CTA */}
      <div className="mt-12 bg-gray-50 border border-gray-200/60 p-6 text-center rounded-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Still have questions?</h4>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Our concierge team is available to assist you.</p>
        <button 
          onClick={() => navigate('/contact')}
          className="inline-block border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2.5 text-xs uppercase font-bold tracking-widest transition-colors cursor-pointer"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}
