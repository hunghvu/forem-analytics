/**
 * @author Hung Vu
 */

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import { format, parseISO } from "date-fns";
import { groupBy } from "lodash";

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

const numberOfPage = 5; // default
const articlesPerPage = 1000; //

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
  const getMeanCommentsAndReactionsByCriteria = (criteria: any) => {
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

  // console.log(groupedByReadingTime);
};

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [articleList, setArticleList] = useState<any[]>([]);
  const [groupedByPublishedTime, setGroupByPublishedTime] =
    useState<AnalysisResult[]>();

  const [groupedByReadingTime, setGroupByReadingTime] =
    useState<AnalysisResult[]>();

  useEffect(() => {
    if (articleList.length > 0) {
      const data = prepareData(articleList);
      analyze(data, setGroupByPublishedTime, setGroupByReadingTime);
    }
  }, [articleList]);

  return (
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
  );
};

export default Dashboard;
