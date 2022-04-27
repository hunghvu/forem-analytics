/**
 * @author Hung Vu
 *
 * Home page.
 */

// React
import { useEffect, useState } from "react";

// Next
import Head from "next/head";

// Next
import type { NextPage } from "next";

// MUI library
import { Box } from "@mui/material";

// Utilities
import fetchPublishedArticlesSortedByPublishDate from "../utils/FetchArticles";

// Components
import DataVisualizationSection from "./components/main/DataVisualizationSection";
import QueryOptionsSection from "./components/main/QueryOptionsSection";
import FooterSection from "./components/footer/FooterSection";

const Home: NextPage = (props: any) => {
  const [articleList, setArticleList] = useState<any[]>([]);
  useEffect(() => {
    setArticleList(props.articleList);
  }, [props.articleList]);
  const favicon = "/favicon.png";
  const title = "Forem Analytics - Stats for Forem communities";
  const description =
    "Forem Analytics lets you keep up with the trends across Forem communities by tracking the comment and reaction counts grouped by different metrics.";
  const url = "https://foremanalytics.sdeproject.com";
  const socialImage = "/social-image.png";
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="canonical" href={url} />
        <link rel="icon" type="image/png" href={favicon} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta name="image" property="og:image" content={socialImage} />
        <link rel="icon" type="image/png" href={favicon} />
        <meta name="theme-color" content="#f5f5f5" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={socialImage} />
      </Head>
      <Box
        component="main"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: 20,
        }}
        gap={4}
      >
        <Box component="header" style={{ marginTop: 60, marginBottom: 70 }}>
          <h1>
            Forem Analytics - Stats for &quot;<a href="https://www.forem.com/">Forem communities</a>&quot;
          </h1>
        </Box>
        {/* Wrap the components below in a box break layout's responsiveness, not certain why */}
        <QueryOptionsSection setArticleList={setArticleList} />
        <DataVisualizationSection articleList={articleList} />
      </Box>
      <FooterSection />
    </>
  );
};

export async function getStaticProps() {
  const articleList = await fetchPublishedArticlesSortedByPublishDate("https://dev.to/", "1", "30");
  return { props: { articleList }, revalidate: 180 };
}

export default Home;
