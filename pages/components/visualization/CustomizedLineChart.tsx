/**
 * @author Hung Vu
 *
 * Provide customizable line chart.
 */

// ResponsiveLine SSR is currently broken in @nivo 0.79.0: https://github.com/plouc/nivo/issues/1889

// React
import { FC } from "react";

// MUI library
import { Paper } from "@mui/material";

// Components
import { ResponsiveLineCanvas } from "@nivo/line";

interface CustomizedLineChartProps {
  data: {
    id: string;
    data: {
      x: string;
      y: number;
    }[];
  }[];
  axisLeftLegend: string;
  axisBottomLegend: string;
  title: string;
  subtitle?: string;
}

const CustomizedLineChart: FC<CustomizedLineChartProps> = ({ data, axisLeftLegend, axisBottomLegend, title, subtitle }) => {
  return (
    <Paper
      elevation={2}
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        height: 500,
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
      <ResponsiveLineCanvas
        data={data}
        margin={{ top: 30, right: 15, bottom: 260, left: 60 }}
        axisBottom={{
          legend: axisBottomLegend,
          legendOffset: 35,
          legendPosition: "middle",
        }}
        axisLeft={{
          legend: axisLeftLegend,
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={10}
        colors={{
          scheme: "category10",
        }}
        legends={[
          {
            anchor: "top",
            direction: "column",
            justify: false,
            translateX: 20,
            translateY: 0,
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 16,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
          },
        ]}
      />
    </Paper>
  );
};

export default CustomizedLineChart;
