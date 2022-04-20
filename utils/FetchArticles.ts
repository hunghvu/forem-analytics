/**
 * @author Hung Vu
 */

/**
 * Fetch pulished articles that are sorted by publish date.
 *
 * @param url Link to the home page of community. Do not include "/" at the end
 * @param numberOfPage Number of pages to query
 * @param articlesPerPages Number of articles per page
 * @returns List of articles
 */
const fetchPublishedArticlesSortedByPublishDate = async (url: string, numberOfPages: string, articlesPerPage: string) => {
  try {
    const articles = [];
    for (let i = 1; i <= parseInt(numberOfPages); i++) {
      const response = await fetch(
        // For some reasons, if articles per page is too high, it can results in 502.
        `${url}api/articles/latest?page=${i}&per_page=${articlesPerPage}`
      );
      const pageContent = await response.json();
      articles.push(pageContent);
    }
    return articles;
  } catch (error) {
    console.error("Cannot fetch data from the community server.");
  }
};

export default fetchPublishedArticlesSortedByPublishDate;
