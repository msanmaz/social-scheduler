'use client';

import { useRouter } from "next/navigation";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { loginUser } from '@/actions/auth';
import SignInButton from '../action-buttons/signin-button';

export function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    const response = await loginUser(formData);
    console.log(response,'resp');
    if (response.success) {
      console.log(response);
      router.push('/dashboard');
    } else {
      console.error(response);
    }
  };
  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Login</h2>
      <form action={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <Label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:border-gray-800"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="password" className="block text-gray-700 font-bold mb-2">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter Password"
            className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3
          text-gray-700 leading-tight
            focus:outline-none focus:shadow-outline dark:border-gray-800"
            required
          />
        </div>
        <div className="flex items-center justify-center">
        <SignInButton login={true}/>
        </div>
      </form>
    </div>
  );
}
