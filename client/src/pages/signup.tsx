import { SignUpForm } from "../components/SignUpForm";
import { Link } from "wouter";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <a className="inline-block">
              <h1 className="text-3xl font-bold gradient-text">Meta Engineering</h1>
            </a>
          </Link>
          <p className="text-muted-foreground mt-2">
            Create your account to get started
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
} 