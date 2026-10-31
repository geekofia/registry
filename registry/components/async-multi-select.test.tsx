import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AsyncMultiSelect, type Option } from "./async-multi-select";

const OPTIONS: Option[] = [
  { id: "a", label: "Acme Corp", description: "acme" },
  { id: "g", label: "Globex", description: "globex" },
];
const search = vi.fn(async (query: string) =>
  OPTIONS.filter((each) => each.label.toLowerCase().includes(query.toLowerCase())),
);
const changes = vi.fn();

const Picker = ({ all }: { all?: string }) => {
  const [value, setValue] = useState<Option[]>([]);
  return (
    <>
      <label htmlFor="orgs">Organizations</label>
      <AsyncMultiSelect
        id="orgs"
        all={all}
        value={value}
        search={search}
        debounceMs={0}
        onChange={(next) => {
          changes(next.map((each) => each.id));
          setValue(next);
        }}
      />
    </>
  );
};

describe("AsyncMultiSelect", () => {
  it("searches from the second letter, and shows those chosen as chips", async () => {
    const user = userEvent.setup();
    render(<Picker />);

    await user.click(screen.getByLabelText("Organizations"));
    expect(await screen.findByText("Type 2 letters to search.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Organizations"), "g");
    expect(search).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Organizations"), "lo");
    await user.click(await screen.findByRole("option", { name: /Globex/ }));
    expect(search).toHaveBeenLastCalledWith("glo", expect.any(AbortSignal));
    expect(changes).toHaveBeenLastCalledWith(["g"]);
    expect(screen.getByRole("button", { name: "Remove Globex" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove Globex" }));
    expect(changes).toHaveBeenLastCalledWith([]);
  });

  it("starts with All, unticked by choosing one and clearing them when ticked again", async () => {
    const user = userEvent.setup();
    render(<Picker all="All organizations" />);
    const field = screen.getByLabelText("Organizations");
    expect(screen.getByText("All organizations")).toBeInTheDocument();

    await user.type(field, "ac");
    expect((await screen.findAllByRole("option"))[0]).toHaveAccessibleName("All organizations");
    await user.click(await screen.findByRole("option", { name: /Acme Corp/ }));
    expect(changes).toHaveBeenLastCalledWith(["a"]);
    expect(screen.queryByText("All organizations")).not.toBeInTheDocument();

    await user.type(field, "ac");
    await user.click(await screen.findByRole("option", { name: "All organizations" }));
    expect(changes).toHaveBeenLastCalledWith([]);
  });

  it("keeps the choice when Escape is pressed, rather than clearing it to all", async () => {
    const user = userEvent.setup();
    render(<Picker all="All organizations" />);

    await user.type(screen.getByLabelText("Organizations"), "ac");
    await user.click(await screen.findByRole("option", { name: /Acme Corp/ }));
    changes.mockClear();
    await user.keyboard("{Escape}");
    await user.keyboard("{Escape}");
    expect(changes).not.toHaveBeenCalled();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });
});
