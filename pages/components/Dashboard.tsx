/**
 * @author Hung Vu
 */

// React
import { Dispatch, SetStateAction, useEffect, useState } from "react";

// UI library
import LoadingButton from "@mui/lab/LoadingButton";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";

// Utilities
import { format, parseISO } from "date-fns";
import { groupBy, sortBy } from "lodash";

// Components
import CustomizedHeatMap from "./CustomizedHeatMap";
import { Box } from "@mui/material";

interface RawMetrics {
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
      `https://dev.to/api/articles/latest?page=${i}&per_page=${articlesPerPage}`
    );
    const pageContent = await response.json();
    articles.push(pageContent);
  }

  setArticleList(articles);
  setLoading(false);
};

const prepareData = (articleList: any[]): RawMetrics[] => {
  let data: RawMetrics[] = [];
  for (let pageIndex = 0; pageIndex < numberOfPage; pageIndex++) {
    for (let articleIndex = 0; articleIndex < articlesPerPage; articleIndex++) {
      let article = articleList[pageIndex][articleIndex];

      // Parse ISO date to local browser timezone
      let publishedAtDate = parseISO(article["published_at"]);
      let publishedAtHour = format(publishedAtDate, "HH");
      let publishedAtDayOfWeek = format(publishedAtDate, "ccc");

      let tagList = article["tag_list"];
      let metrics: RawMetrics = {
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
      data.push(metrics);
    }
  }

  return data;
};

const analyze = (
  data: RawMetrics[],
  setGroupByPublishedTime: Dispatch<
    SetStateAction<AnalysisResult[] | undefined>
  >,
  setGroupByReadingTime: Dispatch<SetStateAction<AnalysisResult[] | undefined>>
) => {
  const getMeanCommentsAndReactionsByCriteria = (
    criteria: any
  ): AnalysisResult[] => {
    // Analyze by published time
    let result: AnalysisResult[] = [];
    const grouped = groupBy(data, criteria);
    for (const [group, articleStat] of Object.entries(grouped)) {
      let meanComments = 0;
      let meanReactions = 0;
      for (let i = 0; i < articleStat.length; i++) {
        meanComments += articleStat[i].commentsCount;
        meanReactions += articleStat[i].positiveReactionsCount;
        if (i === articleStat.length - 1) {
          meanComments /= articleStat.length;
          meanReactions /= articleStat.length;
        }
      }
      result.push({
        group,
        meanComments: parseFloat(meanComments.toFixed(2)),
        meanReactions: parseFloat(meanReactions.toFixed(2)),
      });
    }
    return result;
  };

  const groupedByPublishedTime = getMeanCommentsAndReactionsByCriteria(
    (item: RawMetrics) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );
  const groupedByReadingTime = getMeanCommentsAndReactionsByCriteria(
    (item: RawMetrics) => item.readingTimeMinutes
  );

  setGroupByPublishedTime(groupedByPublishedTime);
  setGroupByReadingTime(groupedByReadingTime);
};

const generateNivoDataFrom = (
  groupedData: AnalysisResult[],
  setMeanComments: Dispatch<SetStateAction<NivoHeatMapDataPoint[] | undefined>>,
  setMeanReactions: Dispatch<SetStateAction<NivoHeatMapDataPoint[] | undefined>>
) => {
  const meanCommentsData: NivoHeatMapDataPoint[] = [];
  const meanReactionsData: NivoHeatMapDataPoint[] = [];

  groupedData?.forEach((timeSlot) => {
    const dayOfWeek = timeSlot.group.split(" ")[0];
    const hour = timeSlot.group.split(" ")[1];
    const idExistedInMeanCommentsData = meanCommentsData.filter(
      (dataPoint) => dataPoint.id === hour
    )[0];
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
    const idEexistedInMeanReactionssData = meanReactionsData.filter(
      (dataPoint) => dataPoint.id === hour
    )[0];
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
  setMeanComments(sortBy(meanCommentsData, (dataPoint) => dataPoint.id));
  setMeanReactions(sortBy(meanReactionsData, (dataPoint) => dataPoint.id));
};

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [articleList, setArticleList] = useState<any[]>([]);

  const [groupedByPublishedTime, setGroupByPublishedTime] =
    useState<AnalysisResult[]>();
  const [groupedByReadingTime, setGroupByReadingTime] =
    useState<AnalysisResult[]>();

  const [meanCommentsByPublishedTime, setMeanCommentsByPublishedTime] =
    useState<NivoHeatMapDataPoint[]>();
  const [meanReactionsByPublishedTime, setMeanReactionsByPublishedTime] =
    useState<NivoHeatMapDataPoint[]>();

  const [meanCommentsByReadingTime, setMeanCommentsByReadingTime] =
    useState<NivoHeatMapDataPoint[]>();
  const [meanReactionsByReadingTime, setMeanReactionsByReadingTime] =
    useState<NivoHeatMapDataPoint[]>();

  useEffect(() => {
    if (articleList.length > 0) {
      const data = prepareData(articleList);
      analyze(data, setGroupByPublishedTime, setGroupByReadingTime);
    }
  }, [articleList]);

  useEffect(() => {
    if (groupedByPublishedTime) {
      generateNivoDataFrom(
        groupedByPublishedTime,
        setMeanCommentsByPublishedTime,
        setMeanReactionsByPublishedTime
      );
    }
  }, [groupedByPublishedTime]);

  useEffect(() => {
    if (groupedByReadingTime) {
      generateNivoDataFrom(
        groupedByReadingTime,
        setMeanCommentsByReadingTime,
        setMeanReactionsByReadingTime
      );
    }
  }, [groupedByReadingTime]);

  return (
    <Box>
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
      {/* {meanCommentsByPublishedTime ? <CustomizedHeatMap data={meanCommentsByPublishedTime}/>} */}
      {meanCommentsByPublishedTime ? (
        <CustomizedHeatMap
          data={meanCommentsByPublishedTime}
          axisTopLegend="Day of Week"
          axisLeftLegend="Hour"
          axisRightLegend="Hour"
          title="Mean comments count by article published time"
        />
      ) : null}
      {meanReactionsByPublishedTime ? (
        <CustomizedHeatMap
          data={meanReactionsByPublishedTime}
          axisTopLegend="Day of Week"
          axisLeftLegend="Hour"
          axisRightLegend="Hour"
          title="Mean reactions count by article published time"
        />
      ) : null}
      {meanCommentsByReadingTime ? (
        <CustomizedHeatMap
          data={meanCommentsByReadingTime}
          axisTopLegend="Day of Week"
          axisLeftLegend="Hour"
          axisRightLegend="Hour"
          title="Mean comments count by article reading time"
        />
      ) : null}
      {meanReactionsByReadingTime ? (
        <CustomizedHeatMap
          data={meanReactionsByReadingTime}
          axisTopLegend="Day of Week"
          axisLeftLegend="Hour"
          axisRightLegend="Hour"
          title="Mean comments reactions count by article reading time"
        />
      ) : null}
    </Box>
  );
};

export default Dashboard;
