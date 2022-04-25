/**
 * @author Hung Vu
 *
 * A section which shows analysis based on tags used in articles.
 */

// React
import { useEffect, useState } from "react";
import type { FC, SetStateAction, Dispatch } from "react";

// MUI library
import { Paper, Grid } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

// Utilities
import { AnalysisResult } from "../DataVisualizationSection";
import type { CustomizedDataGridProps } from "../../visualization/CustomizedDataGrid";

// Components
import CustomizedDataGrid from "../../visualization/CustomizedDataGrid";

interface ByTagsSectionProps {
  commentsByTagsWithoutOutliers: AnalysisResult[] | undefined;
  reactionsByTagsWithoutOutliers: AnalysisResult[] | undefined;
  zScore: number;
  minSampleSize: number;
  totalSampleSize: number;
  calculationMethod: string;
}

const generateDataGridFromTags = (
  dataByTagsWithoutOutliers: AnalysisResult[],
  headerName: string,
  setDataByTagsWithoutOutliers: Dispatch<SetStateAction<CustomizedDataGridProps | undefined>>
) => {
  const rows: any[] = [];
  const columns: GridColDef[] = [
    { field: "tag", headerName: "Tag name", minWidth: 200, flex: 1 },
    { field: "metric", headerName, maxWidth: 150, flex: 1 },
  ];
  let id = 1;
  dataByTagsWithoutOutliers.forEach((adjustedDataPoint) => {
    rows.push({
      id,
      tag: adjustedDataPoint.group,
      metric: adjustedDataPoint.metric,
    });
    id += 1;
  });
  setDataByTagsWithoutOutliers({
    rows,
    columns,
    sortField: "metric",
  });
};

const ByTagsSection: FC<ByTagsSectionProps> = ({
  commentsByTagsWithoutOutliers,
  reactionsByTagsWithoutOutliers,
  zScore,
  minSampleSize,
  totalSampleSize,
  calculationMethod,
}) => {
  const [dataByTagsForCommentsCount, setDataByTagsForCommentsCount] = useState<CustomizedDataGridProps>();
  const [dataByTagsForReactionsCount, setDataByTagsForReactionstsCount] = useState<CustomizedDataGridProps>();

  // Generate new tables upon changes
  useEffect(() => {
    if (commentsByTagsWithoutOutliers && reactionsByTagsWithoutOutliers) {
      generateDataGridFromTags(commentsByTagsWithoutOutliers, `# comments`, setDataByTagsForCommentsCount);
      generateDataGridFromTags(reactionsByTagsWithoutOutliers, `# reactions`, setDataByTagsForReactionstsCount);
    }
  }, [commentsByTagsWithoutOutliers, reactionsByTagsWithoutOutliers]);

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
        <h2>Comments and reactions summary based on tags 💬❤️🦄🔖</h2>
        <p>
          Total sample size = {totalSampleSize} | Z-score = {zScore} | Min sample size per tag = {minSampleSize} | Calculation method:{" "}
          {calculationMethod}
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
          {dataByTagsForCommentsCount ? <CustomizedDataGrid {...dataByTagsForCommentsCount} /> : null}
        </Grid>

        <Grid item xs={12} md={6}>
          {dataByTagsForReactionsCount ? <CustomizedDataGrid {...dataByTagsForReactionsCount} /> : null}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ByTagsSection;
