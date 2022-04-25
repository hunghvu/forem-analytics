/// <reference types="cypress" />

/**
 * @author Hung Vu
 *
 * Test outliers removing capabilities.
 */
import removeOutliers from "../../utils/RemoveOutliers";

const rawData = [
  {
    number: 68,
  },
  {
    number: 42,
  },
  {
    number: 33,
  },
  {
    number: 5,
  },
  {
    number: 61,
  },
];

describe("Remove outliers", () => {
  it("should have no outliers", () => {
    const result = removeOutliers(rawData, "number", 3);
    expect(result).to.eql(rawData);
  });
});

describe("Remove outliers", () => {
  it("should have 2 outliers", () => {
    const result = removeOutliers(rawData, "number", 1.12);
    console.log(result);
    expect(result).to.eql([{ number: 42 }, { number: 33 }, { number: 61 }]);
  });
});
