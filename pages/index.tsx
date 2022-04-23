/**
 * @author Hung Vu
 *
 * Home page.
 */

// React
import { useEffect, useState } from "react";

// Next
import Head from "next/head";
import type { NextPage } from "next";

// MUI library
import { Box } from "@mui/material";
import { useTheme } from "@mui/material";

// Utilities
import fetchPublishedArticlesSortedByPublishDate from "../utils/FetchArticles";

// Components
import DataVisualizationSection from "./components/DataVisualizationSection";
import QueryOptionsSection from "./components/QueryOptionsSection";

const Home: NextPage = (props: any) => {
  const [articleList, setArticleList] = useState<any[]>([]);
  const theme = useTheme();
  useEffect(() => {
    setArticleList(props.articleList);
  }, []);
  return (
    <>
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
        <Box component="header" style={{ marginTop: 60, marginBottom: 70 }}>
          <h1 style={{ fontFamily: "Segoe UI Semibold", fontSize: "36px", fontWeight: 500 }}>
            Stats for "
            <a href="https://www.forem.com/" style={{ color: theme.palette.primary.main }}>
              Forem-based communities
            </a>
            "
          </h1>
        </Box>
        {/* Wrap the components below in a box break layout's responsiveness, not certain why */}
        <QueryOptionsSection setArticleList={setArticleList} />
        <DataVisualizationSection articleList={articleList} />
      </Box>
      <Box component="footer"></Box>
    </>
  );
};

export async function getStaticProps() {
  const articleList = await fetchPublishedArticlesSortedByPublishDate("https://dev.to/", "5", "1000");
  return { props: { articleList }, revalidate: 60 };
}

export default Home;
