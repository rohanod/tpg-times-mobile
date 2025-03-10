// Removed the useSettings hook import as it shouldn't be used in a utility function

export const formatTime = (timestamp: string, timeFormat: 'minutes' | 'time') => {
  if (timeFormat === 'minutes') {
    const departureTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((departureTime - now) / 60000);
    return diffMinutes > 0 ? `${diffMinutes} min` : 'At the stop';
  }

  // 24-hour time format
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};