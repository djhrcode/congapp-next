'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormProvider, useForm } from '@conform-to/react';
import '@/lib/structs/utils/validate';
import { z } from 'zod';
import { parseWithZod } from '@conform-to/zod';
import { useActionState } from 'react';
import { signUpRequest } from './action';
import { InputTextField } from '@/components/forms/fields/text-field';
import { SelectField } from '@/components/forms/fields/select';
import { PhoneNumberField } from '@/components/forms/fields/phone-number';
import { ArrowRight } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(3).includes('sda'),
  lastName: z.string().min(3),
  emailAddress: z.string().email(),
  gender: z.enum(['male', 'female']),
  phoneNumber: z.string()
});

export default function LoginPage() {
  const [lastResult, action] = useActionState(signUpRequest, undefined);

  const [form, fields] = useForm({
    lastResult,
    onValidate(context) {
      const submission = parseWithZod(context.formData, { schema });

      return submission;
    },
    shouldValidate: 'onInput',
    shouldRevalidate: 'onInput'
  });

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <div className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Registra tu congregación
          </CardTitle>
          <CardDescription>
            Para poder acceder a la aplicación, por favor, provee los siguientes
            datos que serán utilizados para verificar la información de la
            congregación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={form.id}
            onSubmit={form.onSubmit}
            action={action}
            noValidate
            className="w-full flex flex-col gap-4"
          >
            <InputTextField
              meta={fields.firstName}
              label="Nombres"
              description="Tus nombres legales"
            />
            <InputTextField
              meta={fields.lastName}
              label="Apellidos"
              description="Tus apellidos legales"
            />
            <InputTextField
              meta={fields.emailAddress}
              label="Correo electrónico"
              description="Tu dirección de correo electrónico"
            />
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <SelectField
                meta={fields.gender}
                label="Género"
                options={[
                  {
                    label: 'Femenino',
                    value: 'female'
                  },
                  {
                    label: 'Masculino',
                    value: 'male'
                  }
                ]}
              />
            </div>
            <PhoneNumberField
              label="Número de teléfono"
              meta={fields.phoneNumber}
              description="Lo usaremos para enviarte códigos de seguridad"
            />
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>Congregation name</Label>
              <Input name="congregationName" placeholder="Monticello" />
              {fields.message.errors}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>Congregation number</Label>
              <Input name="congregationNumber" placeholder="33837" />
              {fields.email.errors}
            </div>

            <Button className="w-full mt-4" type="submit" size="lg">
              Continue
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </form>
        </CardContent>
      </div>
    </div>
  );
}
