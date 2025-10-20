import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ReactNode } from "react";
import { ResourceRecord } from "../types";

export type Column = {
  key: string;
  label: string;
  render?: (row: ResourceRecord) => ReactNode;
};

type DataTableProps = {
  columns: Column[];
  rows: ResourceRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

const DataTable = ({ columns, rows, selectedId, onSelect, onDelete }: DataTableProps) => (
  <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "background.paper" }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.key as string}>{column.label}</TableCell>
          ))}
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          const isSelected = selectedId === row.id;
          return (
            <TableRow
              key={row.id}
              hover
              selected={isSelected}
              sx={{ cursor: "pointer" }}
              onClick={() => onSelect(row.id)}
            >
              {columns.map((column) => {
                const value = column.render
                  ? column.render(row)
                  : (row[column.key as keyof typeof row] as ReactNode);
                return <TableCell key={column.key}>{value ?? "—"}</TableCell>;
              })}
              <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                <IconButton size="small" color="error" onClick={() => onDelete(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length + 1} align="center">
              Aucune donnée pour le moment.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

export default DataTable;
