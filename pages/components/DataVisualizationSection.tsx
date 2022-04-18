/**
 * @author Hung Vu
 */

// React
import { Dispatch, SetStateAction, useEffect, useState } from "react";

// MUI library
import LoadingButton from "@mui/lab/LoadingButton";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";

// Utilities
import { format, parseISO } from "date-fns";
import { groupBy, sortBy, meanBy } from "lodash";

// Components
import CustomizedHeatMap from "./visualization/CustomizedHeatMap";
import { Grid } from "@mui/material";
import CustomizedLineChart from "./visualization/CustomizedLineChart";
import removeOutLiers from "../../utils/RemoveOutliers";

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

const numberOfPage = 5; // default
const articlesPerPage = 1000; // default

const fetchPublishedArticlesSortedByPublishDate = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setArticleList: Dispatch<SetStateAction<any[]>>
) => {
  const articles = [];
  setLoading(true);

  for (let i = 1; i <= numberOfPage; i++) {
    const response = await fetch(
      // FIXME: Seems like request will fail if there is not enough article?
      `https://dev.to/api/articles/latest?page=${i}&per_page=${articlesPerPage}`
    );
    const pageContent = await response.json();
    articles.push(pageContent);
  }

  setArticleList(articles);
  setLoading(false);
};

const prepareData = (articleList: any[]): RawDataPoint[] => {
  let data: RawDataPoint[] = [];
  for (let pageIndex = 0; pageIndex < numberOfPage; pageIndex++) {
    for (let articleIndex = 0; articleIndex < articlesPerPage; articleIndex++) {
      let article = articleList[pageIndex][articleIndex];

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
    }
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

const DataVisualizationSection = () => {
  const [loading, setLoading] = useState(false);
  const [articleList, setArticleList] = useState<any[]>([]);

  const [groupedByPublishedTime, setGroupByPublishedTime] = useState<AnalysisResult[]>();
  const [groupedByReadingTime, setGroupByReadingTime] = useState<AnalysisResult[]>();

  const [meanCommentsByPublishedTime, setMeanCommentsByPublishedTime] = useState<NivoHeatMapDataPoint[]>();
  const [meanReactionsByPublishedTime, setMeanReactionsByPublishedTime] = useState<NivoHeatMapDataPoint[]>();

  const [statByReadingTime, setStatByReadingTime] = useState<NivoLineChartDataPoint[]>();

  useEffect(() => {
    if (articleList.length > 0) {
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
    <Grid container spacing={8}>
      <Grid item xs={12}>
        <LoadingButton
          loading={loading}
          disabled={loading}
          startIcon={<PlayArrowOutlinedIcon />}
          loadingPosition="start"
          variant="outlined"
          onClick={() => {
            fetchPublishedArticlesSortedByPublishDate(setLoading, setArticleList);
          }}
        >
          Fetch
        </LoadingButton>
      </Grid>

      <Grid item lg={6}>
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

      <Grid item lg={6}>
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
