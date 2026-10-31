import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SortingState } from "@tanstack/react-table";
import { DataTable, type DataTableColumn } from "./data-table";

type Person = { id: string; name: string; email: string };
const PEOPLE: Person[] = [
  { id: "1", name: "Asha", email: "asha@example.com" },
  { id: "2", name: "Ravi", email: "ravi@example.com" },
];
const COLUMNS: DataTableColumn<Person>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
    cell: ({ row }) => <a href={`mailto:${row.original.email}`}>{row.original.email}</a>,
  },
];

const handlers = () => ({
  onSearchChange: vi.fn(),
  onSortingChange: vi.fn(),
  onNextPage: vi.fn(),
  onPreviousPage: vi.fn(),
  onRowClick: vi.fn(),
});

const Table = (
  props: Partial<Parameters<typeof DataTable<Person>>[0]> & ReturnType<typeof handlers>,
) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  return (
    <DataTable
      columns={COLUMNS}
      data={PEOPLE}
      search=""
      searchPlaceholder="Search people"
      sorting={sorting}
      hasNextPage
      hasPreviousPage={false}
      emptyMessage="No one yet."
      {...props}
      onSortingChange={(next) => {
        props.onSortingChange(next);
        setSorting(next);
      }}
    />
  );
};

describe("DataTable", () => {
  it("shows rows, with each column's class on its header and cells", () => {
    render(<Table {...handlers()} />);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("columnheader", { name: "Email" })).toHaveClass(
      "hidden",
      "md:table-cell",
    );
    expect(screen.getByRole("cell", { name: "asha@example.com" })).toHaveClass("md:table-cell");
  });

  it("lets classNames win over its own", () => {
    render(
      <Table {...handlers()} classNames={{ search: "rounded-4xl", pageButton: "rounded-full" }} />,
    );
    expect(screen.getByRole("textbox", { name: "Search people" })).toHaveClass("rounded-4xl");
    expect(screen.getByRole("textbox", { name: "Search people" })).not.toHaveClass("rounded-xl");
    expect(screen.getByRole("button", { name: "Next" })).toHaveClass("rounded-full");
  });

  it("sorts through the caller, showing the direction", async () => {
    const user = userEvent.setup();
    const on = handlers();
    render(<Table {...on} />);
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(on.onSortingChange).toHaveBeenLastCalledWith([{ id: "name", desc: false }]);
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("searches once typing stops, and follows the caller's search", () => {
    vi.useFakeTimers();
    const on = handlers();
    const { rerender } = render(<Table {...on} />);
    const box = screen.getByRole("textbox", { name: "Search people" });
    act(() => {
      box.focus();
    });
    // Typing with fake timers: change the value directly.
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(box, "as");
      box.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(on.onSearchChange).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(400));
    expect(on.onSearchChange).toHaveBeenCalledWith("as");

    rerender(<Table {...on} search="ravi" />);
    expect(box).toHaveValue("ravi");
    vi.useRealTimers();
  });

  it("pages next and previous, and shows loading, errors and empty", async () => {
    const user = userEvent.setup();
    const on = handlers();
    const { rerender } = render(<Table {...on} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(on.onNextPage).toHaveBeenCalled();

    rerender(<Table {...on} isLoading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    rerender(<Table {...on} isError />);
    expect(screen.getByText("Couldn't load this.")).toBeInTheDocument();
    rerender(<Table {...on} data={[]} />);
    expect(screen.getByText("No one yet.")).toBeInTheDocument();
  });

  it("opens a row on click, but lets links in it act on their own", async () => {
    const user = userEvent.setup();
    const on = handlers();
    render(<Table {...on} />);
    const [, asha] = screen.getAllByRole("row");
    await user.click(within(asha).getByRole("cell", { name: "Asha" }));
    expect(on.onRowClick).toHaveBeenCalledWith(PEOPLE[0]);
    on.onRowClick.mockClear();
    await user.click(within(asha).getByRole("link"));
    expect(on.onRowClick).not.toHaveBeenCalled();
  });
});
