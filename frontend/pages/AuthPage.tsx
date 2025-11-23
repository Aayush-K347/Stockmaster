import React, { useEffect, useState } from 'react';
import { Layers, ArrowLeft, Mail, Lock, ChevronRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export default function AuthPage({ onLoginSuccess, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signup, resetPassword, isSignedIn } = useAuth();
  useEffect(() => {
    const syncMode = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('sign-up')) setMode('signUp');
      else setMode('signIn');
    };
    syncMode();
    window.addEventListener('hashchange', syncMode);
    return () => window.removeEventListener('hashchange', syncMode);
  }, []);

  useEffect(() => {
    if (isSignedIn) onLoginSuccess();
  }, [isSignedIn, onLoginSuccess]);

  const handleAuth = async (action: 'signin' | 'signup') => {
    setLoading(true);
    setError(null);
    try {
      if (action === 'signin') await login(email, password);
      else await signup(email, password);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError('Enter your email to reset password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetRequested(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Background FX */}
       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

       <div className="w-full max-w-md relative z-10 animate-slide-up">
         {/* Logo */}
         <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 bg-primary rounded-xl rotate-3 flex items-center justify-center shadow-[0_0_20px_rgba(109,40,217,0.5)]">
                  <Layers className="text-white w-6 h-6 -rotate-3" />
               </div>
               <span className="text-2xl font-bold font-display tracking-tight text-white">StockMaster</span>
            </div>
         </div>

         <GlassCard className="p-8 md:p-10 backdrop-blur-2xl border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  {mode === 'signIn' ? 'Welcome Back' : 'Join StockMaster'}
                </div>
                <h2 className="text-2xl font-bold font-display text-white">
                  {mode === 'signIn' ? 'Secure Sign In' : 'Create an Account'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Email + password with Firebase-backed OTP reset.
                </p>
              </div>
              <div className="flex gap-2 bg-white/5 rounded-full p-1 border border-white/10">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    mode === 'signIn' ? 'bg-primary text-white' : 'text-gray-300'
                  }`}
                  onClick={() => setMode('signIn')}
                >
                  Sign In
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    mode === 'signUp' ? 'bg-primary text-white' : 'text-gray-300'
                  }`}
                  onClick={() => setMode('signUp')}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuth(mode === 'signIn' ? 'signin' : 'signup');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-600"
                    placeholder="admin@stockmaster.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-primary hover:text-primaryLight transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              {resetRequested && (
                <p className="text-sm text-green-400 text-center">
                  Check your email for the password reset OTP link.
                </p>
              )}

              <button
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primaryLight text-white rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(109,40,217,0.5)] hover:shadow-[0_0_30px_-5px_rgba(109,40,217,0.7)] hover:-translate-y-0.5 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'signIn' ? (
                  'Sign In'
                ) : (
                  <>
                    Create Account <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              {mode === 'signIn' ? (
                <p className="text-sm text-gray-500">
                  No account?{' '}
                  <button className="text-white hover:text-primary font-medium" onClick={() => setMode('signUp')}>
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Have an account?{' '}
                  <button className="text-white hover:text-primary font-medium" onClick={() => setMode('signIn')}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
         </GlassCard>

         <div className="text-center mt-8">
           <button onClick={onBack} className="text-sm text-gray-500 hover:text-white transition-colors">Back to Home</button>
         </div>
       </div>
    </div>
  );
}
