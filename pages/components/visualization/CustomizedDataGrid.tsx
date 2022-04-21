/**
 * @author Hung Vu
 *
 * Provide a data grid.
 */

// React
import { FC } from "react";

// MUI library
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridRowsProp, GridColDef } from "@mui/x-data-grid";

export interface CustomizedDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
}

const CustomizedDataGrid: FC<CustomizedDataGridProps> = ({ rows, columns }) => {
  return (
    <Box component="section" style={{ height: 300, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </Box>
  );
};

export default CustomizedDataGrid;
