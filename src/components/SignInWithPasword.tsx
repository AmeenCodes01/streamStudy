import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner"
import { Password } from "@convex-dev/auth/providers/Password";

import { ConvexError } from "convex/values";
import { redirect } from "next/dist/server/api-utils";


export function SignInWithPassword({
  provider,
  handleSent,
  handlePasswordReset,
  customSignUp: customSignUp,
  passwordRequirements,
}: {
  provider?: string;
  handleSent?: (email: string) => void;
  handlePasswordReset?: () => void;
  customSignUp?: React.ReactNode;
  passwordRequirements?: string;
}) {
  
    const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);



  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        const formData = new FormData(event.currentTarget);
        formData.set("email",formData.get("name")as string)
        for (let pair of formData.entries()) {
            console.log(pair[0]+ ': ' + pair[1]);
          }        
          signIn(provider ?? "password", formData)
          .then(() => {
            handleSent?.(formData.get("email") as string);
          })
          .catch((error) => {
            console.error("error",error);
            
            let toastTitle: string;
            // if (
            //   error instanceof ConvexError &&
            //   error.data === "INVALID_PASSWORD"
            // ) {
            //   toastTitle =
            //   "Invalid password";
            // } else {
            //   console.log("erro")
            //   toastTitle =
            //     flow === "signIn"
            //       ? "Could not sign in, did you mean to sign up?"
            //       : "Could not sign up, did you mean to sign in?";
            // }
            toast.error("Wrong Credentials.");
            setSubmitting(false);
          });
      }}
    >
      <div className="hidden">

      <label htmlFor="email">Email</label>
      <Input name="email" id="email" className="mb-4" autoComplete="email" defaultValue={""}/>
      </div>
      <label htmlFor="name">Username</label>
      <Input name="name" id="name" className="mb-4" autoComplete="username"/>
      {/* <span className="text-sm italic">Please use </span> */}
      <div className="flex items-center justify-between">
        <label htmlFor="password">Password</label>
        {handlePasswordReset && flow === "signIn" ? (
          <Button
            className="p-0 h-auto"
            type="button"
            variant="link"
            onClick={handlePasswordReset}
          >
            Forgot your password?
          </Button>
        ) : null}
      </div>
      <Input
        type="password"
        name="password"
        id="password"
        autoComplete={flow === "signIn" ? "current-password" : "new-password"}
      />
      {flow === "signUp" && passwordRequirements !== null && (
        <span className="text-gray-500 font-thin text-sm">
          {passwordRequirements}
        </span>
      )}
      {flow === "signUp" && customSignUp}
      <input name="flow" value={flow} type="hidden" />
      <Button type="submit" disabled={submitting} className="mt-4">
        {flow === "signIn" ? "Sign in" : "Sign up"}
      </Button>
      <Button
        variant="link"
        type="button"
        onClick={() => {
          setFlow(flow === "signIn" ? "signUp" : "signIn");
        }}
      >
        {flow === "signIn"
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </Button>
    </form>
  );
}