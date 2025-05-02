'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { approveSignUpRequest, sendUserInviteEmail } from '../actions';

interface SignUpRequest {
  name: string;
  id: string;
  isVerified: boolean | null;
  authorId: string | null;
  personId: string;
  firstName: string | undefined;
  lastName: string | undefined;
  identityProviderId: string | undefined;
}

export function SignUpRequestsTable({ data }: { data: SignUpRequest[] }) {
  return (
    <DataTable
      data={data}
      columns={
        [
          {
            id: 'congregation',
            header: 'Congregación',
            accessorFn: (row) => {
              return `${row.name} (${row.id})`;
            }
          },
          {
            id: 'full_name',
            header: 'Nombre completo',
            accessorFn: (row) => {
              return `${row.firstName} ${row.lastName}`;
            },
            cell: (props) => {
              return <>{props.getValue()}</>;
            }
          },
          {
            id: 'actions',
            header: 'Acciones',
            accessorFn: (row) => row,
            cell: ({ row: { original: item } }) => {
              const isVerified = item.isVerified && item.identityProviderId;

              if (isVerified) return 'Ya se ha verificado';

              return item.isVerified ? (
                <Button onClick={() => sendUserInviteEmail(item.personId)}>
                  Reenviar invitación
                </Button>
              ) : (
                <Button onClick={() => approveSignUpRequest(item.id)}>
                  Aprobar solicitud
                </Button>
              );
            }
          }
        ] as ColumnDef<SignUpRequest>[]
      }
    />
  );
}
