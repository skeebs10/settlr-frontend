import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { useMockTabs } from '../hooks/useMockTabs';
import { TabCard } from '../components/TabCard';
import { TabCardSkeleton } from '../components/TabCardSkeleton';
import { useDebounce } from '../hooks/useDebounce';

type FilterStatus = 'ALL' | 'OPEN' | 'PARTIALLY_PAID' | 'CLOSED';

export function StaffDashboard() {
  const { tabs, loading, refresh, getClaimedPercentage } = useMockTabs();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 200);
  
  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => {
      // Search filter
      const matchesSearch = debouncedSearch === '' || 
        tab.venueName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tab.tableName.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      // Status filter
      const matchesStatus = filterStatus === 'ALL' || tab.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [tabs, debouncedSearch, filterStatus]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 600);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('ALL');
  };
  
  const getFilterCount = (status: FilterStatus) => {
    if (status === 'ALL') return tabs.length;
    return tabs.filter(tab => tab.status === status).length;
  };
  
  return (
    <div className="min-h-screen bg-black">
      <div className="container-settlr py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-2">Staff Dashboard</h1>
          <p className="text-sm md:text-base lg:text-lg text-[#B6BCC2]">Manage active tabs and monitor payments</p>
        </div>
        
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-black pb-4 mb-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8D949B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by table or venue"
              className="input-default w-full pl-10 pr-4 py-3"
            />
          </div>
          
          {/* Filter Chips and Refresh */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {(['ALL', 'OPEN', 'PARTIALLY_PAID', 'CLOSED'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    filterStatus === status
                      ? 'bg-[#009B3A] text-white'
                      : 'bg-[#1A1A1D] text-[#B6BCC2] hover:bg-[#2A2F35] hover:text-white border border-[#2A2F35]'
                  }`}
                >
                  {status === 'ALL' ? 'All' : 
                   status === 'PARTIALLY_PAID' ? 'Partially Paid' : 
                   status.charAt(0) + status.slice(1).toLowerCase()} ({getFilterCount(status)})
                </button>
              ))}
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-[#B6BCC2] hover:text-white transition-colors rounded-lg border border-[#2A2F35] hover:border-[#009B3A] ml-4 flex-shrink-0"
              aria-label="Refresh tabs"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <TabCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTabs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1D] flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-[#8D949B]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No tabs found</h3>
            <p className="text-[#B6BCC2] mb-6">
              {searchQuery || filterStatus !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'No active tabs at the moment'
              }
            </p>
            {(searchQuery || filterStatus !== 'ALL') && (
              <button
                onClick={clearFilters}
                className="btn-outlined px-6 py-3"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTabs.map((tab) => (
              <TabCard
                key={tab.id}
                tab={tab}
                claimedPercentage={getClaimedPercentage(tab)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}