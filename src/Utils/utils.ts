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
    return `${minutes} minutes ${seconds} seconds`;
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
    console.log(allTrails)
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
        console.log(pace)
        if (pace < paceMin) {
            paceMin = pace;
            console.log(paceMin)
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