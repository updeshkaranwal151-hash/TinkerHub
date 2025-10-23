import React, { useState, useEffect } from 'react';
import { Component, IssueRecord } from './types';
import { Category } from './types';
import Header from './components/Header';
import ComponentCard from './components/ComponentCard';
import AddComponentModal from './components/AddComponentModal';
import EditComponentModal from './components/EditComponentModal';
import IssueComponentModal from './components/IssueComponentModal';
import { PlusIcon, SearchIcon } from './components/Icons';
import { generateDescription, generateImage } from './services/geminiService';
import PasswordProtection from './components/PasswordProtection';

const LOCAL_STORAGE_KEY = 'inventory_components';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<Component | null>(null);
  const [componentToIssue, setComponentToIssue] = useState<Component | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  // Load components from localStorage on first load
  useEffect(() => {
    try {
      const savedComponentsJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedComponentsJSON) {
        setComponents(JSON.parse(savedComponentsJSON));
      } else {
        // If nothing in storage, start with an empty list.
        setComponents([]);
      }
    } catch (error) {
        console.error("Failed to load components from storage. Starting fresh.", error);
        setComponents([]); // In case of parsing error, also start fresh.
    }
    setIsLoading(false);
  }, []);

  // Save components to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(components));
      } catch (error) {
        console.error("Failed to save components to storage:", error);
      }
    }
  }, [components, isLoading]);

  const handleAddComponent = (newComponent: Omit<Component, 'id'>) => {
    const componentToAdd: Component = {
      ...newComponent,
      id: new Date().toISOString(),
    };
    setComponents(prev => [componentToAdd, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleDeleteComponent = (id: string) => {
    if(window.confirm('Are you sure you want to delete this component?')) {
        setComponents(prev => prev.filter(c => c.id !== id));
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
    setComponents(prev =>
      prev.map(c => (c.id === updatedComponent.id ? updatedComponent : c))
    );
    setIsEditModalOpen(false);
    setComponentToEdit(null);
  };

  const handleToggleAvailability = (componentId: string) => {
    setComponents(prev =>
        prev.map(c =>
            c.id === componentId ? { ...c, isAvailable: !c.isAvailable } : c
        )
    );
  };

  const handleConfirmIssue = (componentId: string, studentName: string) => {
    const newIssue: IssueRecord = {
        id: `issue-${new Date().getTime()}`,
        studentName,
        issuedDate: new Date().toISOString(),
    };
    setComponents(prev => 
        prev.map(c => 
            c.id === componentId ? { ...c, issuedTo: [...c.issuedTo, newIssue] } : c
        )
    );
    setIsIssueModalOpen(false);
    setComponentToIssue(null);
  };

  const handleReturnIssue = (componentId: string, issueId: string) => {
    setComponents(prev =>
        prev.map(c =>
            c.id === componentId
            ? { ...c, issuedTo: c.issuedTo.filter(issue => issue.id !== issueId) }
            : c
        )
    );
  };

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <PasswordProtection onSuccess={handleSuccessfulAuth} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      <Header onAddComponent={() => setIsAddModalOpen(true)} />
      
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-sky-400">Inventory Dashboard</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg shadow-indigo-600/30"
          >
            <PlusIcon />
            Add Component
          </button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
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
        
        {isLoading ? (
          <p className="text-center text-lg">Loading components...</p>
        ) : components.length > 0 ? (
            filteredComponents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredComponents.map(component => (
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

      <footer className="text-center text-slate-500 text-sm py-4 border-t border-slate-800">
        this app is made with ❤️ by Apoorv karanwal
      </footer>
    </div>
  );
};

export default App;
