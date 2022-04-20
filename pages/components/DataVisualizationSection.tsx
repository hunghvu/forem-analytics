/**
 * @author Hung Vu
 */

// React
import { useEffect, useState } from "react";
import type { Dispatch, FC, SetStateAction } from "react";

// Utilities
import { format, parseISO } from "date-fns";
import { groupBy, sortBy, meanBy } from "lodash";

// Components
import CustomizedHeatMap from "./visualization/CustomizedHeatMap";
import { Grid } from "@mui/material";
import CustomizedLineChart from "./visualization/CustomizedLineChart";
import removeOutLiers from "../../utils/RemoveOutliers";

interface DataVisualizationSectionProps {
  articleList: any;
  zScore: number;
}

interface RawDataPoint {
  tagList: string[];
  commentsCount: number;
  positiveReactionsCount: number;
  publicReactionsCount: number; // Unused for now
  publishedAtHour: string;
  publishedAtDayOfWeek: string;
  readingTimeMinutes: number;
}

interface AnalysisResult {
  group: string;
  metric: number;
}

interface NivoHeatMapDataPoint {
  id: string; // hour
  data: {
    x: string; // day of week
    y: number;
  }[];
}

interface NivoLineChartDataPoint extends NivoHeatMapDataPoint {
  color: string;
}

const prepareData = (articleList: any[]): RawDataPoint[] => {
  let numberOfPages = 0;
  let articlesPerPage = 0;
  let data: RawDataPoint[] = [];
  while (articleList[numberOfPages]) {
    while (articleList[numberOfPages][articlesPerPage]) {
      let article = articleList[numberOfPages][articlesPerPage];
      // Parse ISO date to local browser timezone
      let publishedAtDate = parseISO(article["published_at"]);
      let publishedAtHour = format(publishedAtDate, "HH");
      let publishedAtDayOfWeek = format(publishedAtDate, "ccc");

      let rawDataPoint: RawDataPoint = {
        tagList: article["tag_list"],
        commentsCount: article["comments_count"],
        positiveReactionsCount: article["positive_reactions_count"],
        publicReactionsCount: article["public_reactions_count"], // Unused for now
        publishedAtHour,
        publishedAtDayOfWeek,
        readingTimeMinutes: article["reading_time_minutes"],
      };
      data.push(rawDataPoint);
      articlesPerPage += 1;
    }
    articlesPerPage = 1;
    numberOfPages += 1;
  }
  return data;
};

