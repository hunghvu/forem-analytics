import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import fetchPublishedArticlesSortedByPublishDate from "../utils/FetchArticles";
import DataVisualizationSection from "./components/DataVisualizationSection";

const Home: NextPage = (props: any) => {
  return (
    <div className={styles.container}>
      {/* <Head></Head> */}

      <main className={styles.main}>
        <header style={{ padding: 16 }}>
          <h1 style={{ fontFamily: "Segoe UI Semibold", fontSize: "36px", fontWeight: 500 }}>
            Stats for "
            <a href="https://www.forem.com/" style={{ color: "#3b49df" }}>
              Forem-based communities
            </a>
            "
          </h1>
        </header>
        <DataVisualizationSection data={props.articleList} />
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export async function getServerSideProps() {
  const articleList = await fetchPublishedArticlesSortedByPublishDate("https://dev.to", 5, 1000);
  return { props: { articleList } };
}

export default Home;
