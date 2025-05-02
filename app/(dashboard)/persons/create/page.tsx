import { InputTextField } from '@/components/forms/fields/text-field';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import CreatePersonForm from './form';

export default function CreatePersonPage() {
  return (
    <Card className="max-w-screen-md mx-auto mb-40">
      <CardHeader>
        <CardTitle>Nueva persona</CardTitle>
        <CardDescription>
          Agregar un nuevo registro de persona a la congregación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreatePersonForm />
      </CardContent>
    </Card>
  );
}
