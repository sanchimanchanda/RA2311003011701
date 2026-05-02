'use client';

import React from 'react';
import {
  Box,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { logger } from '@/lib/logger';

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    logger.info('component', `Page changed to ${page}`);
    onPageChange(page);
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    logger.info('component', `Items per page changed to ${value}`);
    onItemsPerPageChange(value);
    onPageChange(1); // Reset to first page
  };

  return (
    <Box
      id="pagination-controls"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mt: 3,
        pt: 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Items per page */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Show:
        </Typography>
        <FormControl size="small" variant="outlined">
          <Select<number>
            id="items-per-page-select"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            sx={{
              minWidth: 70,
              '& .MuiSelect-select': {
                py: 0.75,
                fontSize: '0.85rem',
              },
            }}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          per page
        </Typography>
      </Box>

      {/* Page navigation */}
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        siblingCount={1}
      />

      {/* Current info */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 'fit-content' }}
      >
        Page {currentPage} of {totalPages} ({totalItems} items)
      </Typography>
    </Box>
  );
}
