/**
 * @author Hung Vu
 */

// ResponsiveHeatMap is currently broken in @nivo 0.79.0
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
}

const CustomizedHeatMap: FC<CustomizedHeatMapProps> = ({data}) => {
  // const data = [
  //   {
  //     id: "Japan",
  //     data: [
  //       {
  //         x: "Train",
  //         y: -83239,
  //       },
  //       {
  //         x: "Subway",
  //         y: -70437,
  //       },
  //       {
  //         x: "Bus",
  //         y: -67023,
  //       },
  //       {
  //         x: "Car",
  //         y: -78102,
  //       },
  //       {
  //         x: "Boat",
  //         y: 5676,
  //       },
  //       {
  //         x: "Moto",
  //         y: -92831,
  //       },
  //       {
  //         x: "Moped",
  //         y: 25895,
  //       },
  //       {
  //         x: "Bicycle",
  //         y: 52095,
  //       },
  //       {
  //         x: "Others",
  //         y: -50113,
  //       },
  //     ],
  //   },
  //   {
  //     id: "France",
  //     data: [
  //       {
  //         x: "Train",
  //         y: -7620,
  //       },
  //       {
  //         x: "Subway",
  //         y: 91195,
  //       },
  //       {
  //         x: "Bus",
  //         y: 20010,
  //       },
  //       {
  //         x: "Car",
  //         y: 77732,
  //       },
  //       {
  //         x: "Boat",
  //         y: 31350,
  //       },
  //       {
  //         x: "Moto",
  //         y: -69905,
  //       },
  //       {
  //         x: "Moped",
  //         y: 61055,
  //       },
  //       {
  //         x: "Bicycle",
  //         y: 25228,
  //       },
  //       {
  //         x: "Others",
  //         y: -54763,
  //       },
  //     ],
  //   },
  //   {
  //     id: "US",
  //     data: [
  //       {
  //         x: "Train",
  //         y: -38594,
  //       },
  //       {
  //         x: "Subway",
  //         y: 70992,
  //       },
  //       {
  //         x: "Bus",
  //         y: -92717,
  //       },
  //       {
  //         x: "Car",
  //         y: 53478,
  //       },
  //       {
  //         x: "Boat",
  //         y: 63280,
  //       },
  //       {
  //         x: "Moto",
  //         y: -41958,
  //       },
  //       {
  //         x: "Moped",
  //         y: -95871,
  //       },
  //       {
  //         x: "Bicycle",
  //         y: 63933,
  //       },
  //       {
  //         x: "Others",
  //         y: 32660,
  //       },
  //     ],
  //   },
  //   {
  //     id: "Germany",
  //     data: [
  //       {
  //         x: "Train",
  //         y: 84898,
  //       },
  //       {
  //         x: "Subway",
  //         y: 43883,
  //       },
  //       {
  //         x: "Bus",
  //         y: 73812,
  //       },
  //       {
  //         x: "Car",
  //         y: -44792,
  //       },
  //       {
  //         x: "Boat",
  //         y: -29173,
  //       },
  //       {
  //         x: "Moto",
  //         y: -5725,
  //       },
  //       {
  //         x: "Moped",
  //         y: -46853,
  //       },
  //       {
  //         x: "Bicycle",
  //         y: 6951,
  //       },
  //       {
  //         x: "Others",
  //         y: -23575,
  //       },
  //     ],
  //   },
  //   {
  //     id: "Norway",
  //     data: [
  //       {
  //         x: "Train",
  //         y: -81079,
  //       },
  //       {
  //         x: "Subway",
  //         y: -74651,
  //       },
  //       {
  //         x: "Bus",
  //         y: -77016,
  //       },
  //       {
  //         x: "Car",
  //         y: 91050,
  //       },
  //       {
  //         x: "Boat",
  //         y: 44320,
  //       },
  //       {
  //         x: "Moto",
  //         y: 54263,
  //       },
  //       {
  //         x: "Moped",
  //         y: -1935,
  //       },
  //       {
  //         x: "Bicycle",
  //         y: 72389,
  //       },
  //       {
  //         x: "Others",
  //         y: -21060,
  //       },
  //     ],
  //   },
  //   {
  //     id: "Iceland",
  //     data: [
  //       {
  //         x: "Train",
  //         y: 52374,
  //       },
  //       {
  //         x: "Subway",
  //         y: -61768,
  //       },
  //       {
  //         x: "Bus",
  //         y: 62767,
  //       },
  //       {
  //         x: "Car",
  //         y: -48522,
  //       },
  //       {
  //         x: "Boat",
  //         y: -86732,
  //       },
  //       {
  //         x: "Moto",
  //         y: 99185,
  //       },
  //       {
  //         x: "Moped",
  //         y: 31363,
  //       },
  //       {
  //         x: "Bicycle",
  //         y: 19227,
  //       },
  //       {
  //         x: "Others",
  //         y: -59165,
  //       },
  //     ],
  //   },
  //   {
  //     id: "UK",
  //     data: [
  //       {
  //         x: "Train",
  //         y: -54048,
  //       },
  //       {
  //         x: "Subway",
  //         y: -54844,
  //       },
  //       {
  //         x: "Bus",
  //         y: 61265,
  //       },
  //       {
  //         x: "Car",
  //         y: 8996,
  //       },
  //       {
  //         x: "Boat",
  //         y: -47415,
  //       },
  //       {
  //         x: "Moto",
  //         y: -35277,
  //       },
  //       {
  //         x: "Moped",
  //         y: 71074,
  //       },
  //       {
  //         x: "Bicycle",
  //         y: -47251,
  //       },
  //       {
  //         x: "Others",
  //         y: 20055,
  //       },
  //     ],
  //   },
  //   {
  //     id: "Vietnam",
  //     data: [
  //       {
  //         x: "Train",
  //         y: -6390,
  //       },
  //       {
  //         x: "Subway",
  //         y: -47139,
  //       },
  //       {
  //         x: "Bus",
  //         y: 63021,
  //       },
  //       {
  //         x: "Car",
  //         y: -63818,
  //       },
  //       {
  //         x: "Boat",
  //         y: -66149,
  //       },
  //       {
  //         x: "Moto",
  //         y: -16305,
  //       },
  //       {
  //         x: "Moped",
  //         y: 99215,
  //       },
  //       {
  //         x: "Bicycle",
  //         y: -40253,
  //       },
  //       {
  //         x: "Others",
  //         y: -67179,
  //       },
  //     ],
  //   },
  // ];
  return (
    <HeatMap
      data={data}
      margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
      // valueFormat=">-.2s"
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -90,
        legend: "",
        legendOffset: 46,
      }}
      axisRight={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "country",
        legendPosition: "middle",
        legendOffset: 70,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "country",
        legendPosition: "middle",
        legendOffset: -72,
      }}
      colors={{
        type: "diverging",
        scheme: "red_yellow_blue",
        divergeAt: 0.5,
        minValue: -100000,
        maxValue: 100000,
      }}
      emptyColor="#555555"
      legends={[
        {
          anchor: "bottom",
          translateX: 0,
          translateY: 30,
          length: 400,
          thickness: 8,
          direction: "row",
          tickPosition: "after",
          tickSize: 3,
          tickSpacing: 4,
          tickOverlap: false,
          tickFormat: ">-.2s",
          title: "Value →",
          titleAlign: "start",
          titleOffset: 4,
        },
      ]}
      height={600}
      width={1000}
    />
  );
};

export default CustomizedHeatMap;
