export default function calculateTime(startDate: any, endDate: any) {
    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);
    const millisecondsDiff =
      waktuResponDate.getTime() - createdAtDate.getTime();

    const secondsDiff = millisecondsDiff / 1000;
    const minutesDiff = Math.floor(secondsDiff / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);

    const formattedDifference = `${hoursDiff ? hoursDiff + ' hours ' : ''}${
      hoursDiff >= 1 ? '' : minutesDiff + ' minutes '
    } `;

    return formattedDifference; // Example format (YYYY-MM-DD)
  }