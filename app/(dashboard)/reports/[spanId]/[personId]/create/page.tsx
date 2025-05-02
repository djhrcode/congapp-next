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
import { CreatePersonReportForm } from './form';

export default async function CreatePersonReport(props: {
  params: {
    spanId: string;
    personId: string;
  };
}) {
  return <CreatePersonReportForm />;
}
