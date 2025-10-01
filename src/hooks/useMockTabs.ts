import { useState, useEffect } from 'react';

export interface MockTab {
  id: string;
  venueName: string;
  tableName: string;
  itemsSubtotal: number;
  claimedSubtotal: number;
  unpaidToHost: number;
  status: 'OPEN' | 'PARTIALLY_PAID' | 'CLOSED';
  createdAt: string;
}

const generateMockTabs = (): MockTab[] => [
  {
    id: 'tab_001',
    venueName: 'TAO',
    tableName: 'Table 12',
    itemsSubtotal: 8550,
    claimedSubtotal: 4960,
    unpaidToHost: 1250,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'tab_002',
    venueName: 'Nobu',
    tableName: 'Table 7',
    itemsSubtotal: 12400,
    claimedSubtotal: 12400,
    unpaidToHost: 850,
    status: 'PARTIALLY_PAID',
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString()
  },
  {
    id: 'tab_003',
    venueName: 'Le Bernardin',
    tableName: 'Table 3',
    itemsSubtotal: 15600,
    claimedSubtotal: 15600,
    unpaidToHost: 0,
    status: 'CLOSED',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'tab_004',
    venueName: 'Eleven Madison Park',
    tableName: 'Table 15',
    itemsSubtotal: 9800,
    claimedSubtotal: 2940,
    unpaidToHost: 0,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  },
  {
    id: 'tab_005',
    venueName: 'The French Laundry',
    tableName: 'Table 9',
    itemsSubtotal: 18200,
    claimedSubtotal: 14560,
    unpaidToHost: 2100,
    status: 'PARTIALLY_PAID',
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString()
  },
  {
    id: 'tab_006',
    venueName: 'Per Se',
    tableName: 'Table 4',
    itemsSubtotal: 16800,
    claimedSubtotal: 16800,
    unpaidToHost: 0,
    status: 'CLOSED',
    createdAt: new Date(Date.now() - 1000 * 60 * 67).toISOString()
  },
  {
    id: 'tab_007',
    venueName: 'Blue Hill',
    tableName: 'Table 11',
    itemsSubtotal: 7200,
    claimedSubtotal: 3600,
    unpaidToHost: 450,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 'tab_008',
    venueName: 'Gramercy Tavern',
    tableName: 'Table 6',
    itemsSubtotal: 11300,
    claimedSubtotal: 9040,
    unpaidToHost: 1800,
    status: 'PARTIALLY_PAID',
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString()
  },
  {
    id: 'tab_009',
    venueName: 'Daniel',
    tableName: 'Table 2',
    itemsSubtotal: 13500,
    claimedSubtotal: 6750,
    unpaidToHost: 0,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'tab_010',
    venueName: 'Jean-Georges',
    tableName: 'Table 8',
    itemsSubtotal: 14900,
    claimedSubtotal: 14900,
    unpaidToHost: 0,
    status: 'CLOSED',
    createdAt: new Date(Date.now() - 1000 * 60 * 89).toISOString()
  }
];

export function useMockTabs() {
  const [tabs, setTabs] = useState<MockTab[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTabs = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 600));
    setTabs(generateMockTabs());
    setLoading(false);
  };

  const refresh = () => {
    loadTabs();
  };

  useEffect(() => {
    loadTabs();
  }, []);

  const getClaimedPercentage = (tab: MockTab) => {
    return Math.round((tab.claimedSubtotal / tab.itemsSubtotal) * 100) || 0;
  };

  return {
    tabs,
    loading,
    refresh,
    getClaimedPercentage
  };
}