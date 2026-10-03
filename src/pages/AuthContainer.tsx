import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowRight, ArrowLeft, Crown, Award } from 'lucide-react';

interface AuthContainerProps {
  initialMode: 'login' | 'signup';
}

const customAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#ffffff',
    colorBackground: 'rgba(0, 0, 0, 0.4)', // Slightly darkened background for legibility
    colorText: '#ffffff',
    colorInputBackground: 'rgba(255, 255, 255, 0.05)',
    colorInputText: '#ffffff',
    colorDanger: '#ef4444',
    borderRadius: '4px',
  },
  elements: {
    cardBox: 'bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/20 rounded-2xl',
    card: 'bg-transparent border-none shadow-none w-full p-8 m-0',
    headerTitle: 'text-2xl sm:text-3xl font-podium tracking-widest text-white uppercase text-center',
    headerSubtitle: 'text-white/60 font-inter font-light text-xs text-center uppercase tracking-wider',
    formButtonPrimary: 'bg-white hover:bg-gray-200 text-black font-inter font-semibold uppercase tracking-widest transition-all duration-300 rounded-sm mt-4',
    socialButtonsBlockButton: 'border border-white/20 bg-transparent hover:bg-white/10 text-white font-inter transition-all rounded-sm backdrop-blur-sm',
    footer: { display: 'none' },
    footerAction: { display: 'none' },
    dividerLine: 'bg-white/20',
    dividerText: 'text-white/50 font-inter uppercase tracking-widest text-[10px]',
    formFieldLabel: 'text-white/70 font-inter uppercase tracking-widest text-[10px]',
    formFieldInput: 'border border-white/20 focus:ring-1 focus:ring-white bg-transparent px-3 py-2 transition-colors rounded-sm shadow-none font-inter text-sm',
  }
};

export default function AuthContainer({ initialMode }: AuthContainerProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (user) {
      const role = user.publicMetadata?.role as string;
      const email = user.primaryEmailAddress?.emailAddress || '';
      const adminEmails = [
        'storedripeon@gmail.com',
        'aurora.web011@gmail.com',
        'admin@dripeon.com',
        'dripeon@gmail.com',
        'yraj15927@gmail.com',
        'btech60045.24@bitmesra.ac.in'
      ];
      const isAdmin = role === 'ADMIN' || adminEmails.includes(email.toLowerCase());
      
      const defaultRedirect = isAdmin ? '/admin/dashboard' : '/account';
      const protectedRoutes = ['/checkout', '/account', '/orders'];
      const fromPath = (location.state as any)?.from?.pathname || '';
      const isProtectedFrom = protectedRoutes.some(r => fromPath.startsWith(r));
      let from = isProtectedFrom ? fromPath : defaultRedirect;
      if (isAdmin) {
        from = '/admin/dashboard';
      }
      navigate(from);
    }
  }, [user, navigate, location]);

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const direction = mode === 'login' ? -1 : 1;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-white/20 flex">
      {/* Back to Home Button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 lg:top-8 lg:left-12 z-50 flex items-center gap-2 text-white hover:text-red-500 transition-colors uppercase tracking-widest text-[10px] font-bold font-inter group bg-black/30 p-3 rounded-md backdrop-blur-md border border-white/10 hover:border-red-500/50"
      >
        <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Return to Home</span>
      </Link>
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1920')` }}
      />

      {/* Auth Forms (Left Side / Full on Mobile) */}
      <div className="relative z-10 w-full lg:w-1/2 h-full flex flex-col items-center justify-center px-6 lg:items-start lg:pl-16 xl:pl-24">

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {mode === 'login' && (
            <motion.div
              key="login"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full max-w-[400px]"
            >
              <div className="relative">
                <div className={`transition-all duration-300 ${!agreedToPolicies ? 'opacity-40 pointer-events-none blur-[1px]' : ''}`}>
                  <SignIn signUpUrl="/signup" appearance={customAppearance} />
                </div>
                {!agreedToPolicies && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-[85%] text-center bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-2xl">
                    <p className="text-xs text-white font-inter font-medium tracking-wide leading-relaxed uppercase">
                      Please agree to our Privacy Policy & DPDP Act below to continue.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="policy-agree-login"
                  checked={agreedToPolicies}
                  onChange={(e) => setAgreedToPolicies(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/30 bg-black/50 text-red-600 focus:ring-red-600 focus:ring-offset-black cursor-pointer"
                />
                <label htmlFor="policy-agree-login" className="text-[10px] text-gray-300 font-inter leading-relaxed uppercase tracking-wider cursor-pointer select-none">
                  I agree to the <a href="/privacy" className="text-white font-bold hover:text-red-500 underline transition-colors">Privacy Policy</a> and consent to data processing under the <a href="/privacy" className="text-white font-bold hover:text-red-500 underline transition-colors">DPDP Act</a>.
                </label>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/signup');
                  }}
                  className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors uppercase tracking-widest text-xs font-bold font-inter group bg-white/10 backdrop-blur-xl px-6 py-3 rounded border border-white/20 hover:border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                >
                  <span>No Account? Sign Up</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'signup' && (
            <motion.div
              key="signup"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full max-w-[400px]"
            >
              <div className="relative">
                <div className={`transition-all duration-300 ${!agreedToPolicies ? 'opacity-40 pointer-events-none blur-[1px]' : ''}`}>
                  <SignUp signInUrl="/login" appearance={customAppearance} />
                </div>
                {!agreedToPolicies && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-[85%] text-center bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-2xl">
                    <p className="text-xs text-white font-inter font-medium tracking-wide leading-relaxed uppercase">
                      Please agree to our Privacy Policy & DPDP Act below to continue.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="policy-agree-signup"
                  checked={agreedToPolicies}
                  onChange={(e) => setAgreedToPolicies(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/30 bg-black/50 text-red-600 focus:ring-red-600 focus:ring-offset-black cursor-pointer"
                />
                <label htmlFor="policy-agree-signup" className="text-[10px] text-gray-300 font-inter leading-relaxed uppercase tracking-wider cursor-pointer select-none">
                  I agree to the <a href="/privacy" className="text-white font-bold hover:text-red-500 underline transition-colors">Privacy Policy</a> and consent to data processing under the <a href="/privacy" className="text-white font-bold hover:text-red-500 underline transition-colors">DPDP Act</a>.
                </label>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                  className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors uppercase tracking-widest text-xs font-bold font-inter group bg-white/10 backdrop-blur-xl px-6 py-3 rounded border border-white/20 hover:border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                >
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Login</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
