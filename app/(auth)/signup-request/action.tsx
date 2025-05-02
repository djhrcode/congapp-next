'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

const schema = z.object({
  firstName: z
    .string()
    .includes('motherf', { message: 'Incluye una mala palabra: "motherf"' }),
  lastName: z.string().min(3)
});

export async function signUpRequest(
  prevState: unknown,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  console.log('signUpRequest', 'hello!');
  const validation = parseWithZod(formData, { schema });

  console.log('signUpRequest', validation.status);

  if (validation.status === 'error') return validation.reply();

  return {
    status: 'success'
  };
}
