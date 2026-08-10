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
