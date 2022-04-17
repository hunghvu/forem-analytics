/**
 * @author Hung Vu
 *
 * Provide customizable heatmap.
 */

// ResponsiveHeatMap is currently broken in @nivo 0.79.0: https://github.com/plouc/nivo/issues/1889
import { HeatMap } from "@nivo/heatmap";
import { FC } from "react";

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
}

const CustomizedHeatMap: FC<CustomizedHeatMapProps> = ({
  data,
  axisTopLegend,
  axisLeftLegend,
  axisRightLegend,
  title,
}) => {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        border: "1px",
        borderRadius: 16,
        // Equals to tailwinds shadow-lg
        boxShadow:
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        backgroundColor: "rgb(255, 255, 255)",
      }}
    >
      <header>
        <h2>{title}</h2>
      </header>
      <HeatMap
        data={data}
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
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
            length: 400,
            thickness: 8,
            tickSize: 12,
            title: "Value →",
          },
        ]}
        height={700}
        width={700}
      />
    </section>
  );
};

export default CustomizedHeatMap;
