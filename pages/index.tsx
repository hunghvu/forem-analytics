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
        <DataVisualizationSection />
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
