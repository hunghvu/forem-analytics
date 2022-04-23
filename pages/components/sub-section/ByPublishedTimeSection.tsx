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
import CustomizedHeatMap from "../visualization/CustomizedHeatMap";

interface ByPublishedTimeSectionProps {
  commentsByPublishedTimeWithoutOutliers: AnalysisResult[] | undefined;
  reactionsByPublishedTimeWithoutOutliers: AnalysisResult[] | undefined;
  zScore: number;
  minSampleSizePerGroup: number;
  totalSampleSize: number;
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
    <Grid container component="section">
      <Grid item xs={12} lg={6}>
        {heatMapDataByPublishedTimeForCommentsCount ? (
          <CustomizedHeatMap
            data={heatMapDataByPublishedTimeForCommentsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title={"Comments count by published time"}
            subtitle={`Sample size = ${totalSampleSize} | Z-score = ${zScore} | Min sample size per time slot = ${minSampleSizePerGroup}`}
          />
        ) : null}
      </Grid>

      <Grid item xs={12} lg={6}>
        {heatMapDataByPublishedTimeForReactionsCount ? (
          <CustomizedHeatMap
            data={heatMapDataByPublishedTimeForReactionsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title={"Reactions count by published time"}
            subtitle={`Sample size = ${totalSampleSize} | Z-score = ${zScore} | Min sample size per time slot = ${minSampleSizePerGroup}`}
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default ByPublishedTimeSection;
