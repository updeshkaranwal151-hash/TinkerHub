
import React, { useState, useMemo } from 'react';
import Header from './Header.tsx';
import ComponentCard from './ComponentCard.tsx';
import { Component, Category } from '../types.ts';
import { SearchIcon, EmptyStateIcon, ArrowLeftIcon } from './Icons.tsx';

interface AdminControlPanelProps {
    components: Component[];
    imageLibrary: any;
    onLogout: () => void;
    onBack: () => void;
    onAddComponent: () => void;
    onOpenScanner: () => void;
    onClearAll: () => void;
    onOpenShareModal: () => void;
    onOpenImportModal: () => void;
    onExport: () => void;
    isLightMode: boolean;
    onToggleLightMode: () => void;
    
    // Component Actions
    onOpenEditModal: (component: Component) => void;
    onOpenIssueModal: (component: Component) => void;
    onReturnIssue: (componentId: string, issueId: string) => void;
    onDelete: (id: string) => void;
    onToggleAvailability: (component: Component) => void;
    onOpenMaintenanceModal: (component: Component) => void;
}

const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
    components,
    onLogout,
    onBack,
    onAddComponent,
    onOpenScanner,
    onClearAll,
    onOpenShareModal,
    onOpenImportModal,
    onExport,
    isLightMode,
    onToggleLightMode,
    onOpenEditModal,
    onOpenIssueModal,
    onReturnIssue,
    onDelete,
    onToggleAvailability,
    onOpenMaintenanceModal
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

    const filteredComponents = useMemo(() => {
        return components.filter(component => {
            const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [components, searchQuery, categoryFilter]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
            {/* Custom Header Wrapper to include Back Button */}
            <div className="sticky top-0 z-20">
                <div className="bg-slate-900/95 border-b border-slate-700 px-4 py-2 flex items-center">
                     <button 
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Back to Dashboard
                    </button>
                </div>
                <Header
                    onAddComponent={onAddComponent}
                    onOpenScanner={onOpenScanner}
                    onClearAll={onClearAll}
                    onOpenShareModal={onOpenShareModal}
                    onOpenImportModal={onOpenImportModal}
                    onExport={onExport}
                    isLightMode={isLightMode}
                    onToggleLightMode={onToggleLightMode}
                    currentView="inventory"
                    onSetView={() => {}} // No-op here as we are in fixed control mode
                />
            </div>

            <main className="container mx-auto p-4 md:p-8 flex-grow flex flex-col">
                {/* Filter Bar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center p-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                    <div className="relative flex-grow w-full">
                        <input
                            type="text"
                            placeholder="Search components..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800 border-slate-700 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
                        className="bg-slate-800 border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
                    >
                        <option value="all">All Categories</option>
                        {Object.values(Category).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Component Grid */}
                <div className="flex-grow">
                    {filteredComponents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredComponents.map((component, index) => (
                                <ComponentCard
                                    key={component.id}
                                    component={component}
                                    index={index}
                                    onOpenIssueModal={onOpenIssueModal}
                                    onReturnIssue={onReturnIssue}
                                    onDelete={onDelete}
                                    onOpenEditModal={onOpenEditModal}
                                    onToggleAvailability={onToggleAvailability}
                                    onOpenMaintenanceModal={onOpenMaintenanceModal}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex justify-center mb-4 text-slate-600">
                                <EmptyStateIcon />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-300">No components found</h3>
                            <p className="text-slate-500 mt-2">Try adjusting your search or add a new component.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminControlPanel;
