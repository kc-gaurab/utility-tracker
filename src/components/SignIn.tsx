import { useState } from 'react';
import { signInWithGoogle } from '../firebase/authService';

export function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed:', err);
      setError('Sign-in failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-surface border border-line p-8 sm:p-10 max-w-md w-full text-center">
        <h1 className="font-serif font-medium text-2xl sm:text-[28px] tracking-tight text-ink">
          Päivölänrinne 5 — Utility Tracker
        </h1>
        <div className="text-[11px] sm:text-[13px] text-ink-mute mt-2 font-mono tracking-wider uppercase">
          House A & House B · water, heating & settlement
        </div>
        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="mt-8 w-full px-5 py-3 bg-ink text-bg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {signingIn ? 'Signing in…' : 'Sign in with Google'}
        </button>
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        <div className="mt-6 text-xs text-ink-mute">
          Access is limited to household members.
        </div>
      </div>
    </div>
  );
}
