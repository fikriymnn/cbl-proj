export default function formatInteger(
  angka: number | null | undefined,
): string {
  // Handle null, undefined, or non-numeric values
  if (angka === null || angka === undefined || isNaN(angka)) {
    return '0'; // or return '' for empty string, or '-' for dash
  }

  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Format dengan titik
}
