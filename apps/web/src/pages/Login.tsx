import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, GithubIcon, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { signIn } from "@/lib/auth-client";
import { env } from "@/config/env";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${env?.VITE_FRONTEND_URL}/dashboard`,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-medium hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        type="button"
        className="w-full h-12 text-sm font-medium "
        disabled={loading}
        onClick={handleGoogle}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-1" /> Signing in
          </>
        ) : (
          <>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continue with Google
          </>
        )}
      </Button>
    </AuthLayout>
  );
}
