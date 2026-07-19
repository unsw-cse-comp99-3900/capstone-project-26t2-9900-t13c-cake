const PRINT_AREA_ID = "results-print-area";

/** CAKE-14 — open the browser print dialog for the results summary */
export function printResults(): void {
  const printArea = document.getElementById(PRINT_AREA_ID);
  if (!printArea) {
    window.print();
    return;
  }

  window.print();
}

export { PRINT_AREA_ID };