const analyze = (
  data: RawDataPoint[],
  zScore: number,
  setMeanCommentsByPublishedTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setMeanReactionsByPublishedTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setGroupByReadingTimeWithoutCommentsOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setGroupByReadingTimeWithoutReactionsOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>
) => {
  /**
   * For a given criteria, e.g., group by time slot, or group by reading time, return mean comments and reactions.
   * The results can differ based on a given data set. For example, a data set with comments count outliers removed
   * is different than a data set with reactions count outliers removed.
   *
   * @param adjustedDataSet Data set with outliers removed
   * @param metricName "commentsCount" or "positiveReactionsCount"
   * @param criteria To perform "group by"
   * @returns Mean comments and reactions
   */
  const getMeanOfMetricByCriteria = (
    adjustedDataSet: RawDataPoint[],
    metricName: "commentsCount" | "positiveReactionsCount",
    criteria: any
  ): AnalysisResult[] => {
    let result: AnalysisResult[] = [];
    const grouped = groupBy(adjustedDataSet, criteria);
    for (const [group, articleStat] of Object.entries(grouped)) {
      let meanOfMetric = meanBy(articleStat, (adjustedDataPoint) => adjustedDataPoint[metricName]);
      result.push({
        group,
        metric: parseFloat(meanOfMetric.toFixed(2)),
      });
    }
    return result;
  };

  // Remove outliers
  const commentsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "commentsCount", zScore) as RawDataPoint[];
  const reactionsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "positiveReactionsCount", zScore) as RawDataPoint[];

  const meanCommentsByPublishedTimeWithoutCommentsCountOutliers = getMeanOfMetricByCriteria(
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );
  setMeanCommentsByPublishedTimeWithoutOutliers(meanCommentsByPublishedTimeWithoutCommentsCountOutliers);

  const meanReactionsCountByPublishedTimeWithoutCommentsCountOutliers = getMeanOfMetricByCriteria(
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );

  setMeanReactionsByPublishedTimeWithoutOutliers(meanReactionsCountByPublishedTimeWithoutCommentsCountOutliers);

  const groupedByReadingTimeWithoutCommentsOutliers = getMeanOfMetricByCriteria(
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setGroupByReadingTimeWithoutCommentsOutliers(groupedByReadingTimeWithoutCommentsOutliers);

  const groupedByReadingTimeWithoutReactionsOutliers = getMeanOfMetricByCriteria(
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setGroupByReadingTimeWithoutReactionsOutliers(groupedByReadingTimeWithoutReactionsOutliers);
};

const generateNivoDataFromPublishedTime = (
  groupedData: AnalysisResult[],
  setMeanForMetric: Dispatch<SetStateAction<NivoHeatMapDataPoint[] | undefined>>
) => {
  const metricData: NivoHeatMapDataPoint[] = [];

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
  setMeanForMetric(sortBy(metricData, (adjustedDataPoint) => adjustedDataPoint.id));
};

const generateNivoDataFromReadingTime = (groupedData: AnalysisResult[], setData: Dispatch<SetStateAction<NivoLineChartDataPoint[] | undefined>>) => {
  let data: NivoLineChartDataPoint[] = [];
  groupedData.forEach((readingTime, index) => {
    if (index > 0) {
      data[0].data.push({
        x: readingTime.group,
        y: readingTime.meanComments,
      });
      data[1].data.push({
        x: readingTime.group,
        y: readingTime.meanReactions,
      });
    } else {
      data.push({
        id: "Mean comments",
        color: "hsl(132, 70%, 50%)",
        data: [
          {
            x: readingTime.group,
            y: readingTime.meanComments,
          },
        ],
      });
      data.push({
        id: "Mean reactions",
        color: "hsl(132, 70%, 50%)",
        data: [
          {
            x: readingTime.group,
            y: readingTime.meanReactions,
          },
        ],
      });
    }
  });
  setData(data);
};

const DataVisualizationSection: FC<DataVisualizationSectionProps> = ({ articleList, zScore }) => {
  // By published time
  const [meanCommentsByPublishedTimeWithoutOutliers, setMeanCommentsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [meanReactionsByPublishedTimeWithoutOutliers, setMeanReactionsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [heatMapDataForMeanCommentsCount, setHeatMapDataForMeanCommentsCount] = useState<NivoHeatMapDataPoint[]>();
  const [heatMapDataForMeanReactionsCount, setHeatMapDataForMeanReactionsCount] = useState<NivoHeatMapDataPoint[]>();

  // By reading time
  const [groupedByReadingTimeWithoutCommentsOutliers, setGroupByReadingTimeWithoutCommentsOutliers] = useState<AnalysisResult[]>();
  const [groupedByReadingTimeWithoutReactionsOutliers, setGroupByReadingTimeWithoutReactionsOutliers] = useState<AnalysisResult[]>();

  const [statByReadingTime, setStatByReadingTime] = useState<NivoLineChartDataPoint[]>();

  useEffect(() => {
    if (articleList && articleList.length > 0) {
      const data = prepareData(articleList);
      analyze(
        data,
        zScore,
        setMeanCommentsByPublishedTimeWithoutOutliers,
        setMeanReactionsByPublishedTimeWithoutOutliers,
        setGroupByReadingTimeWithoutCommentsOutliers,
        setGroupByReadingTimeWithoutReactionsOutliers
      );
    }
  }, [articleList]);

  useEffect(() => {
    if (meanCommentsByPublishedTimeWithoutOutliers && meanReactionsByPublishedTimeWithoutOutliers) {
      generateNivoDataFromPublishedTime(meanCommentsByPublishedTimeWithoutOutliers, setHeatMapDataForMeanCommentsCount);
      generateNivoDataFromPublishedTime(meanReactionsByPublishedTimeWithoutOutliers, setHeatMapDataForMeanReactionsCount);
    }
  }, [meanCommentsByPublishedTimeWithoutOutliers, meanReactionsByPublishedTimeWithoutOutliers]);

  useEffect(() => {
    if (groupedByReadingTimeWithoutReactionsOutliers) {
      generateNivoDataFromReadingTime(groupedByReadingTimeWithoutReactionsOutliers, setStatByReadingTime);
    }
  }, [groupedByReadingTimeWithoutReactionsOutliers]);

  return (
    // Spacing cause the root grid to overflow
    <Grid container component="section">
      <Grid item xs={12} lg={6}>
        {heatMapDataForMeanCommentsCount ? (
          <CustomizedHeatMap
            data={heatMapDataForMeanCommentsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title="Mean comments count by published time (outliers are removed)"
          />
        ) : null}
      </Grid>

      <Grid item xs={12} lg={6}>
        {heatMapDataForMeanReactionsCount ? (
          <CustomizedHeatMap
            data={heatMapDataForMeanReactionsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title="Mean reactions count by published time (outliers are removed)"
          />
        ) : null}
      </Grid>

      {/* <Grid item xs={12}>
        {statByReadingTime ? (
          <CustomizedLineChart
            data={statByReadingTime}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title="Mean comments count and mean reactions count by article reading time"
          />
        ) : null}
      </Grid> */}
    </Grid>
  );
};

export default DataVisualizationSection;
