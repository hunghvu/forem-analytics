/**
 * @author Hung Vu
 *
 * A section which shows analysis based on reading time of articles.
 */

// React
import { useEffect, useState } from "react";
import type { Dispatch, FC, SetStateAction } from "react";

// MUI library
import { Grid } from "@mui/material";

// Utilities
import { AnalysisResult } from "../DataVisualizationSection";

// Components
import CustomizedLineChart from "../visualization/CustomizedLineChart";

interface ByReadingTimeSectionProps {
  commentsByReadingTimeWithoutOutliers: AnalysisResult[] | undefined;
  reactionsByReadingTimeWithoutOutliers: AnalysisResult[] | undefined;
  zScore: number;
  minSampleSizePerGroup: number;
  totalSampleSize: number;
}

interface NivoLineChartDataPoint {
  id: string; // hour
  data: {
    x: string; // day of week
    y: number;
  }[];
  color: string;
}

const generateNivoDataFromReadingTime = (
  groupedData: AnalysisResult[],
  legendName: string,
  setData: Dispatch<SetStateAction<NivoLineChartDataPoint[] | undefined>>
) => {
  let data: NivoLineChartDataPoint[] = [];
  groupedData.forEach((readingTime, index) => {
    if (index > 0) {
      data[0].data.push({
        x: readingTime.group,
        y: readingTime.metric,
      });
    } else {
      data.push({
        id: legendName,
        color: "hsl(132, 70%, 50%)",
        data: [
          {
            x: readingTime.group,
            y: readingTime.metric,
          },
        ],
      });
    }
  });
  setData(data);
};

const ByReadingTimeSection: FC<ByReadingTimeSectionProps> = ({
  commentsByReadingTimeWithoutOutliers,
  reactionsByReadingTimeWithoutOutliers,
  zScore,
  minSampleSizePerGroup,
  totalSampleSize,
}) => {
  const [lineChartDataByReadingTimeForCommentsCount, setLineChartDataByReadingTimeForCommentsCount] = useState<NivoLineChartDataPoint[]>();
  const [lineChartDataByReadingTimeForReactionsCount, setLineChartDataByReadingTimeForReactionsCount] = useState<NivoLineChartDataPoint[]>();

  // Generate new line chart upon changes
  useEffect(() => {
    if (commentsByReadingTimeWithoutOutliers && reactionsByReadingTimeWithoutOutliers) {
      generateNivoDataFromReadingTime(commentsByReadingTimeWithoutOutliers, "Comments count", setLineChartDataByReadingTimeForCommentsCount);
      generateNivoDataFromReadingTime(reactionsByReadingTimeWithoutOutliers, "Reactions count", setLineChartDataByReadingTimeForReactionsCount);
    }
  }, [commentsByReadingTimeWithoutOutliers, reactionsByReadingTimeWithoutOutliers]);
  return (
    <Grid container component="section">
      <Grid item xs={12} lg={6}>
        {lineChartDataByReadingTimeForCommentsCount ? (
          <CustomizedLineChart
            data={lineChartDataByReadingTimeForCommentsCount}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title={`Comments count by reading time`}
            subtitle={`Sample size = ${totalSampleSize} | Z-score = ${zScore} | Min sample size per reading time = ${minSampleSizePerGroup}`}
          />
        ) : null}
      </Grid>
      <Grid item xs={12} lg={6}>
        {lineChartDataByReadingTimeForReactionsCount ? (
          <CustomizedLineChart
            data={lineChartDataByReadingTimeForReactionsCount}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title={`Reactions count by reading time`}
            subtitle={`Sample size = ${totalSampleSize} | Z-score = ${zScore} | Min sample size per reading time = ${minSampleSizePerGroup}`}
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default ByReadingTimeSection;
