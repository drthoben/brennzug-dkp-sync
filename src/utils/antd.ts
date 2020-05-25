export function getFileAsFileListFromEvent(event: any) {
  if (Array.isArray(event)) {
    return [event[0]];
  }

  return event
    ? [event.file]
    : [];
}
