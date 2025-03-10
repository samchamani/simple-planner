type Classname = string | Record<string, boolean | undefined> | undefined;

export function classnames(...classnames: Classname[]) {
  const activeClassnames = classnames.reduce((prev, curr) => {
    if (typeof curr === "string" && curr !== "")
      return [...prev, curr as string];
    if (typeof curr === "object") {
      const activeClassnames = Object.keys(curr).filter((key) => !!curr[key]);
      return [...prev, ...activeClassnames];
    }
    return prev;
  }, [] as string[]);

  return activeClassnames.join(" ");
}

export function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * ONE_DAY);
}

export function getDaysList(start: Date, end: Date) {
  let [saveStart, saveEnd] =
    start.getTime() > end.getTime() ? [end, start] : [start, end];

  const list = [saveStart];
  const startTime = saveStart.getTime();
  const endTime = saveEnd.getTime();
  let day = 1;
  while (startTime + day * ONE_DAY < endTime) {
    list.push(new Date(startTime + day * ONE_DAY));
    day++;
  }
  list.push(saveEnd);
  return list;
}
