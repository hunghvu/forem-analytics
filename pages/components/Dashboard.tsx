/**
 * @author Hung Vu
 */

import { Dispatch, SetStateAction, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import { DataFrame } from "danfojs";

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

  // FIXME: Set state is async, so possible for race condition?
  setArticleList(articles);
  setLoading(false);
};

const prepareData = async (articleList: any[]) => {
  let data = [];

  for (let pageIndex = 0; pageIndex < numberOfPage; pageIndex++) {
    for (let articleIndex = 0; articleIndex < articlesPerPage; articleIndex++) {
      let article = articleList[pageIndex][articleIndex];
      let tagList = article["tag_list"];
      let metrics = {
        tagOne: tagList ? tagList[0] : undefined,
        tagTwo: tagList ? tagList[1] : undefined,
        tagThree: tagList ? tagList[2] : undefined,
        tagFour: tagList ? tagList[3] : undefined,
        commentsCount: article["comments_count"],
        positiveReactionCount: article["positive_reactions_count"],
        publicReactionCount: article["public_reactions_count"],
        publishedAt: article["published_at"],
        readingTimeMinutes: article["reading_time_minutes"],
      };
      data.push(metrics);
    }
  }

  let dataframe = new DataFrame(data);

};

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [articleList, setArticleList] = useState<any[]>([]);

  return (
    <LoadingButton
      loading={loading}
      disabled={loading}
      startIcon={<PlayArrowOutlinedIcon />}
      loadingPosition="start"
      variant="outlined"
      onClick={() => {
        fetchPublishedArticlesSortedByPublishDate(setLoading, setArticleList);
        prepareData(articleList);
      }}
    >
      Fetch
    </LoadingButton>
  );
};

export default Dashboard;
