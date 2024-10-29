export default function formatDateTimeNoConvert(dateString: any) {

    const [datePart, timePart] = dateString.split('T');

    // Extract the desired parts from the date and time strings
    const day = datePart.slice(8, 10);
    const month = datePart.slice(5, 7);
    const year = datePart.slice(0, 4);
    const hours = timePart.slice(0, 2);
    const minutes = timePart.slice(3, 5);

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}