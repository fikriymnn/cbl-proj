export default function convertTimeStampToDate(datetime: any) {
  const dateObject = new Date(datetime);
  const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
  const month = (dateObject.getMonth() + 1).toString(); // Adjust for zero-based month
  const year = dateObject.getFullYear();
  const monthName = getMonthName(month);

  return `${day} / ${monthName} / ${year}  `; // Example format (YYYY-MM-DD)
}

function getMonthName(monthString: string) {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const monthNumber = parseInt(monthString);

  if (monthNumber < 1 || monthNumber > 12) {
    return 'Bulan tidak valid';
  } else {
    return months[monthNumber - 1];
  }
}
