export default function convertTimeStampToDateOnly(datetime: any) {
  const dateObject = new Date(datetime);
  const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
  const year = dateObject.getFullYear();

  return `${year}-${month}-${day}`; // Example format (YYYY-MM-DD)
}
