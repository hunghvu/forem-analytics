/**
 * @author Hung Vu
 *
 * Provide a data grid.
 */

// React
import { FC } from "react";

// MUI library
import { DataGrid } from "@mui/x-data-grid";
import type { GridRowsProp, GridColDef } from "@mui/x-data-grid";

export interface CustomizedDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  sortField: string;
}

const CustomizedDataGrid: FC<CustomizedDataGridProps> = ({ rows, columns, sortField }) => {
  return rows && columns ? (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        sorting: {
          sortModel: [{ field: sortField, sort: "desc" }],
        },
      }}
    />
  ) : null;
};

export default CustomizedDataGrid;
