import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import DataVisualizationSection from "./components/DataVisualizationSection";

// const HeatMap = dynamic(() => import("./components/HeatMap"), { ssr: false });

const Home: NextPage = () => {
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
        <DataVisualizationSection />
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
