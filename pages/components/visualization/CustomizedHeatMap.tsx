/**
 * @author Hung Vu
 *
 * Provide customizable heatmap.
 */

// ResponsiveHeatMap SSR is currently broken in @nivo 0.79.0: https://github.com/plouc/nivo/issues/1889

// React
import type { FC } from "react";

// Next
import dynamic from "next/dynamic";

// MUI library
import { Paper } from "@mui/material";

// Components
const loader = import("@nivo/heatmap").then((lib) => lib.ResponsiveHeatMapCanvas);
const ResponsiveHeatMapCanvas = dynamic(loader, { ssr: false });

interface CustomizedHeatMapProps {
  data: {
    id: string;
    data: {
      x: string;
      y: number;
    }[];
  }[];
  axisTopLegend: string;
  axisLeftLegend: string;
  axisRightLegend: string;
  title: string;
  subtitle?: string;
  cellColor: "purples" | "blues";
}

const CustomizedHeatMap: FC<CustomizedHeatMapProps> = ({ data, axisTopLegend, axisLeftLegend, axisRightLegend, title, subtitle, cellColor }) => {
  return (
    <Paper
      elevation={2}
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        height: 750,
      }}
      component="section"
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      <ResponsiveHeatMapCanvas
        data={data}
        margin={{ top: 60, right: 70, bottom: 150, left: 70 }}
        axisTop={{
          legend: axisTopLegend,
          legendPosition: "middle",
          legendOffset: -50,
        }}
        axisRight={{
          legend: axisRightLegend,
          legendPosition: "middle",
          legendOffset: 50,
        }}
        axisLeft={{
          legend: axisLeftLegend,
          legendPosition: "middle",
          legendOffset: -50,
        }}
        colors={{
          type: "sequential",
          scheme: cellColor,
        }}
        emptyColor="#555555"
        legends={[
          {
            anchor: "bottom",
            translateX: 0,
            translateY: 30,
            length: 250,
            thickness: 8,
            tickSize: 12,
            title: "Value →",
          },
        ]}
      />
    </Paper>
  );
};

export default CustomizedHeatMap;
