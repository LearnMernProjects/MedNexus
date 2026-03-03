import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-(--background)">
      <div className="w-full max-w-md">
        <SignUp redirectUrl="/" />
      </div>
    </div>
  );
}
