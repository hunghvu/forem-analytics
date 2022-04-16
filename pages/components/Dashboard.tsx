/**
 * @author Hung Vu
 */

const fetchPublishedArticlesSortedByPublishDate = async () => {
  const numberOfPage = 5; // default
  const articlesPerPage = 1000; // default

  const articles = [];

  for (let i = 1; i <= numberOfPage; i++) {
    const response = await fetch(
      `https://dev.to/api/articles/latest?page=${i}&per_page=${articlesPerPage}`
    );
    const pageContent = await response.json();
    articles.push(pageContent);
  }
};

const Dashboard = () => {
  return (
    <button onClick={fetchPublishedArticlesSortedByPublishDate}>Fetch</button>
  );
};

export default Dashboard;
