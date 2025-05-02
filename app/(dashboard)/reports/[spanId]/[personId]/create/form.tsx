'use client';

import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { ConfirmField } from '@/components/forms/fields/confirm';
import { NumberInputField } from '@/components/forms/fields/number-input';
import { InputTextField } from '@/components/forms/fields/text-field';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { TextareaInputField } from '@/components/forms/fields/textarea-input';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CreatePersonReportForm() {
  const searchParams = useSearchParams();

  const schema = z.object({
    wasAuxiliarPioneer: z.literal('on').optional(),
    hasPreached: z.literal('on').optional(),
    hasHoursCredit: z.literal('on').optional(),
    hours: z.number().optional(),
    hoursCredit: z.number().optional(),
    bibleStudies: z.number().optional(),
    comments: z.string().optional()
  });

  const [form, fields] = useForm({
    onValidate(context) {
      const submission = parseWithZod(context.formData, { schema });

      return submission;
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput'
  });

  const isRegularPioneer = searchParams.get('isRegularPioneer') === 'on';
  const mustReportHours =
    isRegularPioneer || fields.wasAuxiliarPioneer.value === 'on';
  const mustReportCreditHours =
    isRegularPioneer && fields.hasHoursCredit.value === 'on';

  return (
    <div className="max-w-[30rem] w-full mx-auto py-8 px-6">
      <CardHeader>
        <CardDescription>Añadir informe de publicador</CardDescription>
        <CardTitle className="font-bold tracking-tight">
          Daniel Hernández
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-5 flex-col">
        <form
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
          className="w-full flex flex-col gap-4"
        >
          {!isRegularPioneer && (
            <ConfirmField
              label="¿Hizo el precursorado auxiliar?"
              description="Seleccione esta opción si el publicador hizo el precursorado auxiliar durante este mes"
              meta={fields.wasAuxiliarPioneer}
            />
          )}
          {!mustReportHours && (
            <ConfirmField
              label="¿Participó en el ministerio?"
              description="Seleccione esta opción si el publicador tuvo alguna participación en el ministerio durante el mes y no es precursor"
              meta={fields.hasPreached}
            />
          )}
          {mustReportHours && (
            <>
              {isRegularPioneer && (
                <ConfirmField
                  label="¿Tuvo algun crédito de horas?"
                  description="Seleccione esta opción si el precursor recibió algun crédito de horas (ej: asistió a una escuela teocrática, sirve como voluntario externo)"
                  meta={fields.hasHoursCredit}
                />
              )}
              <NumberInputField label="Horas" meta={fields.hours} />
              {mustReportCreditHours && (
                <NumberInputField
                  label="Crédito de horas"
                  meta={fields.hoursCredit}
                />
              )}
            </>
          )}
          <NumberInputField
            label="Cursos bíblicos"
            meta={fields.bibleStudies}
          />
          <TextareaInputField
            placeholder="Agrega algun comentario importante"
            label="Comentarios"
            meta={fields.comments}
          />
          <div className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button>Enviar informe</Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}
