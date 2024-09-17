export default function formatInteger(angka: number) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Format dengan titik
}
