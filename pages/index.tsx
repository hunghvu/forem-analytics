import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Dashboard from "./components/Dashboard";
import CustomizedHeatMap from "./components/CustomizedHeatMap";

// const HeatMap = dynamic(() => import("./components/HeatMap"), { ssr: false });

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      {/* <Head></Head> */}

      <main className={styles.main}>
        <Dashboard />
        {/* <CustomizedHeatMap /> */}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
