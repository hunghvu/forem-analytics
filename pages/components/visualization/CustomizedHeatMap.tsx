/**
 * @author Hung Vu
 *
 * Provide customizable heatmap.
 */

// ResponsiveHeatMap SSR is currently broken in @nivo 0.79.0: https://github.com/plouc/nivo/issues/1889

// React
import type { FC } from "react";

// MUI library
import { Paper } from "@mui/material";

// Components
import { ResponsiveHeatMap } from "@nivo/heatmap";

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
}

const CustomizedHeatMap: FC<CustomizedHeatMapProps> = ({ data, axisTopLegend, axisLeftLegend, axisRightLegend, title, subtitle }) => {
  return (
    <Paper
      elevation={2}
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        border: "1px",
        borderRadius: 16,
        margin: 20,
        height: 700,
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
        <h3>{subtitle}</h3>
      </header>
      <ResponsiveHeatMap
        data={data}
        margin={{ top: 60, right: 70, bottom: 250, left: 70 }}
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
          scheme: "greens",
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
