import { buildResultsPdfFilename } from "./resultFormatters";
import { PRINT_AREA_ID } from "./printResults";

type ExportResultsPdfInput = {
  generatedAt?: Date;
};

type ProtectedBlock = {
  top: number;
  bottom: number;
};

export type PdfPageSlice = {
  start: number;
  end: number;
};

const EXPORT_WIDTH = 794;
const EXPORT_BOTTOM_PADDING = 56;
const NEAR_WHITE_THRESHOLD = 250;
const MIN_PAGE_FILL_RATIO = 0.35;

export function calculatePdfPageSlices(
  totalHeight: number,
  maxPageHeight: number,
  protectedBlocks: ProtectedBlock[],
): PdfPageSlice[] {
  if (totalHeight <= 0 || maxPageHeight <= 0) {
    return [];
  }

  const blocks = [...protectedBlocks].sort((left, right) => left.top - right.top);
  const slices: PdfPageSlice[] = [];
  let start = 0;

  while (start < totalHeight) {
    const targetEnd = Math.min(start + maxPageHeight, totalHeight);
    let end = targetEnd;

    if (targetEnd < totalHeight) {
      const crossingBlock = blocks.find(
        (block) => block.top < targetEnd && block.bottom > targetEnd,
      );

      if (
        crossingBlock &&
        crossingBlock.top - start >= maxPageHeight * MIN_PAGE_FILL_RATIO
      ) {
        end = crossingBlock.top;
      }
    }

    if (end <= start) {
      end = targetEnd;
    }

    slices.push({ start, end });
    start = end;
  }

  return slices;
}

export function findRenderedContentBottom(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): number {
  for (let y = height - 1; y >= 0; y -= 1) {
    const rowStart = y * width * 4;

    for (let x = 0; x < width; x += 1) {
      const offset = rowStart + x * 4;
      const alpha = pixels[offset + 3];

      if (
        alpha > 0 &&
        (pixels[offset] < NEAR_WHITE_THRESHOLD ||
          pixels[offset + 1] < NEAR_WHITE_THRESHOLD ||
          pixels[offset + 2] < NEAR_WHITE_THRESHOLD)
      ) {
        return y + 1;
      }
    }
  }

  return 0;
}

function prepareClone(source: HTMLElement): {
  staging: HTMLDivElement;
  clone: HTMLElement;
} {
  const staging = document.createElement("div");
  staging.className = "pdf-export-staging";
  staging.style.width = `${EXPORT_WIDTH}px`;

  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.setAttribute("aria-hidden", "true");

  clone
    .querySelectorAll<HTMLAnchorElement>(".result-card-link, .result-source-link")
    .forEach((link) => {
      link.removeAttribute("target");
      link.textContent = `${link.textContent?.trim() ?? "Source"} (${link.href})`;
    });

  staging.appendChild(clone);
  document.body.appendChild(staging);

  return { staging, clone };
}

function collectProtectedBlocks(root: HTMLElement): ProtectedBlock[] {
  const rootTop = root.getBoundingClientRect().top;

  return Array.from(
    root.querySelectorAll<HTMLElement>(".result-card-print, .results-disclaimer-print"),
  ).map((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      top: bounds.top - rootTop,
      bottom: bounds.bottom - rootTop,
    };
  });
}

function createPageImage(
  source: HTMLCanvasElement,
  start: number,
  end: number,
): HTMLCanvasElement {
  const page = document.createElement("canvas");
  page.width = source.width;
  page.height = Math.max(1, end - start);

  const context = page.getContext("2d");
  if (!context) {
    throw new Error("Unable to prepare the PDF page.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, page.width, page.height);
  context.drawImage(
    source,
    0,
    start,
    source.width,
    page.height,
    0,
    0,
    source.width,
    page.height,
  );

  return page;
}

function calculateRenderedContentHeight(
  canvas: HTMLCanvasElement,
  pixelRatio: number,
  maxPageHeight: number,
  fallbackHeight: number,
): number {
  const context = canvas.getContext("2d");
  if (!context || pixelRatio <= 0) {
    return fallbackHeight;
  }

  const contentBottom = findRenderedContentBottom(
    context.getImageData(0, 0, canvas.width, canvas.height).data,
    canvas.width,
    canvas.height,
  );
  if (contentBottom === 0) {
    return fallbackHeight;
  }

  const contentHeight = contentBottom / pixelRatio;
  const currentPageEnd = Math.ceil(contentHeight / maxPageHeight) * maxPageHeight;

  return Math.min(
    fallbackHeight,
    contentHeight + EXPORT_BOTTOM_PADDING,
    currentPageEnd,
  );
}

/** CAKE-14 - download the same results layout used by browser printing. */
export async function exportResultsPdf({
  generatedAt = new Date(),
}: ExportResultsPdfInput = {}): Promise<void> {
  const source = document.getElementById(PRINT_AREA_ID);
  if (!source) {
    throw new Error("Results are not available for export.");
  }

  const { staging, clone } = prepareClone(source);

  try {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxPageHeight = clone.offsetWidth * (pageHeight / pageWidth);
    const protectedBlocks = collectProtectedBlocks(clone);

    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      logging: false,
      scale: 2,
      useCORS: true,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: EXPORT_WIDTH,
    });
    const pixelRatio = canvas.height / clone.scrollHeight;
    const renderedContentHeight = calculateRenderedContentHeight(
      canvas,
      pixelRatio,
      maxPageHeight,
      clone.scrollHeight,
    );
    const slices = calculatePdfPageSlices(
      renderedContentHeight,
      maxPageHeight,
      protectedBlocks.filter((block) => block.top < renderedContentHeight),
    );

    slices.forEach((slice, index) => {
      const start = Math.round(slice.start * pixelRatio);
      const end = Math.min(canvas.height, Math.round(slice.end * pixelRatio));
      const pageCanvas = createPageImage(canvas, start, end);
      const renderedHeight = pageCanvas.height * (pageWidth / pageCanvas.width);

      if (index > 0) {
        doc.addPage();
      }

      doc.addImage(
        pageCanvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        pageWidth,
        renderedHeight,
        undefined,
        "FAST",
      );
    });

    doc.save(buildResultsPdfFilename(generatedAt));
  } finally {
    staging.remove();
  }
}
