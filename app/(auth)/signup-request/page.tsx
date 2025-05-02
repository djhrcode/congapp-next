import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';
import { submitSignUpRequest } from '../actions';
import { useForm } from '@conform-to/react';
import '@/lib/structs/utils/validate';
import { z } from 'zod';
import { parseWithZod } from '@conform-to/zod';
import { InputField } from './input';
import LoginPage from './client';

const schema = z.object({
  email: z.string().email(),
  message: z.string().max(100)
});

export default function Page() {
  return <LoginPage />;
}
