import { useState } from "react";
import { AsyncMultiSelect, type Option } from "@/components/async-multi-select";

const COMPANIES: Option[] = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella",
  "Hooli",
  "Stark Industries",
  "Wayne Enterprises",
  "Wonka Industries",
].map((label) => ({
  id: label.toLowerCase().replace(/\W+/g, "-"),
  label,
  description: label.toLowerCase().split(" ")[0],
}));

/** A pretend server: matches after a short wait. */
const search = (query: string, signal: AbortSignal) =>
  new Promise<Option[]>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve(COMPANIES.filter((each) => each.label.toLowerCase().includes(query.toLowerCase()))),
      300,
    );
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });

export default function AsyncMultiSelectDemo() {
  const [value, setValue] = useState<Option[]>([]);
  return (
    <div className="flex max-w-md flex-col gap-2">
      <label htmlFor="demo-orgs" className="text-sm font-medium">
        Who sees it
      </label>
      <AsyncMultiSelect
        id="demo-orgs"
        all="All organizations"
        value={value}
        onChange={setValue}
        search={search}
      />
      <p className="text-muted-foreground text-xs">
        {value.length === 0 ? "Everyone" : value.map((each) => each.label).join(", ")}
      </p>
    </div>
  );
}
