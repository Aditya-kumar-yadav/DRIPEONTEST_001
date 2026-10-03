import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { MapPin, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { ServiceablePincode } from '../../types';

export function AdminLogistics() {
  const { apiFetch, addToast } = useApp();
  const [pincodes, setPincodes] = useState<ServiceablePincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkInput, setBulkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/admin/pincodes');
      if (Array.isArray(data)) {
        setPincodes(data);
      }
    } catch (e) {
      addToast('Failed to load pincodes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const codes = bulkInput.split(/[\s,]+/).filter(c => c.length === 6 && !isNaN(Number(c)));
    
    if (codes.length === 0) {
      addToast('No valid 6-digit PIN codes found in input.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/admin/pincodes', {
        method: 'POST',
        body: JSON.stringify({ pincodes: codes })
      });
      if (res && res.success) {
        addToast(`Successfully added ${res.added} new PIN codes.`, 'success');
        setBulkInput('');
        fetchPincodes();
      }
    } catch (e) {
      addToast('Failed to save pincodes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this pincode? Delivery will be disabled there.')) return;
    try {
      await apiFetch(`/api/admin/pincodes/${id}`, { method: 'DELETE' });
      addToast('Pincode removed', 'success');
      setPincodes(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      addToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans text-sm">
      <div className="bg-admin-surface border border-admin-gold/15 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold font-serif text-admin-gold tracking-wide mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Logistics & Delivery
        </h2>
        <p className="text-admin-muted mb-8 text-sm">
          Manage serviceable PIN codes. Customers outside these areas will not be able to purchase products.
        </p>

        <form onSubmit={handleBulkAdd} className="space-y-4 mb-10 bg-white/5 p-5 border border-admin-gold/10 rounded-xl">
          <div>
            <label className="block text-xs font-semibold text-admin-gold mb-2 uppercase tracking-widest">
              Add New Pincodes (Bulk)
            </label>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Paste comma or space separated 6-digit PIN codes (e.g., 110001, 110002)"
              className="w-full bg-admin-background/50 border border-admin-border rounded-xl px-4 py-3 text-admin-text focus:outline-none focus:border-admin-gold transition-colors font-mono text-xs"
              rows={4}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !bulkInput.trim()}
            className="bg-admin-gold text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : <><Plus className="w-4 h-4" /> Save Pincodes</>}
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-admin-gold uppercase tracking-widest mb-4">
            Active Serviceable Areas ({pincodes.length})
          </h3>
          
          {loading ? (
            <div className="text-admin-muted">Loading...</div>
          ) : pincodes.length === 0 ? (
            <div className="flex items-center gap-2 text-admin-muted p-4 border border-dashed border-admin-border rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              No specific pincodes added. (System currently allows all deliveries if this is empty, unless restricted by logic).
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {pincodes.map(pin => (
                <div key={pin.id} className="flex items-center justify-between bg-admin-background/80 border border-admin-border p-3 rounded-xl hover:border-admin-gold/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="font-mono text-sm font-bold text-admin-text">{pin.pincode}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(pin.id)}
                    className="text-red-400 hover:text-red-500 transition-colors p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
