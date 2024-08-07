export default function calculateElapsedTime(startTime: any, stopTime: Date) {
  const start = new Date(startTime);
  const diffInMs = stopTime.getTime() - start.getTime();
  // Convert milliseconds to your desired unit (minutes, hours)
  const elapsedTime = Math.round(diffInMs / 1000);
  console.log(elapsedTime); // Example: minutes
  return elapsedTime;
}
