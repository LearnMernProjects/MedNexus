import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-(--background)">
      <div className="w-full max-w-md">
        <SignIn redirectUrl="/dashboard" />
      </div>
    </div>
  );
}
