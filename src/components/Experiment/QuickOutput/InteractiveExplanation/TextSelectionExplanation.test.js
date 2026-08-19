import {
  getSectionLabel,
  getSelectionDetails,
  getSurroundingText,
  shortenText
} from "./TextSelectionExplanation";

describe("TextSelectionExplanation", () => {
  it("captures bounded plain text and a semantic section", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <section data-explanation-section="Class evidence">
        <p>The probability margin between the leading classes is useful comparison context.</p>
      </section>
    `;
    document.body.appendChild(root);
    const paragraph = root.querySelector("p");
    const textNode = paragraph.firstChild;
    const range = document.createRange();
    range.setStart(textNode, 4);
    range.setEnd(textNode, 22);
    range.getBoundingClientRect = () => ({ left: 20, right: 140, top: 30, bottom: 50, width: 120, height: 20 });
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const details = getSelectionDetails(root, selection);

    expect(details.text).toBe("probability margin");
    expect(details.surroundingText).toContain("leading classes");
    expect(details.section).toBe("Class evidence");
    root.remove();
  });

  it("rejects selections from interactive controls", () => {
    const root = document.createElement("div");
    root.innerHTML = "<button>Explain this control</button>";
    document.body.appendChild(root);
    const textNode = root.querySelector("button").firstChild;
    const range = document.createRange();
    range.selectNodeContents(textNode);
    range.getBoundingClientRect = () => ({ left: 20, top: 30, bottom: 50, width: 80, height: 20 });
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    expect(getSelectionDetails(root, selection)).toBeNull();
    root.remove();
  });

  it("bounds surrounding copy without serializing markup", () => {
    const root = document.createElement("div");
    const paragraph = document.createElement("p");
    paragraph.textContent = `${"before ".repeat(80)}selected phrase ${"after ".repeat(80)}`;
    root.appendChild(paragraph);

    const surroundingText = getSurroundingText(paragraph, root, "selected phrase");

    expect(surroundingText.length).toBeLessThanOrEqual(500);
    expect(surroundingText).toContain("selected phrase");
    expect(surroundingText).not.toContain("<p>");
    expect(getSectionLabel(paragraph, root)).toBe("Model result");
    expect(shortenText("a".repeat(100), 20).length).toBe(20);
  });
});
