/**
 * @author Hung Vu 
 * 
 * Home page.
 */
import { Box } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import fetchPublishedArticlesSortedByPublishDate from "../utils/FetchArticles";
import DataVisualizationSection from "./components/DataVisualizationSection";
import QueryOptionsSection from "./components/QueryOptionsSection";

const Home: NextPage = (props: any) => {
  return (
    <Box>
      {/* <Head></Head> */}

      <Box
        component="main"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box component="header" style={{ padding: 16 }}>
          <h1 style={{ fontFamily: "Segoe UI Semibold", fontSize: "36px", fontWeight: 500 }}>
            Stats for "
            <a href="https://www.forem.com/" style={{ color: "#3b49df" }}>
              Forem-based communities
            </a>
            "
          </h1>
        </Box>
        <QueryOptionsSection />
        {/* <DataVisualizationSection data={props.articleList} /> */}
      </Box>
      <Box component="footer"></Box>
    </Box>
  );
};

export async function getServerSideProps() {
  const articleList = await fetchPublishedArticlesSortedByPublishDate("https://dev.to", 5, 1000);
  return { props: { articleList } };
}

export default Home;
