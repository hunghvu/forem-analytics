/**
 * @author Hung Vu
 *
 * Provide customizable line chart.
 */

// ResponsiveLine is currently broken in @nivo 0.79.0: https://github.com/plouc/nivo/issues/1889

// React
import { FC } from "react";

// Components
import { Line } from "@nivo/line";

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
}

const CustomizedLineChart: FC<CustomizedLineChartProps> = ({
  data,
  axisLeftLegend,
  axisBottomLegend,
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
      <Line
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        axisBottom={{
          legend: axisBottomLegend,
          legendOffset: 35,
          legendPosition: "middle",
        }}
        axisLeft={{
          legend: axisLeftLegend,
          legendOffset: -50,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        height={700}
        width={700}
      />
    </section>
  );
};

export default CustomizedLineChart;
