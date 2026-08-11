import { expect, test, type Page } from "@playwright/test";

function colorChannels(color: string): [number, number, number] {
  const channels = color
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length !== 3)
    throw new Error(`Invalid color: ${color}`);
  return channels as [number, number, number];
}

function luminance(color: string): number {
  const channels = colorChannels(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

async function markerColors(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((marker) => {
      const style = getComputedStyle(marker);
      return { color: style.color, background: style.backgroundColor };
    });
}

async function openChordExplorer(page: Page) {
  await page.getByRole("button", { name: "Chord explorer" }).click();
  await expect(
    page.getByRole("heading", { name: "C", exact: true }),
  ).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto(
    "/?root=D&scale=blues&labels=notes&accidentals=flats&handedness=right&strings=high-to-low",
  );
  await expect(
    page.locator('.fretboard-region[data-interactive="true"]'),
  ).toBeVisible();
});

test("renders an accessible, contained 22-fret neck", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "D Blues" })).toBeVisible();
  await expect(
    page.getByRole("table", {
      name: /fret 0 through 22, right-handed, high E to low E/,
    }),
  ).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "22" })).toBeVisible();

  const layout = await page.evaluate(() => {
    const scroller = document.querySelector<HTMLElement>(".fretboard-scroll")!;
    const markers = [...document.querySelectorAll<HTMLElement>(".note-marker")];

    return {
      bodyOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      horizontalScrollable: scroller.scrollWidth > scroller.clientWidth,
      markerOverflow: markers.some((marker) => {
        const markerBox = marker.getBoundingClientRect();
        const cellBox = marker.parentElement!.getBoundingClientRect();
        return (
          markerBox.width > cellBox.width || markerBox.height > cellBox.height
        );
      }),
      stickyHeader: getComputedStyle(document.querySelector(".fret-numbers")!)
        .position,
      stickyLabels: [...document.querySelectorAll(".string-label")].every(
        (label) => getComputedStyle(label).position === "sticky",
      ),
    };
  });

  expect(layout).toEqual({
    bodyOverflow: false,
    horizontalScrollable: true,
    markerOverflow: false,
    stickyHeader: "sticky",
    stickyLabels: true,
  });
});

test("groups the complete scale catalog and updates shareable state", async ({
  page,
}) => {
  const scaleSelect = page.getByLabel("Scale", { exact: true });
  const catalog = await scaleSelect.evaluate((select) => ({
    groups: [...select.querySelectorAll("optgroup")].map(
      (group) => group.label,
    ),
    options: select.querySelectorAll("option").length,
  }));

  expect(catalog.groups).toEqual([
    "Major scale modes",
    "Melodic minor modes",
    "Symmetric scales",
    "Pentatonic scales",
    "Blues scales",
    "Bebop scales",
    "Harmonic scales",
  ]);
  expect(catalog.options).toBe(30);
  await expect(scaleSelect.locator('option[value="naturalMinor"]')).toHaveText(
    "Aeolian (Natural minor)",
  );

  await scaleSelect.selectOption("altered");
  await expect(
    page.getByRole("heading", { name: "D Altered (diminished whole-tone)" }),
  ).toBeVisible();
  await expect(page.getByRole("list", { name: "Scale degrees" })).toHaveText(
    /1.*♭2.*♯2.*3.*♭5.*♯5.*♭7/,
  );
  await expect(page).toHaveURL(/scale=altered/);
});

test("neck controls report and change horizontal position", async ({
  page,
}) => {
  const previous = page.getByRole("button", {
    name: "Scroll to the previous neck section",
  });
  const next = page.getByRole("button", {
    name: "Scroll to the next neck section",
  });
  const progress = page.getByRole("progressbar", {
    name: "Fretboard horizontal position",
  });

  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await expect(progress).toHaveAttribute("value", "0");

  await next.click();
  await expect(previous).toBeEnabled();
  await expect(progress).not.toHaveAttribute("value", "0");
});

test("clicking an empty fretboard spot clears a pinned note", async ({
  page,
}) => {
  const marker = page.locator(".note-marker").first();
  await marker.click();

  await expect(marker).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".note-marker.dimmed").first()).toBeVisible();

  await page.locator(".fret-cell:not(:has(.note-marker))").first().click();

  await expect(page.locator('.note-marker[aria-pressed="true"]')).toHaveCount(
    0,
  );
  await expect(page.locator(".note-marker.dimmed")).toHaveCount(0);
  await expect(page.locator(".note-marker.highlighted")).toHaveCount(0);
});

