import { useState } from "react";
import { Switch } from "@/components/switch";

export default function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <label className="flex items-center gap-3 text-sm font-medium">
      <Switch checked={on} onCheckedChange={setOn} />
      People can close it ({on ? "on" : "off"})
    </label>
  );
}
