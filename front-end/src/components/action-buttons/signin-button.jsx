'use client';

import React from 'react';
import { Button } from '../ui/button';
import { useFormStatus } from "react-dom";
import { Loader2 } from 'lucide-react';

const SignInButton = ({ login = false }) => {
  const { pending } = useFormStatus();

  const buttonText = login ? 'Login' : 'Sign In';

  const buttonContent = pending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Please Wait
    </>
  ) : buttonText;

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded 
      focus:outline-none focus:shadow-outline"
    >
      {buttonContent}
    </Button>
  );
};

export default SignInButton;
