import { describe, expect, it } from "vitest";
import { toggleBold, toggleList } from "./markdown-shortcuts";

const at = (text: string, selected: string) => {
  const start = text.indexOf(selected);
  return { text, start, end: start + selected.length };
};

describe("markdown-shortcuts", () => {
  it("bolds the selection, and unbolds it again", () => {
    const bold = toggleBold(at("Choose Set up now", "Set up"));
    expect(bold).toEqual({ text: "Choose **Set up** now", start: 9, end: 15 });
    expect(toggleBold(bold)).toEqual(at("Choose Set up now", "Set up"));
    expect(toggleBold(at("Choose **Set up** now", "**Set up**"))).toEqual({
      text: "Choose Set up now",
      start: 7,
      end: 13,
    });
  });

  it("puts the cursor inside an empty pair when nothing's selected", () => {
    expect(toggleBold({ text: "Hi ", start: 3, end: 3 })).toEqual({
      text: "Hi ****",
      start: 5,
      end: 5,
    });
  });

  it("makes the selected lines a list, numbered in order, and takes it off again", () => {
    const text = "Intro\nOpen your name.\nChoose Set up.\nOutro";
    const selection = { text, start: text.indexOf("your"), end: text.indexOf("Set") };

    const numbered = toggleList(selection, "numbers");
    expect(numbered.text).toBe("Intro\n1. Open your name.\n2. Choose Set up.\nOutro");
    expect(toggleList(numbered, "numbers").text).toBe(text);
    expect(toggleList(numbered, "bullets").text).toBe(
      "Intro\n- Open your name.\n- Choose Set up.\nOutro",
    );
  });

  it("lists just the cursor's line when nothing's selected", () => {
    expect(toggleList({ text: "one\ntwo", start: 5, end: 5 }, "bullets")).toEqual({
      text: "one\n- two",
      start: 4,
      end: 9,
    });
  });
});
