"use client";
import { CategorySelectField } from "@/components/forms/fields/category-select";
import { ConfirmField } from "@/components/forms/fields/confirm";
import { DatePickerField } from "@/components/forms/fields/date-picker";
import { PhoneNumberField } from "@/components/forms/fields/phone-number";
import { SegmentControlField } from "@/components/forms/fields/segment-control";
import { InputTextField } from "@/components/forms/fields/text-field";
import { FormLabel } from "@/components/forms/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { run } from "@/lib/actions/act";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { InfoIcon } from "lucide-react";
import { z } from "zod";
import { createPersonAction } from "../_actions/create";

type InferEnumToOptions<Enum extends z.EnumLike> = Enum extends Record<
	string,
	any
>
	? Array<
			{
				[Key in keyof Enum]: { value: Key; label: Enum[Key] };
			}[keyof Enum]
		>
	: Array<{ value: string; label: string }>;

const enumToOptions = <Enum extends z.EnumLike>(
	enumSchema: z.ZodNativeEnum<Enum>,
): InferEnumToOptions<Enum> => {
	return Object.entries(enumSchema.enum).map(([value, label]) => ({
		value,
		label,
	})) as InferEnumToOptions<Enum>;
};

const zGender = z.nativeEnum({
	male: "Hombre",
	female: "Mujer",
} as const);

const zSchoolAssignments = z.nativeEnum({
	reading: "Lectura de la Biblia",
	beliefs_explanation: "Explique sus creencias",
	speaking: "Discurso",
	return_visits: "Revisita",
	bible_study: "Curso Bíblico",
} as const);

const zOtherAssignments = z.nativeEnum({
	microphone: "Micrófonos",
	attendant: "Acomodador",
	book_reading: "Lector de Estudio del Libro",
	watchtower_reading: "Lector de la Atalaya",
	cleaning_captain: "Capitán de Limpieza",
	public_prayer: "Orar en público",
	weekend_chairman: "Presidir Reunión Pública",
} as const);

export default function CreatePersonForm() {
	const schema = z
		.object({
			firstName: z.string(),
			lastName: z.string(),
			gender: zGender,
			phoneNumber: z.string().optional(),
			emailAddress: z.string().optional(),
			birthDate: z.coerce.date().optional(),
			isSchoolStudent: z.boolean().default(false),
			isExemplary: z.boolean().default(false),
			isInactive: z.boolean().default(false),
			isPublisher: z.boolean().default(false),
			isBaptized: z.boolean().default(false),
			publisherDate: z.coerce.date().optional(),
			baptismDate: z.coerce.date().optional(),
			inactiveDate: z.coerce.date().optional(),
			schoolAssignments: z.array(zSchoolAssignments),
			otherAssignments: z.array(zOtherAssignments),
		})
		.refine(({ isBaptized, baptismDate }) => isBaptized && !baptismDate, {
			message: "Debes definir una fecha de bautismo",
			path: ["baptismDate"],
		});

	const [form, fields] = useForm({
		onValidate(context) {
			const submission = parseWithZod(context.formData, {
				schema,
			});

			console.log("submission", submission);

			return submission;
		},
		async onSubmit(event, context) {
			await run(createPersonAction, {});
		},
		shouldValidate: "onSubmit",
		shouldRevalidate: "onSubmit",
	});

	return (
		<form
			{...getFormProps(form)}
			className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
		>
			<div className="col-span-full">
				<h4 className="text-md font-medium mb-0 mt-6">Información general</h4>
				<p className="text-sm text-muted-foreground">
					Datos personales y de contacto básicos
				</p>
			</div>
			<InputTextField label="Nombres" meta={fields.firstName} />
			<InputTextField label="Apellidos" meta={fields.lastName} />
			<PhoneNumberField optional label="Teléfono" meta={fields.phoneNumber} />
			<InputTextField
				optional
				label="Correo electrónico"
				meta={fields.emailAddress}
			/>
			<DatePickerField
				optional
				label="Fecha de nacimiento"
				meta={fields.birthDate}
			/>
			<div className="flex max-w-xs">
				<SegmentControlField
					meta={fields.gender}
					label="Género"
					options={enumToOptions(zGender)}
				/>
			</div>

			{!fields.emailAddress.value && (
				<Alert className="col-span-full" variant="info">
					<InfoIcon className="size-4 text-current stroke-current" />
					<AlertTitle>Sobre el uso de correo electrónico</AlertTitle>
					<AlertDescription>
						Aunque es opcional agregar correo electrónico a los registros de
						personas, ten en cuenta que necesitaras uno para poder crear una
						cuenta vinculado a un registro de persona
					</AlertDescription>
				</Alert>
			)}

			<div className="col-span-full border-t -mx-6 mt-6" />
			<div className="col-span-full">
				<h4 className="text-md font-medium mb-0">Estado espiritual</h4>
				<p className="text-sm text-muted-foreground">
					Datos personales y de contacto básicos
				</p>
			</div>

			<FormLabel className="col-span-full">Progreso espiritual</FormLabel>

			<ConfirmField
				label="¿Recibe asignaciones estudiantiles?"
				description="Seleccione si la persona ya ha sido aprobada como publicador o participa en el ministerio"
				meta={fields.isSchoolStudent}
			/>
			<ConfirmField
				label="¿Es publicador?"
				description="Seleccione si la persona ya ha sido aprobada como publicador o participa en el ministerio"
				meta={fields.isPublisher}
			/>
			<ConfirmField
				label="¿Es bautizado?"
				description="Seleccione si la persona es un publicador que ya se ha dedicado y bautizado como Testigo de Jehová"
				meta={fields.isBaptized}
			/>
			<ConfirmField
				disabled={
					form.value?.isPublisher !== "on" || form.value?.isInactive === "on"
				}
				label="¿Es ejemplar?"
				description="Seleccione si la persona ya ha sido aprobada como publicador o participa en el ministerio"
				meta={fields.isExemplary}
			/>
			<ConfirmField
				disabled={
					form.value?.isPublisher !== "on" || form.value?.isExemplary === "on"
				}
				label="¿Es inactivo?"
				description="Seleccione si la persona ya ha sido aprobada como publicador o participa en el ministerio"
				meta={fields.isInactive}
			/>

			<span className="col-span-full" />

			{form.value?.isPublisher && (
				<DatePickerField
					label="Fecha de publicador"
					meta={fields.baptismDate}
					optional
				/>
			)}

			{form.value?.isBaptized && (
				<DatePickerField label="Fecha de bautismo" meta={fields.baptismDate} />
			)}

			{form.value?.isInactive && (
				<DatePickerField
					label="Fecha de inactividad"
					meta={fields.inactiveDate}
					optional
				/>
			)}

			<div className="col-span-full"></div>

			{form.value?.isSchoolStudent && (
				<CategorySelectField
					label="Asignaciones estudiantiles"
					description="Seleccione las asignaciones estudiantiles que recibe esta persona durante la reunión Vida y Ministerio Cristianos"
					meta={fields.schoolAssignments}
					options={enumToOptions(zSchoolAssignments)}
				/>
			)}

			{form.value?.isExemplary && (
				<CategorySelectField
					label="Otras asignaciones"
					description="Seleccione que otras responsabilidades o privilegios especiales puede recibir esta persona en la congregación"
					meta={fields.otherAssignments}
					options={enumToOptions(zOtherAssignments)}
				/>
			)}
			<div className="col-span-full border-t -mx-6 mt-6" />
			<div className="col-span-full flex gap-2 justify-end">
				<Button variant="outline">Descartar</Button>
				<Button>Guardar</Button>
			</div>
		</form>
	);
}
