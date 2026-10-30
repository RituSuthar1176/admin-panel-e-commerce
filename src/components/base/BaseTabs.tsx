import type { ReactNode } from 'react';
import { Flex } from 'theme-ui';

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface BaseTabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

const BaseTabs = ({ tabs, activeKey, onChange }: BaseTabsProps) => {
  return (
    <Flex role="tablist" sx={{ bg: 'tableHead', borderBottom: '1px solid', borderColor: 'border', overflowX: 'auto' }}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 24px',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${isActive ? '#8b4533' : 'transparent'}`,
              color: isActive ? '#8b4533' : '#555555',
              opacity: tab.disabled ? 0.5 : 1,
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </Flex>
  );
};

export default BaseTabs;