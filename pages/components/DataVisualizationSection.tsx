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
import { groupBy, sortBy, sumBy } from "lodash";
import removeOutLiers from "../../utils/RemoveOutliers";
import type { CustomizedDataGridProps } from "./visualization/CustomizedDataGrid";

// Components
import CustomizedHeatMap from "./visualization/CustomizedHeatMap";
import CustomizedLineChart from "./visualization/CustomizedLineChart";
import type { GridColDef } from "@mui/x-data-grid";
import CustomizedDataGrid from "./visualization/CustomizedDataGrid";

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
 * For a given criteria, e.g., group by time slot, or group by reading time, return sum of comments and reactions.
 * The results can differ based on a given data set. For example, a data set with comments count outliers removed
 * is different than a data set with reactions count outliers removed.
 *
 * @param adjustedDataSet Data set with outliers removed
 * @param metricName "commentsCount" or "positiveReactionsCount"
 * @param criteria To perform "group by"
 * @returns  comments and reactions
 */
const getSumOfMetricByCriteria = (
  adjustedDataSet: any[],
  metricName: "commentsCount" | "positiveReactionsCount",
  criteria: any
): AnalysisResult[] => {
  let result: AnalysisResult[] = [];
  const grouped = groupBy(adjustedDataSet, criteria);
  for (const [group, articleStat] of Object.entries(grouped)) {
    let OfMetric = sumBy(articleStat, (adjustedDataPoint) => adjustedDataPoint[metricName]);
    result.push({
      group,
      metric: parseFloat(OfMetric.toFixed(2)),
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
  setCommentsByPublishedTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByPublishedTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setCommentsByReadingTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByReadingTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setCommentsByTagsWithOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByTagsWithOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>
) => {
  // Remove outliers
  const commentsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "commentsCount", zScore) as RawDataPoint[];
  const reactionsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "positiveReactionsCount", zScore) as RawDataPoint[];

  const CommentsByPublishedTimeWithoutCommentsCountOutliers = getSumOfMetricByCriteria(
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );
  setCommentsByPublishedTimeWithoutOutliers(CommentsByPublishedTimeWithoutCommentsCountOutliers);

  const ReactionsCountByPublishedTimeWithoutCommentsCountOutliers = getSumOfMetricByCriteria(
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );

  setReactionsByPublishedTimeWithoutOutliers(ReactionsCountByPublishedTimeWithoutCommentsCountOutliers);

  const CommentsByReadingTimeWithoutOutliers = getSumOfMetricByCriteria(
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setCommentsByReadingTimeWithoutOutliers(CommentsByReadingTimeWithoutOutliers);

  const ReactionsByReadingTimeWithoutOutliers = getSumOfMetricByCriteria(
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setReactionsByReadingTimeWithoutOutliers(ReactionsByReadingTimeWithoutOutliers);

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
  const CommentsCountByTagsWithoutOutliers = getSumOfMetricByCriteria(
    commentsCountBasedOnTags,
    "commentsCount",
    (item: { tag: string; commentsCount: number }) => item.tag
  );
  setCommentsByTagsWithOutliers(CommentsCountByTagsWithoutOutliers);

  const ReactionsCountByTagsWithoutOutliers = getSumOfMetricByCriteria(
    reactionsCountBasedOnTags,
    "positiveReactionsCount",
    (item: { tag: string; reactionsCount: number }) => item.tag
  );
  setReactionsByTagsWithOutliers(ReactionsCountByTagsWithoutOutliers);
};

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

const generateDataGridFromTags = (
  dataByTagsWithoutOutliers: AnalysisResult[],
  headerName: string,
  setDataByTagsWithoutOutliers: Dispatch<SetStateAction<CustomizedDataGridProps | undefined>>
) => {
  const rows: any[] = [];
  const columns: GridColDef[] = [
    { field: "col1", headerName: "Tag name", width: 300 },
    { field: "col2", headerName, width: 300 },
  ];
  let id = 1;
  dataByTagsWithoutOutliers.forEach((adjustedDataPoint) => {
    rows.push({
      id,
      col1: adjustedDataPoint.group,
      col2: adjustedDataPoint.metric,
    });
    id += 1;
  });
  setDataByTagsWithoutOutliers({
    rows,
    columns,
  });
};

const DataVisualizationSection: FC<DataVisualizationSectionProps> = ({ articleList, zScore }) => {
  // By published time
  const [CommentsByPublishedTimeWithoutOutliers, setCommentsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [ReactionsByPublishedTimeWithoutOutliers, setReactionsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [heatMapDataByPublishedTimeForCommentsCount, setheatMapDataByPublishedTimeForCommentsCount] =
    useState<NivoheatMapDataByPublishedTimePoint[]>();
  const [heatMapDataByPublishedTimeForReactionsCount, setheatMapDataByPublishedTimeForReactionsCount] =
    useState<NivoheatMapDataByPublishedTimePoint[]>();

  // By reading time
  const [CommentsByReadingTimeWithoutOutliers, setCommentsByReadingTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [ReactionsByReadingTimeWithoutOutliers, setReactionsByReadingTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [lineChartDataByReadingTimeForCommentsCount, setLineChartDataByReadingTimeForCommentsCount] = useState<NivoLineChartDataPoint[]>();
  const [lineChartDataByReadingTimeForReactionsCount, setLineChartDataByReadingTimeForReactionsCount] = useState<NivoLineChartDataPoint[]>();

  // By tags
  const [CommentsByTagsWithoutOutliers, setCommentsByTagsWithoutOutliers] = useState<AnalysisResult[]>();
  const [ReactionsByTagsWithoutOutliers, setReactionsByTagsWithoutOutliers] = useState<AnalysisResult[]>();
  const [dataByTagsForCommentsCount, setDataByTagsForCommentsCount] = useState<CustomizedDataGridProps>();
  const [dataByTagsForReactionsCount, setDataByTagsForReactionstsCount] = useState<CustomizedDataGridProps>();

  // const [statByReadingTime, setStatByReadingTime] = useState<NivoLineChartDataPoint[]>();

  // Analyze new article list upon changes
  useEffect(() => {
    if (articleList && articleList.length > 0) {
      const data = prepareData(articleList);
      analyze(
        data,
        zScore,
        setCommentsByPublishedTimeWithoutOutliers,
        setReactionsByPublishedTimeWithoutOutliers,
        setCommentsByReadingTimeWithoutOutliers,
        setReactionsByReadingTimeWithoutOutliers,
        setCommentsByTagsWithoutOutliers,
        setReactionsByTagsWithoutOutliers
      );
    }
  }, [articleList]);

  // Generate new heatmaps upon changes
  useEffect(() => {
    if (CommentsByPublishedTimeWithoutOutliers && ReactionsByPublishedTimeWithoutOutliers) {
      generateNivoDataFromPublishedTime(CommentsByPublishedTimeWithoutOutliers, setheatMapDataByPublishedTimeForCommentsCount);
      generateNivoDataFromPublishedTime(ReactionsByPublishedTimeWithoutOutliers, setheatMapDataByPublishedTimeForReactionsCount);
    }
  }, [CommentsByPublishedTimeWithoutOutliers, ReactionsByPublishedTimeWithoutOutliers]);

  // Generate new line chart upon changes
  useEffect(() => {
    if (CommentsByReadingTimeWithoutOutliers && ReactionsByReadingTimeWithoutOutliers) {
      generateNivoDataFromReadingTime(CommentsByReadingTimeWithoutOutliers, "Comments count", setLineChartDataByReadingTimeForCommentsCount);
      generateNivoDataFromReadingTime(ReactionsByReadingTimeWithoutOutliers, "Reactions count", setLineChartDataByReadingTimeForReactionsCount);
    }
  }, [CommentsByReadingTimeWithoutOutliers, ReactionsByReadingTimeWithoutOutliers]);

  // Generate new tables upon changes
  useEffect(() => {
    if (CommentsByTagsWithoutOutliers && ReactionsByTagsWithoutOutliers) {
      generateDataGridFromTags(CommentsByTagsWithoutOutliers, `Comments count (Z-score = ${zScore})`, setDataByTagsForCommentsCount);
      generateDataGridFromTags(ReactionsByTagsWithoutOutliers, `Reactions count (Z-score = ${zScore})`, setDataByTagsForReactionstsCount);
    }
  }, [CommentsByTagsWithoutOutliers, ReactionsByTagsWithoutOutliers]);

  return (
    // Spacing cause the root grid to overflow
    <Grid container component="section">
      <Grid item xs={12} lg={6}>
        {heatMapDataByPublishedTimeForCommentsCount ? (
          <CustomizedHeatMap
            data={heatMapDataByPublishedTimeForCommentsCount}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title={`Comments count by published time (Z-score = ${zScore})`}
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
            title={`Reactions count by published time (Z-score = ${zScore})`}
          />
        ) : null}
      </Grid>

      <Grid item xs={12} lg={6}>
        {lineChartDataByReadingTimeForCommentsCount ? (
          <CustomizedLineChart
            data={lineChartDataByReadingTimeForCommentsCount}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title={`Comments count by reading time (Z-score = ${zScore})`}
          />
        ) : null}
      </Grid>
      <Grid item xs={12} lg={6}>
        {lineChartDataByReadingTimeForReactionsCount ? (
          <CustomizedLineChart
            data={lineChartDataByReadingTimeForReactionsCount}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title={`Reactions count by reading time (Z-score = ${zScore})`}
          />
        ) : null}
      </Grid>
      <Grid item xs={12} lg={6}>
        {dataByTagsForCommentsCount ? (
          <CustomizedDataGrid rows={dataByTagsForCommentsCount.rows} columns={dataByTagsForCommentsCount.columns} />
        ) : null}
      </Grid>
      <Grid item xs={12} lg={6}>
        {dataByTagsForReactionsCount ? (
          <CustomizedDataGrid rows={dataByTagsForReactionsCount.rows} columns={dataByTagsForReactionsCount.columns} />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default DataVisualizationSection;
