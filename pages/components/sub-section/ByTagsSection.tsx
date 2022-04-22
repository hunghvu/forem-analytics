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
import type { CustomizedDataGridProps } from "../visualization/CustomizedDataGrid";

// Components
import CustomizedDataGrid from "../visualization/CustomizedDataGrid";

interface ByTagsSectionProps {
  commentsByTagsWithoutOutliers: AnalysisResult[] | undefined;
  reactionsByTagsWithoutOutliers: AnalysisResult[] | undefined;
  zScore: number;
}

const generateDataGridFromTags = (
  dataByTagsWithoutOutliers: AnalysisResult[],
  headerName: string,
  setDataByTagsWithoutOutliers: Dispatch<SetStateAction<CustomizedDataGridProps | undefined>>
) => {
  const rows: any[] = [];
  const columns: GridColDef[] = [
    { field: "col1", headerName: "Tag name", width: 300, flex: 1 },
    { field: "col2", headerName, width: 300, flex: 1 },
  ];
  let id = 1;
  dataByTagsWithoutOutliers.forEach((adjustedDataPoint) => {
    rows.push({
      id,
      col1: adjustedDataPoint.group,
      col2: adjustedDataPoint.metric,
    });
    id += 1;
  });
  setDataByTagsWithoutOutliers({
    rows,
    columns,
    sortField: "col2",
  });
};

const ByTagsSection: FC<ByTagsSectionProps> = ({ commentsByTagsWithoutOutliers, reactionsByTagsWithoutOutliers, zScore }) => {
  const [dataByTagsForCommentsCount, setDataByTagsForCommentsCount] = useState<CustomizedDataGridProps>();
  const [dataByTagsForReactionsCount, setDataByTagsForReactionstsCount] = useState<CustomizedDataGridProps>();

  // Generate new tables upon changes
  useEffect(() => {
    if (commentsByTagsWithoutOutliers && reactionsByTagsWithoutOutliers) {
      generateDataGridFromTags(commentsByTagsWithoutOutliers, `Comments count (Z-score = ${zScore})`, setDataByTagsForCommentsCount);
      generateDataGridFromTags(reactionsByTagsWithoutOutliers, `Reactions count (Z-score = ${zScore})`, setDataByTagsForReactionstsCount);
    }
  }, [commentsByTagsWithoutOutliers, reactionsByTagsWithoutOutliers]);

  return (
    <Paper
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        border: "1px",
        borderRadius: 16,
        margin: 20,
        minWidth: "97vw",
      }}
      component="section"
    >
      <header>
        <h2>Comments and reactions count based on tags (Z-score = {zScore})</h2>
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
