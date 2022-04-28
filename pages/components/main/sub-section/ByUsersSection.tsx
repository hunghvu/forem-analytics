/**
 * @author Hung Vu
 *
 * A section which shows analysis based on users.
 */

// React
import { useEffect, useState } from "react";
import type { FC, SetStateAction, Dispatch } from "react";

// Next
import Image from "next/image";

// MUI library
import { Paper, Grid } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

// Utilities
import { AnalysisResult } from "../DataVisualizationSection";
import type { CustomizedDataGridProps } from "../../visualization/CustomizedDataGrid";

// Components
import CustomizedDataGrid from "../../visualization/CustomizedDataGrid";

interface ByUsersSectionProps {
  commentsByUsersWithoutOutliers: AnalysisResult[] | undefined;
  reactionsByUsersWithoutOutliers: AnalysisResult[] | undefined;
  zScore: number;
  minSampleSize: number;
  totalSampleSize: number;
  calculationMethod: string;
}

const generateDataGridFromUsers = (
  dataByUsersWithoutOutliers: AnalysisResult[],
  headerName: string,
  setDataByUsersWithoutOutliers: Dispatch<SetStateAction<CustomizedDataGridProps | undefined>>
) => {
  const rows: any[] = [];
  const columns: GridColDef[] = [
    {
      field: "social",
      headerName: "Social profile",
      flex: 1,
      renderCell: (params) => {
        return (
          <>
            {params.value.twitterUsername !== "null" && params.value.twitterUsername !== "undefined" ? (
              <a href={`https://twitter.com/${params.value.twitterUsername}`} style={{ marginLeft: 6 }}>
                <Image src={"/twitter.svg"} alt={"Twitter page"} width={20} height={20} />
              </a>
            ) : null}
            {params.value.githubUsername !== "null" && params.value.githubUsername !== "undefined" ? (
              <a href={`https://github.com/${params.value.githubUsername}`} style={{ marginLeft: 6 }}>
                <Image src={"/github.svg"} alt={"GitHub profile"} width={20} height={20} />
              </a>
            ) : null}
            {params.value.websiteUrl !== "null" && params.value.websiteUrl !== "undefined" ? (
              <a href={params.value.websiteUrl} style={{ marginLeft: 6 }}>
                <Image src={"/home.svg"} alt={"Personal website"} width={20} height={20} />
              </a>
            ) : null}
          </>
        );
      },
    },
    { field: "user", headerName: "Username", flex: 1 },
    { field: "metric", headerName, flex: 1 },
  ];
  let id = 1;
  dataByUsersWithoutOutliers.forEach((adjustedDataPoint) => {
    const splited = adjustedDataPoint.group.split(", ");
    const username = splited[1];
    const twitterUsername = splited[2];
    const githubUsername = splited[3];
    const websiteUrl = splited[4];
    rows.push({
      id,
      social: {
        twitterUsername,
        githubUsername,
        websiteUrl,
      },
      user: username,
      metric: adjustedDataPoint.metric,
    });
    id += 1;
  });
  setDataByUsersWithoutOutliers({
    rows,
    columns,
    sortField: "metric",
  });
};

const ByUsersSection: FC<ByUsersSectionProps> = ({
  commentsByUsersWithoutOutliers,
  reactionsByUsersWithoutOutliers,
  zScore,
  minSampleSize,
  totalSampleSize,
  calculationMethod,
}) => {
  const [dataByUsersForCommentsCount, setDataByUsersForCommentsCount] = useState<CustomizedDataGridProps>();
  const [dataByUsersForReactionsCount, setDataByUsersForReactionstsCount] = useState<CustomizedDataGridProps>();

  // Generate new tables upon changes
  useEffect(() => {
    if (commentsByUsersWithoutOutliers && reactionsByUsersWithoutOutliers) {
      generateDataGridFromUsers(commentsByUsersWithoutOutliers, `# comments`, setDataByUsersForCommentsCount);
      generateDataGridFromUsers(reactionsByUsersWithoutOutliers, `# reactions`, setDataByUsersForReactionstsCount);
    }
  }, [commentsByUsersWithoutOutliers, reactionsByUsersWithoutOutliers]);

  return (
    <Paper
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        width: "100%",
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
        <h2>Users ranking based on reactions and comments gained ❤️🦄🔖💬</h2>
        <p style={{ padding: 12 }}>
          Total sample size = {totalSampleSize} | Z-score = {zScore} | Minimal number of published articles per user = {minSampleSize} | Calculation
          method: {calculationMethod}
        </p>
      </header>
      <Grid
        container
        spacing={4}
        style={{
          height: 800,
          padding: 20,
        }}
      >
        <Grid item xs={12} md={6}>
          {dataByUsersForReactionsCount ? <CustomizedDataGrid {...dataByUsersForReactionsCount} /> : null}
        </Grid>
        <Grid item xs={12} md={6}>
          {dataByUsersForCommentsCount ? <CustomizedDataGrid {...dataByUsersForCommentsCount} /> : null}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ByUsersSection;
