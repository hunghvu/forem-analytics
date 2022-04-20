/**
 * @author Hung Vu
 */

// React
import { useEffect, useState } from "react";
import type { Dispatch, FC, SetStateAction } from "react";

// MUI library
import { Grid } from "@mui/material";

// Utilities
import { format, parseISO } from "date-fns";
import { groupBy, sortBy, meanBy } from "lodash";
import removeOutLiers from "../../utils/RemoveOutliers";

// Components
import CustomizedHeatMap from "./visualization/CustomizedHeatMap";
import CustomizedLineChart from "./visualization/CustomizedLineChart";

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

interface NivoheatMapDataByPublishedTimePoint {
  id: string; // hour
  data: {
    x: string; // day of week
    y: number;
  }[];
}

interface NivoLineChartDataPoint extends NivoheatMapDataByPublishedTimePoint {
  color: string;
}

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
  adjustedDataSet: any[],
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
  setMeanCommentsByReadingTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setMeanReactionsByReadingTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>
) => {
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

  const meanCommentsByReadingTimeWithoutOutliers = getMeanOfMetricByCriteria(
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setMeanCommentsByReadingTimeWithoutOutliers(meanCommentsByReadingTimeWithoutOutliers);

  const meanReactionsByReadingTimeWithoutOutliers = getMeanOfMetricByCriteria(
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setMeanReactionsByReadingTimeWithoutOutliers(meanReactionsByReadingTimeWithoutOutliers);

  const commentsCountBasedOnTags: { tag: string; commentsCount: number }[] = [];
  const reactionsCountBasedOnTags: { tag: string; positiveReactionsCount: number }[] = [];
  commentsCountOutliersRemoved.forEach((adjustedDataPoint) => {
    adjustedDataPoint.tagList.forEach((tag) => {
      commentsCountBasedOnTags.push({ tag, commentsCount: adjustedDataPoint.commentsCount });
    });
  });
  reactionsCountOutliersRemoved.forEach((adjustedDataPoint) => {
    adjustedDataPoint.tagList.forEach((tag) => {
      reactionsCountBasedOnTags.push({ tag, positiveReactionsCount: adjustedDataPoint.positiveReactionsCount });
    });
  });
  const meanCommentsCountBasedOnTagsWithoutOutliers = getMeanOfMetricByCriteria(
    commentsCountBasedOnTags,
    "commentsCount",
    (item: { tag: string; commentsCount: number }) => item.tag
  );
  const meanReactionsCountBasedOnTagsWithoutOutliers = getMeanOfMetricByCriteria(
    reactionsCountBasedOnTags,
    "positiveReactionsCount",
    (item: { tag: string; reactionsCount: number }) => item.tag
  );
};

const generateNivoDataFromPublishedTime = (
  groupedData: AnalysisResult[],
  setMeanForMetric: Dispatch<SetStateAction<NivoheatMapDataByPublishedTimePoint[] | undefined>>
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
  setMeanForMetric(sortBy(metricData, (adjustedDataPoint) => adjustedDataPoint.id));
};

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

const DataVisualizationSection: FC<DataVisualizationSectionProps> = ({ articleList, zScore }) => {
  // By published time
  const [meanCommentsByPublishedTimeWithoutOutliers, setMeanCommentsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [meanReactionsByPublishedTimeWithoutOutliers, setMeanReactionsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [heatMapDataByPublishedTimeForMeanCommentsCount, setheatMapDataByPublishedTimeForMeanCommentsCount] =
    useState<NivoheatMapDataByPublishedTimePoint[]>();
  const [heatMapDataByPublishedTimeForMeanReactionsCount, setheatMapDataByPublishedTimeForMeanReactionsCount] =
    useState<NivoheatMapDataByPublishedTimePoint[]>();

  // By reading time
  const [meanCommentsByReadingTimeWithoutOutliers, setMeanCommentsByReadingTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [meanReactionsByReadingTimeWithoutOutliers, setMeanReactionsByReadingTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [lineChartDataByReadingTimeForMeanCommentsCount, setLineChartDataByReadingTimeForMeanCommentsCount] = useState<NivoLineChartDataPoint[]>();
  const [lineChartDataByReadingTimeForMeanReactionsCount, setLineChartDataByReadingTimeForMeanReactionsCount] = useState<NivoLineChartDataPoint[]>();

  // const [statByReadingTime, setStatByReadingTime] = useState<NivoLineChartDataPoint[]>();

  // Analyze new article list upon changes
  useEffect(() => {
    if (articleList && articleList.length > 0) {
      const data = prepareData(articleList);
      analyze(
        data,
        zScore,
        setMeanCommentsByPublishedTimeWithoutOutliers,
        setMeanReactionsByPublishedTimeWithoutOutliers,
        setMeanCommentsByReadingTimeWithoutOutliers,
        setMeanReactionsByReadingTimeWithoutOutliers
      );
    }
  }, [articleList]);

  // Generate new heatmaps upon changes
  useEffect(() => {
    if (meanCommentsByPublishedTimeWithoutOutliers && meanReactionsByPublishedTimeWithoutOutliers) {
      generateNivoDataFromPublishedTime(meanCommentsByPublishedTimeWithoutOutliers, setheatMapDataByPublishedTimeForMeanCommentsCount);
      generateNivoDataFromPublishedTime(meanReactionsByPublishedTimeWithoutOutliers, setheatMapDataByPublishedTimeForMeanReactionsCount);
    }
  }, [meanCommentsByPublishedTimeWithoutOutliers, meanReactionsByPublishedTimeWithoutOutliers]);

  useEffect(() => {
    if (meanCommentsByReadingTimeWithoutOutliers && meanReactionsByReadingTimeWithoutOutliers) {
      generateNivoDataFromReadingTime(meanCommentsByReadingTimeWithoutOutliers, "Mean comments", setLineChartDataByReadingTimeForMeanCommentsCount);
      generateNivoDataFromReadingTime(
        meanReactionsByReadingTimeWithoutOutliers,
        "Mean reactions",
        setLineChartDataByReadingTimeForMeanReactionsCount
      );
    }
  }, [meanCommentsByReadingTimeWithoutOutliers, meanReactionsByReadingTimeWithoutOutliers]);

  return (
    // Spacing cause the root grid to overflow
    <Grid container component="section">
      <Grid item xs={12} lg={6}>
        {heatMapDataByPublishedTimeForMeanCommentsCount ? (
          <CustomizedHeatMap
            data={heatMapDataByPublishedTimeForMeanCommentsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title={`Mean comments count by published time (Z-score = ${zScore})`}
          />
        ) : null}
      </Grid>

      <Grid item xs={12} lg={6}>
        {heatMapDataByPublishedTimeForMeanReactionsCount ? (
          <CustomizedHeatMap
            data={heatMapDataByPublishedTimeForMeanReactionsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title={`Mean reactions count by published time (Z-score = ${zScore})`}
          />
        ) : null}
      </Grid>

      <Grid item xs={12} lg={6}>
        {lineChartDataByReadingTimeForMeanCommentsCount ? (
          <CustomizedLineChart
            data={lineChartDataByReadingTimeForMeanCommentsCount}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title={`Mean comments count by reading time (Z-score = ${zScore})`}
          />
        ) : null}
      </Grid>
      <Grid item xs={12} lg={6}>
        {lineChartDataByReadingTimeForMeanReactionsCount ? (
          <CustomizedLineChart
            data={lineChartDataByReadingTimeForMeanReactionsCount}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title={`Mean reactions count by reading time (Z-score = ${zScore})`}
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default DataVisualizationSection;
