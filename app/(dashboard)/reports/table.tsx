"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SearchIcon } from "lucide-react";
import { Input, InputControl, InputInnerSuffix } from "@/components/ui/input";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { QueryPersonsResult } from "./page";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const RecordsTable = ({
	persons,
	total,
}: {
	persons: QueryPersonsResult;
	total: number;
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-bold tracking-tight">
					Informe de Abril
				</CardTitle>
				<CardDescription>
					Navega a traves de los informes de servicio
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid mb-4 justify-start">
					<Input>
						<InputControl placeholder="Buscar publicador..." />
						<InputInnerSuffix>
							<SearchIcon className="size-5" />
						</InputInnerSuffix>
					</Input>
				</div>
				<DataTable
					columns={
						[
							{
								id: "selector",
								cell(props) {
									return (
										<Checkbox
											checked={props.row.getIsSelected()}
											onCheckedChange={(checked) =>
												props.row.toggleSelected(checked)
											}
										/>
									);
								},
							},
							{
								header: "Nombre",
								cell(props) {
									const person = persons[props.row.index];
									const nowDate = new Date();
									const roles = {
										elder: "Anciano",
										ministerial_servant: "Siervo ministerial",
										auxiliar_pioneer: "Precursor auxiliar",
										special_pioneer: "Precursor especial",
										coordinator: "Precursor especial",
										group_auxiliar: "Precursor especial",
										group_overseer: "Precursor especial",
										lnm_overseer: "Precursor especial",
										service_overseer: "Precursor especial",
										secretary: "Precursor especial",
										regular_pioneer: "Precursor regular",
									};

									return (
										<div className="flex gap-2">
											<Avatar>
												<AvatarFallback>
													{`${person.firstName[0]}${person.lastName[0]}`.toLocaleUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<h3>{`${person.firstName} ${person.lastName}`}</h3>
												<p className="text-xs text-muted-foreground">
													{person.rolesToPersons.length > 0
														? person.rolesToPersons
																.map(({ role }) =>
																	role?.name && role?.name in roles
																		? roles[role.name]
																		: undefined,
																)
																.join(", ")
														: "Publicador"}
												</p>
											</div>
										</div>
									);
								},
							},
							{
								header: "Género",
								cell(props) {
									const person = persons[props.row.index];
									return `${person.gender === "Male" ? "Hombre" : "Mujer"}`;
								},
							},
							{
								header: "Grupo",
								cell(props) {
									const person = persons[props.row.index];
									return `${person.group?.name}`;
								},
							},
							{
								header: "Privilegios",
								cell(props) {
									const person = persons[props.row.index];

									return (
										<div className="flex gap-2">
											{person.rolesToPersons.map((record) => (
												<Badge variant="outline">{record.role?.name}</Badge>
											))}
										</div>
									);
								},
							},
						] as ColumnDef<QueryPersonsResult[number]>[]
					}
					data={persons}
				/>
				<p className="text-muted-foreground text-xs py-4">{total} elementos</p>
			</CardContent>
		</Card>
	);
};