test("arrow, home, and end keys navigate note markers", async ({ page }) => {
  const first = page.locator('.note-marker[data-row="0"]').first();
  await first.focus();
  const startingColumn = Number(await first.getAttribute("data-column"));

  await first.press("ArrowRight");
  const afterRight = await page.evaluate(() => ({
    row: Number((document.activeElement as HTMLElement).dataset.row),
    column: Number((document.activeElement as HTMLElement).dataset.column),
  }));
  expect(afterRight.row).toBe(0);
  expect(afterRight.column).toBeGreaterThan(startingColumn);

  await page.keyboard.press("ArrowDown");
  expect(
    await page.evaluate(() =>
      Number((document.activeElement as HTMLElement).dataset.row),
    ),
  ).toBe(1);

  await page.keyboard.press("End");
  const rowColumns = await page
    .locator('.note-marker[data-row="1"]')
    .evaluateAll((markers) =>
      markers.map((marker) => Number(marker.dataset.column)),
    );
  expect(
    await page.evaluate(() =>
      Number((document.activeElement as HTMLElement).dataset.column),
    ),
  ).toBe(Math.max(...rowColumns));
});

test("toolbar controls follow a logical keyboard focus order", async ({
  page,
}) => {
  const root = page.getByLabel("Root note", { exact: true });
  await root.focus();
  await root.press("Tab");
  await expect(page.getByLabel("Scale", { exact: true })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Notes", { exact: true })).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Degrees", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Degrees", { exact: true })).toBeChecked();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Flats", { exact: true })).toBeFocused();
});

test("marker text and focus treatments meet core contrast requirements", async ({
  page,
}) => {
  const scale = await markerColors(page, ".note-marker:not(.root-note)");
  const root = await markerColors(page, ".note-marker.root-note");

  expect(contrastRatio(scale.color, scale.background)).toBeGreaterThanOrEqual(
    4.5,
  );
  expect(contrastRatio(root.color, root.background)).toBeGreaterThanOrEqual(
    4.5,
  );

  const marker = page.locator(".note-marker").first();
  await marker.focus();
  await expect(marker).toBeFocused();
  await expect(marker).toHaveCSS("outline-style", "solid");
  await expect(marker).toHaveAttribute(
    "aria-label",
    /degree .* string .* fret/,
  );
});

test("reduced-motion preference disables marker and scroll-cue transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(
    page.locator('.fretboard-region[data-interactive="true"]'),
  ).toBeVisible();

  await expect(page.locator(".note-marker").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  expect(
    await page
      .locator(".fretboard-viewport")
      .evaluate(
        (viewport) => getComputedStyle(viewport, "::after").transitionDuration,
      ),
  ).toBe("0s");

  await openChordExplorer(page);
  await page.getByRole("button", { name: "Add C to group" }).click();
  await expect(page.locator(".chord-group-card")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".chord-group-card")).toHaveCSS(
    "transition-duration",
    "0s",
  );
});

