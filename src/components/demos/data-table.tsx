import { useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { DataTable, type DataTableColumn } from "@/components/data-table";

type Person = { id: string; name: string; team: string; email: string };

const NAMES = [
  "Asha",
  "Ravi",
  "Meera",
  "Kabir",
  "Isha",
  "Arjun",
  "Diya",
  "Vikram",
  "Neha",
  "Rohan",
  "Tara",
  "Aditya",
];
const TEAMS = ["Design", "Engineering", "Finance", "People"];
const PEOPLE: Person[] = NAMES.map((name, index) => ({
  id: String(index + 1),
  name,
  team: TEAMS[index % TEAMS.length],
  email: `${name.toLowerCase()}@example.com`,
}));
const PER_PAGE = 5;

const COLUMNS: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "team", header: "Team", enableSorting: false },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
    cell: ({ row }) => (
      <a className="underline underline-offset-4" href={`mailto:${row.original.email}`}>
        {row.original.email}
      </a>
    ),
  },
];

/** A pretend server: search, sort by name, and pages by offset as a cursor. */
export default function DataTableDemo() {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [start, setStart] = useState(0);
  const [opened, setOpened] = useState<string>();

  const results = useMemo(() => {
    const found = PEOPLE.filter((each) => each.name.toLowerCase().includes(search.toLowerCase()));
    const desc = sorting[0]?.desc;
    return sorting.length
      ? [...found].sort((a, b) => (desc ? -1 : 1) * a.name.localeCompare(b.name))
      : found;
  }, [search, sorting]);

  return (
    <div className="flex flex-col gap-2">
      <DataTable
        columns={COLUMNS}
        data={results.slice(start, start + PER_PAGE)}
        search={search}
        searchPlaceholder="Search people"
        onSearchChange={(value) => {
          setSearch(value);
          setStart(0);
        }}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next);
          setStart(0);
        }}
        hasPreviousPage={start > 0}
        hasNextPage={start + PER_PAGE < results.length}
        onPreviousPage={() => setStart(Math.max(0, start - PER_PAGE))}
        onNextPage={() => setStart(start + PER_PAGE)}
        emptyMessage="No one matches."
        onRowClick={(person) => setOpened(person.name)}
      />
      <p className="text-muted-foreground text-xs">
        {opened ? `Opened ${opened}.` : "Click a row."}
      </p>
    </div>
  );
}
