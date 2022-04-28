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
import CustomizedLineChart from "../../visualization/CustomizedLineChart";

interface ByReadingTimeSectionProps {
  commentsByReadingTimeWithoutOutliers: AnalysisResult[] | undefined;
  reactionsByReadingTimeWithoutOutliers: AnalysisResult[] | undefined;
  zScore: number;
  minSampleSizePerGroup: number;
  totalSampleSize: number;
  calculationMethod: string;
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
  calculationMethod,
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
    <Grid container component="section" spacing={5}>
      <Grid item xs={12} lg={6}>
        {lineChartDataByReadingTimeForReactionsCount ? (
          <CustomizedLineChart
            data={lineChartDataByReadingTimeForReactionsCount}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title={`Reactions summary by reading time ❤️🦄🔖`}
            subtitle={`Sample size = ${totalSampleSize} | Z-score = ${zScore} | Minimal number of published articles per reading time = ${minSampleSizePerGroup} | Calculation method: ${calculationMethod}`}
            lineColor={"set1"}
          />
        ) : null}
      </Grid>
      <Grid item xs={12} lg={6}>
        {lineChartDataByReadingTimeForCommentsCount ? (
          <CustomizedLineChart
            data={lineChartDataByReadingTimeForCommentsCount}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title={`Comments summary by reading time 💬`}
            subtitle={`Sample size = ${totalSampleSize} | Z-score = ${zScore} | Minimal number of published articles per reading time = ${minSampleSizePerGroup} | Calculation method: ${calculationMethod}`}
            lineColor={"set3"}
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default ByReadingTimeSection;
