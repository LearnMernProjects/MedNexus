import { SignIn } from "@clerk/nextjs";

const POST_AUTH_REDIRECT_URL = "/dashboard";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-(--background)">
      <div className="w-full max-w-md">
        <SignIn forceRedirectUrl={POST_AUTH_REDIRECT_URL} fallbackRedirectUrl={POST_AUTH_REDIRECT_URL} />
      </div>
    </div>
  );
}
