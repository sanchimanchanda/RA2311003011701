/**
 * FilterBar Component
 * 
 * Provides type filtering with toggle buttons for:
 * - All notifications
 * - Event
 * - Result
 * - Placement
 */

'use client';

import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  alpha,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  EventNote as EventIcon,
  EmojiEvents as ResultIcon,
  Work as PlacementIcon,
  ViewList as AllIcon,
} from '@mui/icons-material';
import { NotificationType } from '@/lib/types';
import { notificationTypeColors } from '@/theme/theme';
import { logger } from '@/lib/logger';

interface FilterBarProps {
  selectedType: NotificationType | null;
  onTypeChange: (type: NotificationType | null) => void;
}

const filterOptions: Array<{
  value: NotificationType | null;
  label: string;
  icon: React.ReactElement;
}> = [
  { value: null, label: 'All', icon: <AllIcon fontSize="small" /> },
  { value: 'Event', label: 'Event', icon: <EventIcon fontSize="small" /> },
  { value: 'Result', label: 'Result', icon: <ResultIcon fontSize="small" /> },
  { value: 'Placement', label: 'Placement', icon: <PlacementIcon fontSize="small" /> },
];

export default function FilterBar({ selectedType, onTypeChange }: FilterBarProps) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    const type = newValue as NotificationType | null;
    logger.info('component', `Filter changed to: ${type || 'All'}`);
    onTypeChange(type);
  };

  return (
    <Box
      id="filter-bar"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <FilterIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          Filter:
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={selectedType}
        exclusive
        onChange={handleChange}
        aria-label="Notification type filter"
        size="small"
        sx={{
          '& .MuiToggleButtonGroup-grouped': {
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '&:not(:first-of-type)': {
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
              ml: 0.5,
              borderRadius: '10px !important',
            },
            '&:first-of-type': {
              borderRadius: '10px !important',
            },
          },
        }}
      >
        {filterOptions.map((option) => {
          const typeColor = option.value
            ? notificationTypeColors[option.value]
            : null;

          return (
            <ToggleButton
              key={option.value || 'all'}
              value={option.value || ''}
              id={`filter-${option.value || 'all'}`}
              sx={{
                px: 2,
                py: 0.75,
                gap: 0.75,
                '&.Mui-selected': typeColor
                  ? {
                      backgroundColor: alpha(typeColor.text, 0.15),
                      borderColor: `${alpha(typeColor.text, 0.4)} !important`,
                      color: typeColor.text,
                      '&:hover': {
                        backgroundColor: alpha(typeColor.text, 0.25),
                      },
                    }
                  : {},
              }}
            >
              {option.icon}
              {option.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}
