import { db } from '@/lib/db';
import { getRequests } from './actions';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { SignUpRequestsTable } from './components/RequestsTable';

export default async function Page() {
  const requests = await getRequests();

  return (
    <div>
      <h2>Welcome to the requests page!</h2>
      <pre>{JSON.stringify(requests, null, 2)}</pre>
      <SignUpRequestsTable data={requests} />
    </div>
  );
}
