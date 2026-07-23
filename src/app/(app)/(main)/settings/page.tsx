'use client';

import React, { useEffect, useState } from 'react';
import { ContentArea } from '@/components/common/ContentArea';
import { ContentHeader } from '@/components/common/ContentHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Cpu, 
  GripVertical, 
  Save, 
  AlertCircle,
  Network
} from 'lucide-react';
import { AIModel } from '@/lib/ai/models';

export default function SettingsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/ai/models')
      .then(res => res.json())
      .then(data => {
        setModels(data.models || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load models');
        setIsLoading(false);
      });
  }, []);

  const handleToggle = (id: string) => {
    setModels(current => current.map(m => 
      m.id === id ? { ...m, isEnabled: !m.isEnabled } : m
    ));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setModels(current => {
      const newModels = [...current];
      // Swap priorities
      const tempPriority = newModels[index].priority;
      newModels[index].priority = newModels[index - 1].priority;
      newModels[index - 1].priority = tempPriority;
      // Sort
      return newModels.sort((a, b) => a.priority - b.priority);
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === models.length - 1) return;
    setModels(current => {
      const newModels = [...current];
      // Swap priorities
      const tempPriority = newModels[index].priority;
      newModels[index].priority = newModels[index + 1].priority;
      newModels[index + 1].priority = tempPriority;
      // Sort
      return newModels.sort((a, b) => a.priority - b.priority);
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Re-assign priorities sequentially just to be safe
      const sequentialModels = models.map((m, idx) => ({ ...m, priority: idx + 1 }));
      
      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: sequentialModels })
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      setModels(sequentialModels);
      toast.success('AI Settings saved successfully');
    } catch (e: any) {
      toast.error(e.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ContentArea 
      header={
        <ContentHeader 
          title="AI Settings" 
          description="Manage artificial intelligence models and failover priorities." 
        />
      }
    >
      <div className="max-w-4xl mt-6">
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-secondary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-foreground">Multi-Model Configuration</h2>
            </div>
            <Button onClick={handleSave} disabled={isSaving || isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
          
          <div className="p-5">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3 text-sm text-blue-800">
              <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
              <p>
                <strong>Automatic Failover is active.</strong> If the primary model fails or reaches rate limits, the system will automatically fall back to the next enabled model in the list based on priority.
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading models...</div>
            ) : (
              <div className="space-y-3">
                {models.map((model, index) => (
                  <div 
                    key={model.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col gap-1 items-center justify-center text-slate-300">
                      <button 
                        onClick={() => handleMoveUp(index)} 
                        disabled={index === 0}
                        className="hover:text-muted-foreground disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <GripVertical className="w-4 h-4" />
                      <button 
                        onClick={() => handleMoveDown(index)} 
                        disabled={index === models.length - 1}
                        className="hover:text-muted-foreground disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent shrink-0">
                      <Cpu className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{model.displayName}</h3>
                        {index === 0 && model.isEnabled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">Primary</span>
                        )}
                        {!model.isEnabled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-semibold">Disabled</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{model.description}</p>
                      
                      <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground">
                        <span>Provider: <span className="text-muted-foreground">{model.provider}</span></span>
                        <span>Context: <span className="text-muted-foreground">{model.contextLength / 1000}k</span></span>
                        {model.supportsReasoning && <span className="text-emerald-600">Supports Reasoning</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 border-l pl-4">
                      <span className="text-sm font-medium text-muted-foreground w-16 text-right">
                        {model.isEnabled ? 'Active' : 'Off'}
                      </span>
                      <Switch 
                        checked={model.isEnabled} 
                        onCheckedChange={() => handleToggle(model.id)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentArea>
  );
}
