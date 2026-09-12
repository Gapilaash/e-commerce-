import { SignIn } from '@clerk/clerk-react';

// Clerk handles everything:
// - Email + password login & signup
// - Google sign-in (enable in Clerk dashboard → Social connections → Google)
// - Forgot password, email verification, etc.
// No Google Cloud Console setup needed!

export default function Login() {
  return (
    <div className="flex justify-center items-start py-12 px-4">
      <SignIn
        routing="path"
        path="/login"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        appearance={{
          elements: {
            card: 'shadow-none border border-line rounded-xl',
            headerTitle: 'font-display text-2xl',
            formButtonPrimary: 'btn-primary w-full',
          }
        }}
      />
    </div>
  );
}
