/**
 * @author Hung Vu
 */

import { Dispatch, SetStateAction, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';

const fetchPublishedArticlesSortedByPublishDate = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setArticles: Dispatch<SetStateAction<any[]>>
) => {
  const numberOfPage = 5; // default
  const articlesPerPage = 1000; // default
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
  setArticles(articles);
  setLoading(false);
};

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);

  return (
    <LoadingButton
      loading={loading}
      disabled={loading}
      startIcon={<PlayArrowOutlinedIcon/>}
      loadingPosition="start"
      variant="outlined"
      onClick={() =>
        fetchPublishedArticlesSortedByPublishDate(setLoading, setArticles)
      }
    >
      Fetch
    </LoadingButton>
  );
};

export default Dashboard;