test("left-handed URL state reverses fret order without losing containment", async ({
  page,
}) => {
  await page.goto("/?handedness=left");
  const headers = await page
    .locator(".fret-numbers [role=columnheader]")
    .allTextContents();
  expect(headers.slice(1)).toEqual(
    Array.from({ length: 23 }, (_, index) => String(22 - index)),
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("core interactions do not produce browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.reload();
  await expect(
    page.locator('.fretboard-region[data-interactive="true"]'),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Scroll to the next neck section" })
    .click();
  await page.locator(".note-marker").first().press("ArrowRight");

  expect(errors).toEqual([]);
});

test("chord explorer renders and updates a horizontal six-string voicing", async ({
  page,
}) => {
  await openChordExplorer(page);
  await expect(page.getByLabel("Chord notes")).toContainText("C");
  await expect(page.getByLabel("Chord notes")).toContainText("E");
  await expect(page.getByLabel("Chord notes")).toContainText("G");
  await expect(page.getByRole("heading", { name: "Open C" })).toBeVisible();
  await expect(page.getByText("Open position", { exact: true })).toBeVisible();
  await expect(page.locator(".chord-note-marker")).toHaveCount(5);

  await page.getByLabel("Root note").selectOption("11");
  await expect(
    page.getByRole("heading", { name: "B", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Low-A root shape" }),
  ).toBeVisible();
  await expect(page.getByText("Root at fret")).toContainText("2");
  await expect(page.locator(".chord-note-marker")).toHaveCount(5);

  await page.getByLabel("Root note").selectOption("7");
  await page.getByLabel("Chord quality").selectOption("dominant7");

  await expect(
    page.getByRole("heading", { name: "G7", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Chord formula")).toContainText("♭7");
  await expect(page.getByRole("heading", { name: "Open G7" })).toBeVisible();
  await expect(page.getByText("Open position", { exact: true })).toBeVisible();
  await expect(page.locator(".chord-note-marker.root-note")).toHaveCount(2);

  await page.getByText("Degrees", { exact: true }).click();
  await expect(page.locator(".chord-note-marker").first()).toContainText(
    /1|3|5|♭7/,
  );
});

test("chord diagram and mode controls are keyboard accessible", async ({
  page,
}) => {
  await openChordExplorer(page);
  const diagram = page.getByLabel(/chord diagram/);
  await expect(diagram).toBeVisible();
  await diagram.focus();
  await expect(diagram).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Scale explorer" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: "Previous chord voicing" }),
  ).toHaveText("←");
  await expect(
    page.getByRole("button", { name: "Next chord voicing" }),
  ).toHaveText("→");
});

test("cycles alternate chord voicings and saves the selected shape", async ({
  page,
}) => {
  await openChordExplorer(page);
  await expect(page.getByText("1 of 5", { exact: true })).toBeVisible();

  const nextVoicing = page.getByRole("button", {
    name: "Next chord voicing",
  });
  await nextVoicing.click();
  await expect(
    page.getByRole("heading", { name: "Low-A root shape" }),
  ).toBeVisible();
  await nextVoicing.click();
  await nextVoicing.click();
  await expect(
    page.getByRole("heading", { name: "First inversion" }),
  ).toBeVisible();
  await expect(
    page.getByText("Upper-string voicing", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Add C to group" }).click();
  await expect(page).toHaveURL(/0.major.inversion-1/);
  await expect(
    page.getByLabel("Selected chord progression").locator(".compact-neck"),
  ).toHaveCount(1);

  await page.reload();
  await page.getByRole("button", { name: "View C" }).click();
  await expect(
    page.getByRole("heading", { name: "First inversion" }),
  ).toBeVisible();
});

test("compares consecutive chord voicings and exposes movement cues", async ({
  page,
}) => {
  await page.goto("/?tool=chords&chords=0.major,7.major,9.minor");
  const progression = page.getByLabel("Selected chord progression");
  await expect(progression.getByRole("listitem")).toHaveCount(3);

  const toggle = page.getByRole("button", { name: "Voice leading" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Voice-leading legend")).toBeVisible();
  await expect(progression.locator(".voice-leading-summary")).toHaveCount(2);
  await expect(
    progression.locator(".voice-leading-summary").first(),
  ).toContainText(/C.*G/);
  await expect(
    progression.locator(".compact-fret b.voice-held").first(),
  ).toBeVisible();
  await expect(
    progression.locator(".compact-fret b.voice-closest").first(),
  ).toBeVisible();
  await expect(progression.locator(".compact-neck").nth(1)).toHaveAttribute(
    "aria-label",
    /C to G: .*held.*smallest move/,
  );

  const layout = await page.evaluate(() => {
    const actionButtons = [
      ...document.querySelectorAll<HTMLElement>(
        ".chord-group-heading-actions button",
      ),
    ];
    const summaries = [
      ...document.querySelectorAll<HTMLElement>(".voice-leading-summary"),
    ];
    return {
      bodyOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      shortTouchTarget: actionButtons.some(
        (button) => button.getBoundingClientRect().height < 44,
      ),
      summaryOverflow: summaries.some(
        (summary) => summary.scrollWidth > summary.clientWidth,
      ),
    };
  });
  expect(layout.bodyOverflow).toBe(false);
  expect(layout.summaryOverflow).toBe(false);
  if (page.viewportSize()?.width && page.viewportSize()!.width <= 672) {
    expect(layout.shortTouchTarget).toBe(false);
  }

  await progression.getByRole("button", { name: "Move Am earlier" }).click();
  await expect(
    progression.locator(".voice-leading-summary").first(),
  ).toContainText(/C.*Am/);
});

test("builds an ordered chord group with compact playable fingerings", async ({
  page,
}, testInfo) => {
  await openChordExplorer(page);
  await expect(page.getByText(/Add chords above/)).toBeVisible();

  await page.getByRole("button", { name: "Add C to group" }).click();
  await page.getByLabel("Root note").selectOption("7");
  await page.getByLabel("Chord quality").selectOption("dominant7");
  await page.getByRole("button", { name: "Add G7 to group" }).click();
  await page.getByRole("button", { name: "Add G7 to group" }).click();

  const progression = page.getByLabel("Selected chord progression");
  await expect(progression.getByRole("listitem")).toHaveCount(3);
  await expect(progression.locator(".compact-neck")).toHaveCount(3);
  await expect(progression.getByRole("heading", { name: "C" })).toBeVisible();
  await expect(progression.getByRole("heading", { name: "G7" })).toHaveCount(2);
  await expect(page.locator("#chord-reorder-instructions")).toBeVisible();

  const firstCard = progression.getByRole("listitem").first();
  const firstHeader = firstCard.locator("header");
  await expect(firstCard).toHaveAttribute("aria-posinset", "1");
  await expect(firstCard).toHaveAttribute("aria-setsize", "3");
  await expect(firstHeader).toHaveAttribute(
    "aria-describedby",
    "chord-reorder-instructions",
  );
  await expect(firstHeader).toHaveAttribute(
    "aria-keyshortcuts",
    "ArrowLeft ArrowRight",
  );
  await page.getByRole("button", { name: "Clear group" }).focus();
  await page.keyboard.press("Tab");
  await expect(firstHeader).toBeFocused();
  await expect(firstHeader).toHaveCSS("outline-style", "solid");

  const viewportWidth = page.viewportSize()?.width ?? 0;
  for (const card of await progression.locator(".chord-group-card").all()) {
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth + 1);
  }

  if (testInfo.project.name === "mobile") {
    const actionHeights = await progression
      .locator(".chord-card-actions button")
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getBoundingClientRect().height),
      );
    expect(actionHeights.every((height) => height >= 44)).toBe(true);
    await progression.getByRole("button", { name: "Move C later" }).click();
    await progression.getByRole("button", { name: "Move C later" }).click();
  } else {
    await progression
      .locator(".chord-group-card header")
      .first()
      .dragTo(progression.getByRole("listitem").nth(2));
  }
  await expect(progression.getByRole("heading")).toHaveText(["G7", "G7", "C"]);

  await progression.getByRole("button", { name: "Move C earlier" }).click();
  await expect(progression.getByRole("heading")).toHaveText(["G7", "C", "G7"]);

  await progression.getByLabel(/Drag C at position 2/).press("ArrowLeft");
  await expect(progression.getByRole("heading")).toHaveText(["C", "G7", "G7"]);

  await page.getByRole("button", { name: "View C" }).click();
  await expect(
    page.getByRole("heading", { name: "C", exact: true }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Remove G7 at position 2" }).click();
  await expect(progression.getByRole("listitem")).toHaveCount(2);

  await page.getByRole("button", { name: "Clear group" }).click();
  await expect(progression).not.toBeVisible();
  await expect(page.getByText(/Add chords above/)).toBeVisible();
});

test("chord workspace interactions do not produce browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await openChordExplorer(page);
  await page.getByRole("button", { name: "Add C to group" }).click();
  await page.getByLabel("Root note").selectOption("7");
  await page.getByRole("button", { name: "Add G to group" }).click();

  const progression = page.getByLabel("Selected chord progression");
  await progression.getByLabel(/Drag G at position 2/).press("ArrowLeft");
  await progression
    .getByRole("button", { name: "Remove C at position 2" })
    .click();

  expect(errors).toEqual([]);
});

test("persists, restores, and shares an ordered chord group", async ({
  page,
}) => {
  await page.goto("/?tool=chords&chords=0.major,7.dominant7,9.minor");

  await expect(
    page.getByRole("button", { name: "Chord explorer" }),
  ).toHaveAttribute("aria-pressed", "true");
  const progression = page.getByLabel("Selected chord progression");
  await expect(progression.getByRole("heading")).toHaveText(["C", "G7", "Am"]);
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("music-power:chord-group:v1")),
    )
    .toBe("0.major,7.dominant7,9.minor");

  await progression.getByLabel(/Drag Am at position 3/).press("ArrowLeft");
  await expect(page).toHaveURL(/chords=0.major%2C9.minor%2C7.dominant7/);

  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.locator(".chord-group").getByRole("status")).toContainText(
    /Chord group link copied|Copy the current address/,
  );

  await page.reload();
  await expect(progression.getByRole("heading")).toHaveText(["C", "Am", "G7"]);

  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Chord explorer" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(progression.getByRole("heading")).toHaveText(["C", "Am", "G7"]);

  await page.getByRole("button", { name: "Clear group" }).click();
  await expect(page).not.toHaveURL(/chords=/);
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("music-power:chord-group:v1")),
    )
    .toBeNull();
});
