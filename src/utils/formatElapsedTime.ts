export default function formatElapsedTime(seconds: number): string {
  // Ensure seconds is non-negative
  seconds = Math.max(0, seconds);

  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;

  const minutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsAfterMinutes = remainingSeconds % 60;

  // Use template literals and conditional operators for formatting
  let formattedTime = '';
  if (hours > 0) {
    formattedTime += `${hours} Jam :`; // Add hours if present
  }
  if (hours > 0 || minutes > 0) {
    // Only add minutes if hours are present or minutes are non-zero
    formattedTime += `${minutes.toString().padStart(2, '0')} Menit : `;
  }
  formattedTime += `${remainingSecondsAfterMinutes
    .toString()
    .padStart(2, '0')} Detik`;

  return formattedTime;
}
