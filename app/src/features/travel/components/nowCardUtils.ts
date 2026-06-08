export function getActionIcon(actionType: string): string {
  switch (actionType.toLowerCase()) {
    case 'sleep': return 'moon-outline';
    case 'seek bright light': return 'sunny-outline';
    case 'avoid light': return 'eye-off-outline';
    case 'caffeine ok': return 'cafe-outline';
    case 'caffeine cutoff': return 'cafe-outline';
    case 'take melatonin': return 'medical-outline';
    case 'nap': return 'bed-outline';
    default: return 'time-outline';
  }
}

export function getActionColor(actionType: string): string {
  switch (actionType.toLowerCase()) {
    case 'sleep': return '#6366f1';
    case 'seek bright light': return '#f59e0b';
    case 'avoid light': return '#6b7280';
    case 'caffeine ok': return '#92400e';
    case 'caffeine cutoff': return '#dc2626';
    case 'take melatonin': return '#7c3aed';
    case 'nap': return '#059669';
    default: return '#374151';
  }
}

export function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const min = parseInt(minutes);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeString;
  }
}
