import { useState } from "react";
import { Announcement, TONES, type Tone } from "@/components/announcement-banner";

const LONG = `Sign-in now asks for a code from an authenticator app.

**Set it up in a minute:**
1. Open your name in the corner.
2. Choose **Security**, then **Set up**.`;

export default function AnnouncementDemo() {
  const [tone, setTone] = useState<Tone>("info");
  const [closed, setClosed] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1" role="group" aria-label="Tone">
        {(Object.keys(TONES) as Tone[]).map((each) => (
          <button
            key={each}
            type="button"
            aria-pressed={tone === each}
            onClick={() => setTone(each)}
            className="aria-pressed:bg-muted rounded-full border px-3 py-1 text-xs font-medium capitalize"
          >
            {each}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border">
        {closed ? (
          <button type="button" className="p-3 text-sm underline" onClick={() => setClosed(false)}>
            Show the banner again
          </button>
        ) : (
          <Announcement
            tone={tone}
            title="Authenticator apps are now required"
            body={LONG}
            onDismiss={() => setClosed(true)}
          />
        )}
      </div>
      <Announcement
        variant="notice"
        tone={tone}
        title="New: Loans"
        body="Employees can now apply for **loans** from their profile."
      />
    </div>
  );
}
