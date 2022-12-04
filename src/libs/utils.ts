export function createISO8601(date: Date, time?: string): string {
    let phour = time.split(":")[0] || date.getHours(),
        pminute = time.split(":")[1] || date.getMinutes()

    let tempDate = new Date();
    tempDate.setDate(date.getDate());
    tempDate.setMonth(date.getMonth());
    tempDate.setFullYear(date.getFullYear());
    tempDate.setHours(Number(phour));
    tempDate.setMinutes(Number(pminute));
    tempDate.setSeconds(0);
    tempDate.setMilliseconds(0);

    let monthPlusOne: string | number = tempDate.getMonth() + 1;
    if(monthPlusOne < 10) {
        monthPlusOne = `0${monthPlusOne}`;
    }

    let day: string | number = tempDate.getDate();
    if(day < 10) {
        day = `0${day}`;
    }

    let hour: string | number = tempDate.getHours();
    if(hour < 10) {
        hour = `0${hour}`;
    }

    let min: string | number = tempDate.getMinutes();
    if(min < 10) {
        min = `0${min}`;
    }

    return [
        tempDate.getFullYear(), "-",
        monthPlusOne, "-",
        day, "T",
        hour, ":",
        min, ":",
        "00.000"
    ].join("");
}