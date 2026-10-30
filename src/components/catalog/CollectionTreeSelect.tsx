import { useState } from 'react';
import { Box, Flex, IconButton, Text } from 'theme-ui';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import BaseCheckbox from '../base/BaseCheckbox';
import ComponentLoader from '../loaders/ComponentLoader';
import type { CollectionOption } from '../../api/collectionApi';

// True if any selected collection sits somewhere below this one
const containsSelected = (option: CollectionOption, selectedIds: string[]): boolean =>
  option.children.some((child) => selectedIds.includes(child.id) || containsSelected(child, selectedIds));

interface TreeNodeProps {
  option: CollectionOption;
  level: number;
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
}

// One row of the list. Rows that have children can be expanded.
const TreeNode = ({ option, level, selectedIds, onToggle }: TreeNodeProps) => {
  // A branch that holds a selected collection starts open
  const [isExpanded, setIsExpanded] = useState(() => containsSelected(option, selectedIds));
  const hasChildren = option.children.length > 0;

  return (
    <Box>
      <Flex sx={{ alignItems: 'center', gap: 1, py: '6px', pl: `${level * 24}px` }}>
        <Box sx={{ width: 24, flexShrink: 0 }}>
          {hasChildren && (
            <IconButton
              type="button"
              aria-label={isExpanded ? `Collapse ${option.name}` : `Expand ${option.name}`}
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ width: 24, height: 24, p: 0 }}
            >
              {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </IconButton>
          )}
        </Box>

        <BaseCheckbox
          checked={selectedIds.includes(option.id)}
          label={option.name}
          onChange={(checked) => onToggle(option.id, checked)}
        />
      </Flex>

      {hasChildren &&
        isExpanded &&
        option.children.map((child) => (
          <TreeNode key={child.id} option={child} level={level + 1} selectedIds={selectedIds} onToggle={onToggle} />
        ))}
    </Box>
  );
};

interface CollectionTreeSelectProps {
  label: string;
  options: CollectionOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  isLoading?: boolean;
  error?: string;
}

// Several collections can be ticked in the list. The form checks how many may be saved.
const CollectionTreeSelect = ({ label, options, selectedIds, onChange, isLoading = false, error }: CollectionTreeSelectProps) => {
  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      onChange(selectedIds.includes(id) ? selectedIds : [...selectedIds, id]);
    } else {
      onChange(selectedIds.filter((item) => item !== id));
    }
  };

  return (
    <Box mb={2}>
      <Text sx={{ display: 'block', mb: 1, fontSize: 1, fontWeight: 500 }}>{label}</Text>

      <Box sx={{ maxHeight: 220, overflowY: 'auto', px: 2, py: 1, bg: 'white', borderRadius: 12, border: '1px solid', borderColor: error ? 'error' : 'transparent' }}>
        {isLoading && (
          <Flex sx={{ justifyContent: 'center', py: 3 }}>
            <ComponentLoader size={22} />
          </Flex>
        )}

        {!isLoading && options.length === 0 && (
          <Text sx={{ display: 'block', py: 2, px: 1, color: 'muted', fontSize: 1 }}>No collections available.</Text>
        )}

        {!isLoading &&
          options.map((option) => (
            <TreeNode key={option.id} option={option} level={0} selectedIds={selectedIds} onToggle={handleToggle} />
          ))}
      </Box>

      <Text sx={{ display: 'block', minHeight: 20, mt: 1, fontSize: 1, color: 'error' }}>{error}</Text>
    </Box>
  );
};

export default CollectionTreeSelect;