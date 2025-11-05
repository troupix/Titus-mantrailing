
interface GPXSegment {
    ele: string
    time: string
    $: Coordinates
}

interface Coordinates {
    lat: string
    lon: string
}

/**
 * Converts a duration in seconds to a string representation in minutes and seconds.
 * @param duration - The duration in seconds.
 * @returns A string representation of the duration in the format "X minutes Y seconds".
 */
export const durationInMinutesSeconds = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes} minutes ${seconds} secondes`;
}

/**
 * Converts degrees to radians.
 * @param deg - The angle in degrees.
 * @returns The angle in radians.
 */
const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
}

/**
 * Calculates the total distance between a series of points on the Earth's surface.
 * @param points - An array of latitude and longitude coordinates.
 * @returns The total distance in meters.
 */
const calculateDistance = (points: [number, number][]) => {
    // console.log(points) 
    let distance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const lat1 = points[i][0];
        const lon1 = points[i][1];
        const lat2 = points[i + 1][0];
        const lon2 = points[i + 1][1];
        const R = 6371; // Rayon de la Terre en kilomètres
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance += R * c; // Distance en kilomètres
    }
    return parseFloat((distance * 1000).toFixed(0));
}

/**
 * Calculate the maximum pace of all trails 
 * @param GPXSegment[] allTrails
 * @returns number in m/s
 * @example
 * calculateAllureMax(allTrails)
 * // returns 2.5
*/

export const calculatePaceMax = (allTrails: GPXSegment[]) => {
    let paceMax = 0;
    allTrails.forEach((trail:GPXSegment, index) => {
        if(index === 0) return;
        const distance = calculateDistance([[parseFloat(trail.$.lat),parseFloat(trail.$.lon)], [parseFloat(allTrails[index - 1].$.lat),parseFloat(allTrails[index - 1].$.lon)]]);
        // console.log(distance)
        const duration = new Date(trail.time).getTime()-  new Date(allTrails[index - 1].time).getTime();
        // console.log(duration)
        const pace = distance / (duration /1000);
        if (pace > paceMax) {
            paceMax = pace;
        }
    });
    return paceMax;
}

/**
 * Calculate the minimum pace of all trails
 * @param GPXSegment[] allTrails
 * @returns number in m/s
 * @example
 * calculateAllureMin(allTrails)
 * // returns 1.5
 */

export const calculatePaceMin = (allTrails: GPXSegment[]) => {
    let paceMin = Infinity;
    allTrails.forEach((trail:GPXSegment, index) => {
        if(index === 0) return;
        const distance = calculateDistance([[parseFloat(trail.$.lat),parseFloat(trail.$.lon)], [parseFloat(allTrails[index - 1].$.lat), parseFloat(allTrails[index - 1].$.lon)]]);
        const duration = new Date(trail.time).getTime()-  new Date(allTrails[index - 1].time).getTime();
        if (distance === 0 || duration === 0) return;
        const pace = distance / (duration /1000);
        if (pace < paceMin) {
            paceMin = pace;
        }
    });
    return paceMin;
}

/**
 * Calculate the average pace of all trails
 * @param GPXSegment[] allTrails
 * @returns number in m/s
 * @example
 * calculateAllureAverage(allTrails)
 * // returns 2
 */

export const calculatePaceAverage = (allTrails: GPXSegment[]) => {
    let paceSum = 0;
    allTrails.forEach((trail:GPXSegment, index) => {
        if(index === 0) return;
        const distance = calculateDistance([[parseFloat(trail.$.lat),parseFloat(trail.$.lon)], [parseFloat(allTrails[index - 1].$.lat), parseFloat(allTrails[index - 1].$.lon)]]);
        const duration = new Date(trail.time).getTime()-  new Date(allTrails[index - 1].time).getTime();
        const pace = distance / (duration /1000);
        paceSum += pace;
    });
    return paceSum / allTrails.length;
}

/**
 * Compare dog traces and runner traces to determine the deviation of the dog from the runner.
 * @param dogTrace - The trace of the dog
 * @param runnerTrace - The trace of the runner
 * @returns The deviation in percentage.
 * @example
 * compareTraces(dogTrace, runnerTrace)
 * // returns 10
*/
export const compareTraces = (dogTrace: GPXSegment[], runnerTrace: GPXSegment[]) => {
    let deviation = 0;
    // For each point of the runner, determine a circle with a radius equal to the distance to the next point
    const runnerCircles = runnerTrace.map((point, index) => {
        // eslint-disable-next-line array-callback-return
        if (index === runnerTrace.length - 1) return;
        const distance = calculateDistance([[parseFloat(point.$.lat), parseFloat(point.$.lon)], [parseFloat(runnerTrace[index + 1].$.lat), parseFloat(runnerTrace[index + 1].$.lon)]]);
        return {
            center: [parseFloat(point.$.lat), parseFloat(point.$.lon)] as [number, number],
            radius: distance * 2
        };
    }).filter((circle) => circle !== undefined);

    // For each point of the dog, determine if it is inside a runner's circle
    dogTrace.forEach((point) => {
        let isOutside = true;
        let minDistance = Infinity;
        runnerCircles.forEach((circle) => {
            if (circle) {
                const distance = calculateDistance([circle.center, [parseFloat(point.$.lat), parseFloat(point.$.lon)]]);
                if (distance < circle.radius) {
                    isOutside = false;
                } else {
                    const currentDeviation = distance - circle.radius;
                    if (currentDeviation < minDistance) {
                        minDistance = currentDeviation;
                    }
                }
            }
        });
        if (isOutside) {
            deviation += minDistance;
        }
    });

    return deviation;
};

/**
 * Determine if the runner trail contains a 90 degree change of direction.
 * @param runnerTrace - The trace of the runner
 * @returns True if the runner trail contains a 90 degree change of direction, false otherwise.
 * @example
 * changeOfDirection(runnerTrace)
 * // returns true
 */
export const changeOfDirection = (runnerTrace: GPXSegment[]) => {
    let changeOfDirection = false;
    runnerTrace.forEach((point, index) => {
        if (index >= runnerTrace.length - 3) return;
        const angle = calculateAngle([parseFloat(point.$.lat), parseFloat(point.$.lon)], [parseFloat(runnerTrace[index + 1].$.lat), parseFloat(runnerTrace[index + 1].$.lon)], [parseFloat(runnerTrace[index + 2].$.lat), parseFloat(runnerTrace[index + 2].$.lon)]);
        if (angle > 90 && angle < 270) {
            changeOfDirection = true;
        }
    });
    return changeOfDirection;
}
/**
 * Calculates the angle between three points on the Earth's surface.
 * @param point1 - The first point [latitude, longitude].
 * @param point2 - The second point [latitude, longitude].
 * @param point3 - The third point [latitude, longitude].
 * @returns The angle in degrees.
 */
function calculateAngle(point1: [number, number], point2: [number, number], point3: [number, number]) {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;
    const [lat3, lon3] = point3;

    const dLat1 = deg2rad(lat2 - lat1);
    const dLon1 = deg2rad(lon2 - lon1);
    const dLat2 = deg2rad(lat3 - lat2);
    const dLon2 = deg2rad(lon3 - lon2);

    const angle1 = Math.atan2(dLon1, dLat1);
    const angle2 = Math.atan2(dLon2, dLat2);

    let angle = angle2 - angle1;
    if (angle < 0) {
        angle += 2 * Math.PI;
    }

    return angle * (180 / Math.PI);
}

/**
 * Determine the difference of time between the start of the runner trace and the start of the dog trace.
 * @param dogTrace - The trace of the dog
 * @param runnerTrace - The trace of the runner
 * @returns The difference in seconds.
 * @example
 * compareTime(dogTrace, runnerTrace)
 * // returns 10
 */

export const compareTime = (dogTrace: GPXSegment[], runnerTrace: GPXSegment[]) => {
    const dogStartTime = new Date(dogTrace[0].time).getTime();
    const runnerStartTime = new Date(runnerTrace[0].time).getTime();
    console.log(dogStartTime, runnerStartTime, (dogStartTime - runnerStartTime) / 1000)
    return (dogStartTime - runnerStartTime) / 1000;
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper to format age
export function formatAge(birthDate: string): string {
  const age = calculateAge(birthDate);
  return age === 1 ? "1 an" : `${age} ans`;
}
