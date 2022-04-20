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
}
interface RawDataPoint {
  tagOne: string | undefined;
  tagTwo: string | undefined;
  tagThree: string | undefined;
  tagFour: string | undefined;
  commentsCount: number;
  positiveReactionsCount: number;
  publicReactionsCount: number; // Unused for now
  publishedAtHour: string;
  publishedAtDayOfWeek: string;
  readingTimeMinutes: number;
}

interface AnalysisResult {
  group: string;
  meanComments: number;
  meanReactions: number;
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

      let tagList = article["tag_list"];
      let rawDataPoint: RawDataPoint = {
        tagOne: tagList ? tagList[0] : undefined,
        tagTwo: tagList ? tagList[1] : undefined,
        tagThree: tagList ? tagList[2] : undefined,
        tagFour: tagList ? tagList[3] : undefined,
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
  setGroupByPublishedTime: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setGroupByReadingTime: Dispatch<SetStateAction<AnalysisResult[] | undefined>>
) => {
  const getMeanCommentsAndReactionsByCriteria = (adjustedDataSet: RawDataPoint[], criteria: any): AnalysisResult[] => {
    let result: AnalysisResult[] = [];
    const grouped = groupBy(adjustedDataSet, criteria);
    for (const [group, articleStat] of Object.entries(grouped)) {
      let meanComments = meanBy(articleStat, (adjustedDataPoint) => adjustedDataPoint.commentsCount);
      let meanReactions = meanBy(articleStat, (adustedDataPoint) => adustedDataPoint.positiveReactionsCount);
      result.push({
        group,
        meanComments: parseFloat(meanComments.toFixed(2)),
        meanReactions: parseFloat(meanReactions.toFixed(2)),
      });
    }
    return result;
  };
  // Remove outliers with z-score = 3
  const commentsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "commentsCount", 3) as RawDataPoint[];
  const reactionsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "positiveReactionsCount", 3) as RawDataPoint[];

  const groupedByPublishedTime = getMeanCommentsAndReactionsByCriteria(
    commentsCountOutliersRemoved,
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );
  const groupedByReadingTime = getMeanCommentsAndReactionsByCriteria(reactionsCountOutliersRemoved, (item: RawDataPoint) => item.readingTimeMinutes);

  setGroupByPublishedTime(groupedByPublishedTime);
  setGroupByReadingTime(groupedByReadingTime);
};

const generateNivoDataFromPublishedTime = (
  groupedData: AnalysisResult[],
  setMeanComments: Dispatch<SetStateAction<NivoHeatMapDataPoint[] | undefined>>,
  setMeanReactions: Dispatch<SetStateAction<NivoHeatMapDataPoint[] | undefined>>
) => {
  const meanCommentsData: NivoHeatMapDataPoint[] = [];
  const meanReactionsData: NivoHeatMapDataPoint[] = [];

  groupedData?.forEach((timeSlot) => {
    const dayOfWeek = timeSlot.group.split(" ")[0];
    const hour = timeSlot.group.split(" ")[1];
    const idExistedInMeanCommentsData = meanCommentsData.filter((adjustedDataPoint) => adjustedDataPoint.id === hour)[0];
    if (idExistedInMeanCommentsData) {
      idExistedInMeanCommentsData.data.push({
        x: dayOfWeek,
        y: timeSlot.meanComments,
      });
    } else {
      meanCommentsData.push({
        id: hour,
        data: [
          {
            x: dayOfWeek,
            y: timeSlot.meanComments,
          },
        ],
      });
    }
    const idEexistedInMeanReactionssData = meanReactionsData.filter((adjustedDataPoint) => adjustedDataPoint.id === hour)[0];
    if (idEexistedInMeanReactionssData) {
      idEexistedInMeanReactionssData.data.push({
        x: dayOfWeek,
        y: timeSlot.meanComments,
      });
    } else {
      meanReactionsData.push({
        id: hour,
        data: [
          {
            x: dayOfWeek,
            y: timeSlot.meanReactions,
          },
        ],
      });
    }
  });
  setMeanComments(sortBy(meanCommentsData, (adjustedDataPoint) => adjustedDataPoint.id));
  setMeanReactions(sortBy(meanReactionsData, (adjustedDataPoint) => adjustedDataPoint.id));
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

const DataVisualizationSection: FC<DataVisualizationSectionProps> = ({ articleList }) => {
  const [groupedByPublishedTime, setGroupByPublishedTime] = useState<AnalysisResult[]>();
  const [groupedByReadingTime, setGroupByReadingTime] = useState<AnalysisResult[]>();

  const [meanCommentsByPublishedTime, setMeanCommentsByPublishedTime] = useState<NivoHeatMapDataPoint[]>();
  const [meanReactionsByPublishedTime, setMeanReactionsByPublishedTime] = useState<NivoHeatMapDataPoint[]>();

  const [statByReadingTime, setStatByReadingTime] = useState<NivoLineChartDataPoint[]>();

  useEffect(() => {
    if (articleList && articleList.length > 0) {
      const data = prepareData(articleList);
      analyze(data, setGroupByPublishedTime, setGroupByReadingTime);
    }
  }, [articleList]);

  useEffect(() => {
    if (groupedByPublishedTime) {
      generateNivoDataFromPublishedTime(groupedByPublishedTime, setMeanCommentsByPublishedTime, setMeanReactionsByPublishedTime);
    }
  }, [groupedByPublishedTime]);

  useEffect(() => {
    if (groupedByReadingTime) {
      generateNivoDataFromReadingTime(groupedByReadingTime, setStatByReadingTime);
    }
  }, [groupedByReadingTime]);

  return (
    // Spacing cause the root grid to overflow
    <Grid container component="section">
      <Grid item xs={12} lg={6}>
        {meanCommentsByPublishedTime ? (
          <CustomizedHeatMap
            data={meanCommentsByPublishedTime}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title="Mean comments count by article published time"
          />
        ) : null}
      </Grid>

      <Grid item xs={12} lg={6}>
        {meanReactionsByPublishedTime ? (
          <CustomizedHeatMap
            data={meanReactionsByPublishedTime}
            axisTopLegend="Day of Week"
            axisLeftLegend="Hour"
            axisRightLegend="Hour"
            title="Mean reactions count by article published time"
          />
        ) : null}
      </Grid>

      <Grid item xs={12}>
        {statByReadingTime ? (
          <CustomizedLineChart
            data={statByReadingTime}
            axisLeftLegend="Count"
            axisBottomLegend="Reading time (minutes)"
            title="Mean comments count and mean reactions count by article reading time"
          />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default DataVisualizationSection;
