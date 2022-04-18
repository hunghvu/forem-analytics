/**
 * @author Hung Vu
 */
const numberOfPage = 5; // default
const articlesPerPage = 1000; // default

/**
 * Fetch pulished articles that are sorted by publish date.
 * @returns List of articles
 */
const fetchPublishedArticlesSortedByPublishDate = async () => {
  const articles = [];
  for (let i = 1; i <= numberOfPage; i++) {
    const response = await fetch(
      // FIXME: Seems like request will fail if there is not enough article?
      `https://dev.to/api/articles/latest?page=${i}&per_page=${articlesPerPage}`
    );
    const pageContent = await response.json();
    articles.push(pageContent);
  }
  return articles;
};

export default fetchPublishedArticlesSortedByPublishDate;
