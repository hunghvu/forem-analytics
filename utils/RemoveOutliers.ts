/**
 * @author Hung Vu
 */
import { meanBy } from "lodash";

/**
 * Remove outliers from a given array of arbitrary objects with a given Z score.
 * @param dataSet A data set to be analyzed
 * @param chosenPropertyName Name of an object's property which has outliers to be removed.
 * @returns A new data set with outliers removed. For example, "speed" in {car.speed}
 */
const removeOutLiers = (dataSet: any[], chosenPropertyName: string, zScore: number) => {
  try {
    if (!dataSet || dataSet.length === 0) {
      throw "Invalid data set.";
    } else if (!dataSet[0][chosenPropertyName] === undefined) {
      // Only undefined, as !0 === true
      throw "An element of given data does not contain chosen property name.";
    }

    // 4 loops, may result lower performance, but cleaner code
    const outliersRemoved: any[] = [];
    const mean = meanBy(dataSet, (rawDataPoint) => rawDataPoint[chosenPropertyName]);
    const standardDeviation = Math.sqrt(
      meanBy(dataSet, (rawDataPoint) => (rawDataPoint[chosenPropertyName] - mean) * (rawDataPoint[chosenPropertyName] - mean))
    );
    dataSet.forEach((rawDataPoint) => {
      if (
        ((rawDataPoint[chosenPropertyName] - mean) / standardDeviation >= -zScore &&
          (rawDataPoint[chosenPropertyName] - mean) / standardDeviation <= zScore) ||
        standardDeviation === 0
      ) {
        outliersRemoved.push(rawDataPoint);
      }
    });
    return outliersRemoved;
  } catch (error) {
    console.error(error);
  }
};

export default removeOutLiers;
