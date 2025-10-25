import React, { useState, useEffect, useMemo } from 'react';
import { Component, IssueRecord, Category } from './types.ts';
import Header from './components/Header.tsx';
import ComponentCard from './components/ComponentCard.tsx';
import AddComponentModal from './components/AddComponentModal.tsx';
import EditComponentModal from './components/EditComponentModal.tsx';
import IssueComponentModal from './components/IssueComponentModal.tsx';
import ShareModal from './components/ShareModal.tsx';
import { PlusIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon } from './components/Icons.tsx';
import { generateDescription, generateImage } from './services/geminiService.ts';
import PasswordProtection from './components/PasswordProtection.tsx';
import * as localStorageService from './services/localStorageService.ts';

type SortKey = 'default' | 'name' | 'category' | 'availability';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<Component | null>(null);
  const [componentToIssue, setComponentToIssue] = useState<Component | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'default', direction: 'ascending' });

  // Load components from Local Storage on first load
  useEffect(() => {
    if (isAuthenticated) {
        setIsLoading(true);
        try {
            const data = localStorageService.getComponents();
            setComponents(data);
        } catch (err) {
            console.error("Error fetching components from local storage:", err);
            alert("Could not load inventory data from local storage.");
        } finally {
            // Use a small timeout to prevent UI flicker on fast loads
            setTimeout(() => setIsLoading(false), 300);
        }
    }
  }, [isAuthenticated]);


  const handleAddComponent = (newComponent: Omit<Component, 'id' | 'createdAt'>) => {
    try {
        const addedComponent = localStorageService.addComponent(newComponent);
        setComponents(prev => [addedComponent, ...prev]);
        setIsAddModalOpen(false);
    } catch (err) {
        alert("Error adding component. Please try again.");
        console.error(err);
    }
  };

  const handleDeleteComponent = (id: string) => {
    if(window.confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
        try {
            localStorageService.deleteComponent(id);
            setComponents(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert("Error deleting component. Please try again.");
            console.error(err);
        }
    }
  };

  const handleOpenIssueModal = (component: Component) => {
    setComponentToIssue(component);
    setIsIssueModalOpen(true);
  };

  const handleOpenEditModal = (component: Component) => {
    setComponentToEdit(component);
    setIsEditModalOpen(true);
  };

  const handleUpdateComponent = (updatedComponent: Component) => {
    try {
        localStorageService.updateComponent(updatedComponent);
        setComponents(prev =>
            prev.map(c => (c.id === updatedComponent.id ? updatedComponent : c))
        );
        setIsEditModalOpen(false);
        setComponentToEdit(null);
    } catch (err) {
        alert("Error updating component. Please try again.");
        console.error(err);
    }
  };

  const handleToggleAvailability = (component: Component) => {
    try {
        const updatedComponent = localStorageService.toggleAvailability(component);
        setComponents(prev =>
            prev.map(c =>
                c.id === component.id ? updatedComponent : c
            )
        );
    } catch (err) {
        alert("Error toggling availability. Please try again.");
        console.error(err);
    }
  };

  const handleConfirmIssue = (componentId: string, studentName: string) => {
    try {
        const updatedComponent = localStorageService.issueComponent(componentId, studentName);
         setComponents(prev => 
            prev.map(c => 
                c.id === componentId ? updatedComponent : c
            )
        );
        setIsIssueModalOpen(false);
        setComponentToIssue(null);
    } catch (err) {
        alert("Error issuing component. Please try again.");
        console.error(err);
    }
  };

  const handleReturnIssue = (componentId: string, issueId: string) => {
     try {
        const updatedComponent = localStorageService.returnIssue(componentId, issueId);
        setComponents(prev =>
            prev.map(c =>
                c.id === componentId ? updatedComponent : c
            )
        );
    } catch (err) {
        alert("Error returning component. Please try again.");
        console.error(err);
    }
  };

  const handleClearAllComponents = () => {
    if (window.confirm('Are you sure you want to delete ALL components? This action cannot be undone.')) {
        setIsLoading(true);
        try {
            localStorageService.clearAllComponents();
            setComponents([]);
        } catch (err) {
            alert("Error clearing data. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
  };

  const filteredComponents = useMemo(() => components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [components, searchQuery, categoryFilter]);

  const sortedAndFilteredComponents = useMemo(() => {
    let sortableItems = [...filteredComponents];
    if (sortConfig.key !== 'default') {
      sortableItems.sort((a, b) => {
        switch (sortConfig.key) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'availability':
            const aAvailable = a.totalQuantity - a.issuedTo.length;
            const bAvailable = b.totalQuantity - b.issuedTo.length;
            return aAvailable - bAvailable;
          default:
            return 0;
        }
      });
    }
    if (sortConfig.direction === 'descending') {
      sortableItems.reverse();
    }
    return sortableItems;
  }, [filteredComponents, sortConfig]);

  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <PasswordProtection onSuccess={handleSuccessfulAuth} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      <Header 
        onAddComponent={() => setIsAddModalOpen(true)} 
        onClearAll={handleClearAllComponents}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />
      
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-sky-400">Inventory Dashboard</h2>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-grow">
              <div className="relative flex-grow">
                  <input
                      type="text"
                      placeholder="Search by component name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      aria-label="Search components"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon />
                  </div>
              </div>
              <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
                  className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Filter by category"
              >
                  <option value="all">All Categories</option>
                  {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                <select
                    value={sortConfig.key}
                    onChange={e => setSortConfig({ ...sortConfig, key: e.target.value as SortKey })}
                    className="bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    aria-label="Sort by"
                >
                    <option value="default">Default Sort</option>
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="availability">Availability</option>
                </select>
                <button
                    onClick={() => setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
                    disabled={sortConfig.key === 'default'}
                    className="p-2 bg-slate-800 border border-slate-700 rounded-md shadow-sm text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Sort ${sortConfig.direction === 'ascending' ? 'descending' : 'ascending'}`}
                >
                    {sortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </button>
            </div>
        </div>
        
        {isLoading ? (
             <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold text-slate-300 animate-pulse">Loading Inventory...</h3>
                <p className="text-slate-500 mt-2">Please wait while we fetch the data.</p>
            </div>
        ) : components.length > 0 ? (
            sortedAndFilteredComponents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedAndFilteredComponents.map(component => (
                    <ComponentCard
                    key={component.id}
                    component={component}
                    onDelete={handleDeleteComponent}
                    onOpenIssueModal={handleOpenIssueModal}
                    onReturnIssue={handleReturnIssue}
                    onOpenEditModal={handleOpenEditModal}
                    onToggleAvailability={handleToggleAvailability}
                    />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-300">No components found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            )
        ) : (
            <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold text-slate-300">Your inventory is empty!</h3>
                <p className="text-slate-500 mt-2">Get started by adding your first component.</p>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-6 flex items-center mx-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg shadow-indigo-600/30"
                >
                    <PlusIcon />
                    Add Your First Component
                </button>
            </div>
        )}
      </main>

      {isAddModalOpen && (
        <AddComponentModal
          onClose={() => setIsAddModalOpen(false)}
          onAddComponent={handleAddComponent}
          generateDescription={generateDescription}
          generateImage={generateImage}
        />
      )}

      {isEditModalOpen && (
        <EditComponentModal
          component={componentToEdit}
          onClose={() => {
              setIsEditModalOpen(false);
              setComponentToEdit(null);
          }}
          onUpdateComponent={handleUpdateComponent}
          generateDescription={generateDescription}
          generateImage={generateImage}
        />
      )}

      {isIssueModalOpen && (
        <IssueComponentModal
          component={componentToIssue}
          onClose={() => setIsIssueModalOpen(false)}
          onIssue={handleConfirmIssue}
        />
      )}

      {isShareModalOpen && (
        <ShareModal onClose={() => setIsShareModalOpen(false)} />
      )}

      <footer className="text-center text-slate-500 text-sm py-4 border-t border-slate-800">
        this app is made with ❤️ by Apoorv karanwal
      </footer>
    </div>
  );
};

export default App;