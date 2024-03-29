/**
 * @author Hung Vu
 *
 * A section which shows analysis based on published time of articles.
 */

// React
import { useEffect, useState } from "react";
import type { Dispatch, FC, SetStateAction } from "react";

// MUI library
import { Grid } from "@mui/material";

// Utilities
import { sortBy } from "lodash";
import { AnalysisResult } from "../DataVisualizationSection";

// Components
import CustomizedHeatMap from "../../visualization/CustomizedHeatMap";

interface ByPublishedTimeSectionProps {
  commentsByPublishedTimeWithoutOutliers: AnalysisResult[] | undefined;
  reactionsByPublishedTimeWithoutOutliers: AnalysisResult[] | undefined;
  zScore: number;
  minSampleSizePerGroup: number;
  totalSampleSize: number;
  calculationMethod: string;
}

interface NivoheatMapDataByPublishedTimePoint {
  id: string; // hour
  data: {
    x: string; // day of week
    y: number;
  }[];
}

const generateNivoDataFromPublishedTime = (
  groupedData: AnalysisResult[],
  setForMetric: Dispatch<SetStateAction<NivoheatMapDataByPublishedTimePoint[] | undefined>>
) => {
  const metricData: NivoheatMapDataByPublishedTimePoint[] = [];

  groupedData?.forEach((timeSlot) => {
    const dayOfWeek = timeSlot.group.split(" ")[0];
    const hour = timeSlot.group.split(" ")[1];
    const idExistedInMetricData = metricData.filter((adjustedDataPoint) => adjustedDataPoint.id === hour)[0];
    if (idExistedInMetricData) {
      idExistedInMetricData.data.push({
        x: dayOfWeek,
        y: timeSlot.metric,
      });
    } else {
      metricData.push({
        id: hour,
        data: [
          {
            x: dayOfWeek,
            y: timeSlot.metric,
          },
        ],
      });
    }
  });
  setForMetric(sortBy(metricData, (adjustedDataPoint) => adjustedDataPoint.id));
};

const ByPublishedTimeSection: FC<ByPublishedTimeSectionProps> = ({
  commentsByPublishedTimeWithoutOutliers,
  reactionsByPublishedTimeWithoutOutliers,
  zScore,
  minSampleSizePerGroup,
  totalSampleSize,
  calculationMethod,
}) => {
  const [heatMapDataByPublishedTimeForCommentsCount, setheatMapDataByPublishedTimeForCommentsCount] =
    useState<NivoheatMapDataByPublishedTimePoint[]>();
  const [heatMapDataByPublishedTimeForReactionsCount, setheatMapDataByPublishedTimeForReactionsCount] =
    useState<NivoheatMapDataByPublishedTimePoint[]>();

  // Generate new heatmaps upon changes
  useEffect(() => {
    if (commentsByPublishedTimeWithoutOutliers && reactionsByPublishedTimeWithoutOutliers) {
      generateNivoDataFromPublishedTime(commentsByPublishedTimeWithoutOutliers, setheatMapDataByPublishedTimeForCommentsCount);
      generateNivoDataFromPublishedTime(reactionsByPublishedTimeWithoutOutliers, setheatMapDataByPublishedTimeForReactionsCount);
    }
  }, [commentsByPublishedTimeWithoutOutliers, reactionsByPublishedTimeWithoutOutliers]);

  return (
    <Grid container component="section" spacing={5}>
      <Grid item xs={12} lg={6}>
        {heatMapDataByPublishedTimeForReactionsCount ? (
          <CustomizedHeatMap
            data={heatMapDataByPublishedTimeForReactionsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title={"Reactions summary by published time ❤️🦄🔖"}
            subtitle={`Sample size = ${totalSampleSize} | Z-score = ${zScore} | Minimal number of published articles per time slot = ${minSampleSizePerGroup} | Calculation method: ${calculationMethod} | In local time zone`}
            cellColor={"purples"}
          />
        ) : null}
      </Grid>
      <Grid item xs={12} lg={6}>
        {heatMapDataByPublishedTimeForCommentsCount ? (
          <CustomizedHeatMap
            data={heatMapDataByPublishedTimeForCommentsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title={"Comments summary by published time 💬"}
            subtitle={`Sample size = ${totalSampleSize} | Z-score = ${zScore} | Minimal number of published articles per time slot = ${minSampleSizePerGroup} | Calculation method: ${calculationMethod} | In local time zone`}
            cellColor={"blues"}
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default ByPublishedTimeSection;
