export default function convertDateToTime(datetime: any) {
  const dateObject = new Date(datetime);

  const hours = dateObject.getHours().toString().padStart(2, '0');
  const minutes = dateObject.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`; // Example format (YYYY-MM-DD)
}
