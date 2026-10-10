import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Image, Layers, Grid, Sliders, Check, Sparkles, X, 
  Tag, Info, HelpCircle
} from 'lucide-react';
import { Product, CategoryType, ColorType, SizeType, ProductVariant } from '../types';
import { ImageUploader } from './ImageUploader';
import { SafeImage } from './SafeImage';
import { useAuth } from '@clerk/clerk-react';

interface AddProductFormProps {
  product?: Product | null; // If editing an existing product
  onSaveSuccess: () => void;
  onCancel: () => void;
}

import { useApp } from '../AppContext';
const PRESET_COLORS: ColorType[] = ['Black', 'Brown', 'Navy Blue', 'Beige'];
const CLOTHING_SIZES: SizeType[] = ['S', 'M', 'L', 'XL'];
const FOOTWEAR_SIZES: SizeType[] = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];
const CAPS_SIZES: SizeType[] = ['One Size'];
const ORNAMENT_SIZES: SizeType[] = ['7.5 inches', '22 inches', 'One Size'];

// Premium fashion Unsplash placeholders for user's easy default selection
const POPULAR_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=80"
];

export default function AddProductForm({ product, onSaveSuccess, onCancel }: AddProductFormProps) {
  const isEditing = !!product;
  const { getToken } = useAuth();

  // Basic info states
  const [productType, setProductType] = useState<'CLOTHING' | 'FOOTWEAR' | 'CAPS' | 'ORNAMENT'>('CLOTHING');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [comparePrice, setComparePrice] = useState<number>(0);
  const [category, setCategory] = useState<CategoryType>('');
  const [fabric, setFabric] = useState('Premium Heavyweight Cotton');
  const [description, setDescription] = useState('');
  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false);
  
  const { categories, addCategory, deleteCategory, addToast, user } = useApp();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  // Luxury construction details
  const [fit, setFit] = useState('Tailored Fit');
  const [closure, setClosure] = useState('Corozo Button Assembly');
  const [waistStyle, setWaistStyle] = useState('Double Pleated Beltless Gurkha');
  const [styleType, setStyleType] = useState('Stealth Luxury / Sartorial');
  const [upperMaterial, setUpperMaterial] = useState('');
  const [soleType, setSoleType] = useState('');
  const [toeStyle, setToeStyle] = useState('');

  const currentCategory = categories.find(c => c.name === category || c.id === category);
  const isFootwear = currentCategory?.type === 'FOOTWEAR' || productType === 'FOOTWEAR';
  const isCaps = currentCategory?.type === 'CAPS' || productType === 'CAPS';
  const isOrnament = currentCategory?.type === 'ORNAMENT' || productType === 'ORNAMENT';
  const currentSizes = isFootwear ? FOOTWEAR_SIZES : isCaps ? CAPS_SIZES : isOrnament ? ORNAMENT_SIZES : CLOTHING_SIZES;

  // Product Highlights & Specifications states
  const [highlightsText, setHighlightsText] = useState('');
  const [specificationsText, setSpecificationsText] = useState('');

  // Multi-image gallery states
  interface ImageItem {
    imageUrl: string;
    color?: string;
  }
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeColorFilter, setActiveColorFilter] = useState<string>('ALL');

  // Variant generator state
  const [selectedColors, setSelectedColors] = useState<ColorType[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SizeType[]>([]);
  
  // The actual matrix variant rows state
  interface MatrixRow {
    id?: string;
    color: ColorType;
    size: SizeType;
    stockQuantity: number;
    sku: string;
  }
  const [variantMatrix, setVariantMatrix] = useState<MatrixRow[]>([]);
  const [variantConfigMode, setVariantConfigMode] = useState<'UNIFIED' | 'INDIVIDUAL'>('UNIFIED');
  const [unifiedStock, setUnifiedStock] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync unified stock changes to all rows under UNIFIED mode
  useEffect(() => {
    if (variantConfigMode === 'UNIFIED' && variantMatrix.length > 0) {
      setVariantMatrix(prev => prev.map(row => ({
        ...row,
        stockQuantity: unifiedStock
      })));
    }
  }, [unifiedStock, variantConfigMode]);

  // Dynamic matrix auto synchronization
  useEffect(() => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      if (variantMatrix.length > 0) {
        setVariantMatrix([]);
      }
      return;
    }

    const nextRows: MatrixRow[] = [];
    const categoryCode = category.substring(0, 3).toUpperCase();

    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        const existing = variantMatrix.find(v => v.color === color && v.size === size);
        if (existing) {
          nextRows.push({
            ...existing,
            stockQuantity: variantConfigMode === 'UNIFIED' ? unifiedStock : existing.stockQuantity
          });
        } else {
          const colorCode = color.substring(0, 3).toUpperCase().replace(/\s+/g, '');
          const cleanName = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 5) : 'item';
          const randSuffix = Math.floor(Math.random() * 900) + 100;
          const sku = `DL-${categoryCode}-${colorCode}-${size}-${cleanName}-${randSuffix}`;
          nextRows.push({
            color,
            size,
            stockQuantity: variantConfigMode === 'UNIFIED' ? unifiedStock : 10,
            sku
          });
        }
      });
    });

    const keyHash = (rows: MatrixRow[]) => rows.map(r => `${r.color}-${r.size}-${r.stockQuantity}`).join('|');
    if (keyHash(nextRows) !== keyHash(variantMatrix)) {
      setVariantMatrix(nextRows);
    }
  }, [selectedColors, selectedSizes, category, name, variantConfigMode, unifiedStock]);

  // If editing, pre-populate values
  useEffect(() => {
    if (product) {
      const prodCat = categories.find(c => c.name === product.category || c.id === product.category);
      setProductType(prodCat?.type === 'FOOTWEAR' ? 'FOOTWEAR' : 'CLOTHING');
      setName(product.name);
      setPrice(product.price);
      setComparePrice(product.comparePrice || product.price);
      setCategory(product.category);
      setFabric(product.fabric);
      setDescription(product.description || '');
      setFit(product.fit || '');
      setClosure(product.closure || '');
      setWaistStyle(product.waistStyle || '');
      setStyleType(product.styleType || '');
      setUpperMaterial(product.upperMaterial || '');
      setSoleType(product.soleType || '');
      setToeStyle(product.toeStyle || '');
      setImages(product.images.map(img => ({ imageUrl: img.imageUrl, color: img.color })));
      
      // Load Highlights and Specifications
      if (product.highlights && Array.isArray(product.highlights)) {
        setHighlightsText(product.highlights.join('\n'));
      } else {
        setHighlightsText('');
      }

      if (product.specifications && typeof product.specifications === 'object') {
        const specsStr = Object.entries(product.specifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        setSpecificationsText(specsStr);
      } else {
        setSpecificationsText('');
      }
      
      // Map variants to matrix rows
      const mappedRows: MatrixRow[] = product.variants.map(v => ({
        id: v.id,
        color: v.color,
        size: v.size,
        stockQuantity: v.stockQuantity,
        sku: v.sku
      }));
      setVariantMatrix(mappedRows);

      // Collect colors/sizes already selected
      const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)));
      const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)));
      setSelectedColors(uniqueColors);
      setSelectedSizes(uniqueSizes);
    } else {
      // Default initial images
      setImages([{ imageUrl: POPULAR_PLACEHOLDERS[0] }]);
    }
  }, [product]);

  // Add custom photo URL
  const handleAddImageUrl = () => {
    if (!newImageUrl) return;
    if (images.some(img => img.imageUrl === newImageUrl)) {
      setNewImageUrl('');
      return;
    }
    const colorTag = activeColorFilter === 'ALL' ? undefined : activeColorFilter;
    setImages([...images, { imageUrl: newImageUrl, color: colorTag }]);
    setNewImageUrl('');
  };

  // Add preset photo quick fill
  const handleQuickAddImage = (url: string) => {
    if (images.some(img => img.imageUrl === url)) return;
    const colorTag = activeColorFilter === 'ALL' ? undefined : activeColorFilter;
    setImages([...images, { imageUrl: url, color: colorTag }]);
  };

  // Remove photo from list
  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  // Color selection togglers
  const toggleColor = (color: ColorType) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Size selection togglers
  const toggleSize = (size: SizeType) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // Generate Matrix based on selected colors & sizes
  const handleGenerateMatrix = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      setErrorMsg("Please select at least one Color and one Size to generate the variant matrix.");
      // Clear error after some time
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    const nextRows: MatrixRow[] = [];
    const categoryCode = category ? category.substring(0, 3).toUpperCase() : 'UNK';

    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        // Try to look up existing variant to preserve Stock/SKU if editing
        const existing = variantMatrix.find(v => v.color === color && v.size === size);
        if (existing) {
          nextRows.push(existing);
        } else {
          const colorCode = color.substring(0, 3).toUpperCase().replace(/\s+/g, '');
          const cleanName = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 5) : 'item';
          const randSuffix = Math.floor(Math.random() * 900) + 100;
          const sku = `DL-${categoryCode}-${colorCode}-${size}-${cleanName}-${randSuffix}`;
          nextRows.push({
            color,
            size,
            stockQuantity: 10, // default stock count
            sku
          });
        }
      });
    });

    setVariantMatrix(nextRows);
    setErrorMsg('');
  };

  // Update specific matrix values
  const handleMatrixChange = (index: number, key: keyof MatrixRow, value: string | number) => {
    const updated = [...variantMatrix];
    updated[index] = {
      ...updated[index],
      [key]: value
    };
    setVariantMatrix(updated);
  };

  // Quick action: Set all quantities in matrix
  const handleBulkSetQuantity = (qty: number) => {
    const updated = variantMatrix.map(row => ({
      ...row,
      stockQuantity: qty
    }));
    setVariantMatrix(updated);
  };

  // Submit form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (images.length === 0) {
      setErrorMsg("At least one product image is required.");
      return;
    }

    if (variantMatrix.length === 0) {
      setErrorMsg("Product must have a defined variant matrix. Pick colors & sizes, and click 'Generate Variant Matrix'.");
      return;
    }

    // Verify sku presence
    const hasInvalidSku = variantMatrix.some(v => !v.sku.trim());
    if (hasInvalidSku) {
      setErrorMsg("All variants in the matrix must have valid SKUs.");
      return;
    }

    setIsSubmitting(true);

    // Parse highlight lines
    const parsedHighlights = highlightsText
      .split('\n')
      .map(h => h.trim())
      .filter(Boolean);

    // Parse custom specifications
    const parsedSpecifications: Record<string, string> = {};
    specificationsText.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const k = line.substring(0, idx).trim();
        const v = line.substring(idx + 1).trim();
        if (k && v) {
          parsedSpecifications[k] = v;
        }
      }
    });

    const payload = {
      name,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : Number(price),
      category,
      description,
      fabric: isFootwear ? undefined : fabric,
      fit: isFootwear ? undefined : fit,
      waistStyle: isFootwear ? undefined : waistStyle,
      styleType: isFootwear ? undefined : styleType,
      upperMaterial: isFootwear ? upperMaterial : undefined,
      soleType: isFootwear ? soleType : undefined,
      toeStyle: isFootwear ? toeStyle : undefined,
      closure,
      images,
      variants: variantMatrix,
      highlights: parsedHighlights,
      specifications: parsedSpecifications
    };

    try {
      const token = await getToken();
      const url = isEditing ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Email': user?.email || ''
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to commit product to database.");
      }

      onSaveSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected database synchronization error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-left select-none max-w-4xl mx-auto font-sans">
      
      {/* Dynamic Form Header */}
      <div className="border-b border-gray-200/40 pb-5 flex justify-between items-center">
        <div>
          <span className="text-sm font-semibold text-red-600 uppercase tracking-wider block">
            {isEditing ? "Update Product Details" : "Create New Product"}
          </span>
          <h2 className="font-sans text-2xl text-gray-900 uppercase mt-1 tracking-wider">
            {isEditing ? `Edit Product: ${product.name}` : (isFootwear ? "Add New Footwear" : "Add New Clothing Item")}
          </h2>
        </div>
        <button 
          onClick={onCancel}
          className="p-1.5 px-4 border border-gray-200 text-gray-500 hover:border-red-600 hover:text-red-600 rounded-full text-sm cursor-pointer transition-colors"
        >
          Close ×
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-100 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 font-medium">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic details */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-200/20 pb-2">
            <Tag className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-semibold text-red-600 uppercase tracking-wider flex items-center gap-2">
              1. General Product Details
            </h3>
          </div>

          <div className="bg-black border border-black rounded-2xl p-4 text-sm text-white/80 space-y-1 select-none">
            <p className="text-red-500 font-black text-sm uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Inventory Tips:
            </p>
            <p className="leading-relaxed font-bold">
              • Enter a simple, clear product name. <br />
              • Under Section 3, select the colors and sizes to easily generate specific variations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <button
              type="button"
              onClick={() => {
                setProductType('CLOTHING');
                const firstClothing = categories.find(c => c.type === 'CLOTHING');
                if (firstClothing) setCategory(firstClothing.name);
              }}
              className={`py-3 px-4 rounded-xl font-black uppercase tracking-wider text-sm transition-colors border-2 flex items-center justify-center gap-2 ${productType === 'CLOTHING' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-black border-black hover:bg-black hover:text-white'}`}
            >
              Clothing
            </button>
            <button
              type="button"
              onClick={() => {
                setProductType('CAPS');
                const firstCaps = categories.find(c => c.type === 'CAPS');
                if (firstCaps) setCategory(firstCaps.name);
              }}
              className={`py-3 px-4 rounded-xl font-black uppercase tracking-wider text-sm transition-colors border-2 flex items-center justify-center gap-2 ${productType === 'CAPS' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-black border-black hover:bg-black hover:text-white'}`}
            >
              Caps
            </button>
            <button
              type="button"
              onClick={() => {
                setProductType('ORNAMENT');
                const firstOrnament = categories.find(c => c.type === 'ORNAMENT');
                if (firstOrnament) setCategory(firstOrnament.name);
              }}
              className={`py-3 px-4 rounded-xl font-black uppercase tracking-wider text-sm transition-colors border-2 flex items-center justify-center gap-2 ${productType === 'ORNAMENT' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-black border-black hover:bg-black hover:text-white'}`}
            >
              Ornaments
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm text-black font-black block flex justify-between uppercase tracking-wider">
                <span>Product Name</span>
                <span className="text-[11px] text-gray-600 font-bold">Example: Classic Cotton Summer Shacket</span>
              </label>
              <input
                type="text"
                placeholder="Name of clothing item"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-base text-black font-bold focus:border-red-600 focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1.5 flex-1 relative z-20">
              <label className="text-sm text-black font-black uppercase tracking-wider block">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-base text-black font-bold focus:border-red-600 focus:outline-none transition-colors uppercase appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories
                    .filter(c => c.type === productType)
                    .map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  }
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
                  <span className="text-black text-sm">▼</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm text-black font-black uppercase tracking-wider block">
                Price (₹)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Price"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-base text-red-600 font-black focus:border-red-600 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-black font-black uppercase tracking-wider block">
                Compare-at Price (₹) <span className="text-[10px] text-black font-bold">(optional)</span>
              </label>
              <input
                type="number"
                min={0}
                placeholder="Discount reference price"
                value={comparePrice || ''}
                onChange={(e) => setComparePrice(Number(e.target.value))}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-base text-black font-bold focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-black font-black uppercase tracking-wider block">
                {isFootwear ? 'Primary Material (e.g. Italian Leather)' : 'Fabric & Material'}
              </label>
              <input
                type="text"
                placeholder={isFootwear ? "Example: Full-Grain Leather" : "Example: 100% Organic Handwoven Cotton"}
                value={isFootwear ? upperMaterial : fabric}
                onChange={(e) => isFootwear ? setUpperMaterial(e.target.value) : setFabric(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-base text-black font-bold focus:border-red-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedSpecs(!showAdvancedSpecs)}
              className="text-sm font-black text-white flex items-center gap-1.5 focus:outline-none transition-all border-2 border-black px-4 py-2.5 rounded-xl bg-black hover:bg-white hover:text-black cursor-pointer uppercase tracking-wider"
            >
              <span>{showAdvancedSpecs ? "Hide Tailor Specifications (▲)" : "Show Advanced Tailor Specs (+)"}</span>
            </button>
          </div>

          {showAdvancedSpecs && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-4 bg-white border-2 border-black rounded-xl animate-fade-in text-sm">
              {!isFootwear ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm text-black font-black uppercase tracking-wider block">
                      Garment Fit Model
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Relaxed Boxy Fit"
                      value={fit}
                      onChange={(e) => setFit(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-2 text-sm text-black font-bold focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-black font-black uppercase tracking-wider block">
                      Closure system
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Corozo Buttons"
                      value={closure}
                      onChange={(e) => setClosure(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-2 text-sm text-black font-bold focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-black font-black uppercase tracking-wider block">
                      Waist style
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Double Pleats"
                      value={waistStyle}
                      onChange={(e) => setWaistStyle(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-2 text-sm text-black font-bold focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-black font-black uppercase tracking-wider block">
                      Style Tag / Classification
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Casual Wear"
                      value={styleType}
                      onChange={(e) => setStyleType(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-2 text-sm text-black font-bold focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm text-black font-black uppercase tracking-wider block">
                      Sole Type
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Vibram Rubber"
                      value={soleType}
                      onChange={(e) => setSoleType(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-2 text-sm text-black font-bold focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-black font-black uppercase tracking-wider block">
                      Closure system
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Waxed Laces"
                      value={closure}
                      onChange={(e) => setClosure(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-2 text-sm text-black font-bold focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-black font-black uppercase tracking-wider block">
                      Toe Style
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Almond Toe"
                      value={toeStyle}
                      onChange={(e) => setToeStyle(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-2 text-sm text-black font-bold focus:border-red-600 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm text-black font-black uppercase tracking-wider block">
              Product Description
            </label>
            <textarea
              rows={3}
              placeholder="Explain what makes this item special (e.g., breathable double-ply organic linen cuffs)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-base text-black font-bold focus:border-red-600 focus:outline-none transition-colors leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-white border-2 border-black rounded-xl">
            <div className="space-y-1.5">
              <label className="text-sm text-black font-black uppercase tracking-wider block flex justify-between">
                <span>⭐ Key Features (One item per line)</span>
              </label>

              <textarea
                rows={4}
                placeholder="Premium Breathable Fabric&#10;Easy Waist Adjustments&#10;Handmade details"
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm text-black font-bold focus:border-red-600 focus:outline-none transition-colors leading-relaxed"
              />
              <p className="text-[11px] text-black font-bold">Type simple bullet points, one on each line without bullet symbols.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-black font-black uppercase tracking-wider block flex justify-between">
                <span>⚙️ Specifications (PropName: Value per line)</span>
              </label>

              <textarea
                rows={4}
                placeholder="GARMENT WEIGHT: Medium&#10;WASH INSTRUCTIONS: Gentle Dry Clean"
                value={specificationsText}
                onChange={(e) => setSpecificationsText(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm text-black font-bold focus:border-red-600 focus:outline-none transition-colors leading-relaxed"
              />
              <p className="text-[11px] text-black font-bold">Enter properties separated by colons representing table fields.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Lookbook images showroom */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-black pb-2">
            <Image className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
              2. Garment Image Gallery
            </h3>
          </div>

          <div className="bg-black border-2 border-black rounded-2xl p-5 space-y-6">
            
            <div className="space-y-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-red-600 font-bold block flex items-center gap-1.5">
                📸 Upload Images
              </span>
              <ImageUploader 
                label={`Select or Drop Gallery Images`}
                multiple={true}
                initialUrls={images.map(img => img.imageUrl)}
                onFilesChange={(urls) => {
                  const updated = urls.map(url => {
                    const existing = images.find(img => img.imageUrl === url);
                    return {
                      imageUrl: url,
                      color: existing ? existing.color : undefined
                    };
                  });
                  setImages(updated);
                }}
              />
            </div>

            <div className="border-t border-gray-200/20 pt-4 space-y-2.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-red-600 font-bold block">
                🔗 Or Use an Image Web URL
              </span>
              <div className="flex gap-2.5">
                <input
                  type="url"
                  placeholder="Example: https://images.unsplash.com/photo-1594938298603"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-grow bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-red-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="bg-red-600 hover:bg-gray-900 text-gray-900 text-sm font-semibold px-5 rounded-xl uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  Add Link <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Selected image cards listing */}
            {images.length === 0 ? (
              <div className="border border-dashed border-gray-200/20 rounded-xl p-8 text-center text-sm text-gray-500 uppercase">
                No pictures uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {images.map((img, originalIndex) => (
                  <div 
                    key={originalIndex} 
                    className={`relative rounded-xl overflow-hidden group border h-44 flex flex-col justify-between ${
                      originalIndex === 0 ? 'border-red-600 ring-1 ring-brand-gold/50' : 'border-gray-200'
                    }`}
                  >
                    <div className="relative flex-grow overflow-hidden">
                      <SafeImage src={img.imageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      
                      {/* Primary Badge overlay */}
                      {originalIndex === 0 && (
                        <span className="absolute top-2 left-2 bg-red-600/90 text-[9px] font-medium tracking-wider text-gray-900 px-1.5 py-0.5 rounded shadow-sm font-bold">
                          COVER
                        </span>
                      )}

                      {img.color && (
                        <span className="absolute top-2 right-2 bg-black/85 border border-red-600/40 text-red-600 text-[9px] tracking-wider uppercase px-2 py-0.5 rounded font-bold font-medium">
                          {img.color}
                        </span>
                      )}

                      {/* Order indicator */}
                      <span className="absolute bottom-2 left-2 bg-black/75 text-[10px] font-medium text-gray-900 px-2 py-0.5 rounded font-medium">
                        #{originalIndex + 1}
                      </span>

                      {/* Delete trigger */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(originalIndex)}
                        className="absolute top-1.5 right-1.5 hidden group-hover:flex w-7 h-7 bg-red-600 hover:bg-red-700 text-gray-900 items-center justify-center rounded-lg transition-all cursor-pointer shadow-lg animate-fade-in"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Inline Image Role / Color Tag Manager */}
                    <div className="bg-white border-t border-gray-200/30 p-2 flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 uppercase font-medium tracking-wider flex-shrink-0">Role:</span>
                      <select
                        value={originalIndex === 0 ? 'COVER' : (img.color || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...images];
                          
                          if (val === 'COVER') {
                            const [selected] = updated.splice(originalIndex, 1);
                            selected.color = undefined;
                            updated.unshift(selected);
                          } else {
                            updated[originalIndex] = { ...updated[originalIndex], color: val || undefined };
                          }
                          
                          setImages(updated);
                        }}
                        className="bg-transparent border-none text-red-600 uppercase font-bold tracking-wider cursor-pointer focus:outline-none w-full text-right truncate ml-1"
                      >
                        <option value="COVER">Cover Image</option>
                        <option value="">General</option>
                        {selectedColors.map(c => (
                          <option key={c} value={c} className="bg-white">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Tip: The first image (Cover Image) will be used as the primary thumbnail. You can assign colors to other images so they show up when a buyer selects that color.</span>
            </div>
          </div>
        </div>          </div>
        </div>

        {/* Section 3: Colors & Sizes combination builder */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-200/20 pb-2">
            <Layers className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-semibold text-red-600 uppercase tracking-wider flex items-center gap-2">
              3. Variations & Stock Management
            </h3>
          </div>

          <div className="bg-black border-2 border-black rounded-2xl p-4 text-sm text-white/80 space-y-1 select-none">
            <p className="text-red-500 font-black text-sm uppercase tracking-wider flex items-center gap-1">
              💡 Setting Up Product Variants:
            </p>
            <p className="leading-relaxed font-bold">
              Select the colors and sizes you offer, then click "Generate Variations" below to set individual stock counts and SKU codes for each combination.
            </p>
          </div>

          <div className="border-2 border-black bg-white rounded-2xl p-6 space-y-6">
            
            {/* Pickers column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Color selectors */}
              <div className="space-y-2.5">
                <span className="text-sm text-black font-black uppercase tracking-wider block">
                  🎨 Step A: Select Available Colors
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColor(color)}
                        className={`px-3.5 py-1.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-2 ${
                          isSelected 
                            ? 'bg-red-600 text-white border-red-600 shadow-md' 
                            : 'bg-white border-black text-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {color.toLowerCase()}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamically render any custom non-preset colors that are currently selected */}
                {selectedColors.filter(c => !PRESET_COLORS.includes(c)).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/20 mt-2">
                    <span className="text-[10px] text-red-600/80 w-full block uppercase font-medium tracking-widest">Added Custom Colors:</span>
                    {selectedColors.filter(c => !PRESET_COLORS.includes(c)).map(color => (
                      <div
                        key={color}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm uppercase tracking-wider bg-red-600 text-gray-900 text-gray-900 border border-red-600 font-bold shadow-md"
                      >
                        <span>{color.toLowerCase()}</span>
                        <button
                          type="button"
                          onClick={() => toggleColor(color)}
                          className="hover:text-red-600 font-black ml-1 text-sm shrink-0 cursor-pointer p-0.5 inline-flex items-center"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom color (e.g. Sage, Crimson)"
                      className="bg-white border-2 border-black px-3 py-1.5 rounded-xl text-sm text-black font-bold focus:outline-none focus:border-red-600 flex-grow"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const formatted = val.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                            if (!selectedColors.includes(formatted)) {
                              setSelectedColors([...selectedColors, formatted]);
                            }
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const val = input.value?.trim();
                        if (val) {
                          const formatted = val.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                          if (!selectedColors.includes(formatted)) {
                            setSelectedColors([...selectedColors, formatted]);
                          }
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-gray-900 text-red-600 border border-gray-300 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Size Selectors */}
              <div className="space-y-2.5">
                <span className="text-sm text-black font-black uppercase tracking-wider block">
                  📏 Step B: Select Available Sizes
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentSizes.map(size => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3.5 py-1.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border-2 ${
                          isSelected 
                            ? 'bg-red-600 text-white border-red-600 shadow-md' 
                            : 'bg-white border-black text-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Customizable or Single-Flow Sizing option (All S, M, L are same or individual) */}
            <div className="bg-black border-2 border-black rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-white font-black uppercase tracking-wider block">
                   Sizing Management Flow Mode
                </span>
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Professional Customizer</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setVariantConfigMode('UNIFIED')}
                  className={`flex-1 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    variantConfigMode === 'UNIFIED'
                      ? 'bg-black border-red-600 shadow-lg'
                      : 'bg-white border-gray-300 hover:border-black'
                  }`}
                >
                  <div className={`font-bold text-sm uppercase tracking-wide flex items-center gap-2 mb-1.5 ${variantConfigMode === 'UNIFIED' ? 'text-white' : 'text-black'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${variantConfigMode === 'UNIFIED' ? 'bg-red-600 animate-pulse' : 'bg-gray-300'}`}></span>
                    Unified Sizing (All Same)
                  </div>
                  <p className={`text-[10px] leading-relaxed font-sans normal-case ${variantConfigMode === 'UNIFIED' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Sets identical stock counts automatically across S, M, L, XL sizes. Best for streamlined apparel inventories where all sizes have equal availability.
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setVariantConfigMode('INDIVIDUAL')}
                  className={`flex-1 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    variantConfigMode === 'INDIVIDUAL'
                      ? 'bg-black border-red-600 shadow-lg'
                      : 'bg-white border-gray-300 hover:border-black'
                  }`}
                >
                  <div className={`font-bold text-sm uppercase tracking-wide flex items-center gap-2 mb-1.5 ${variantConfigMode === 'INDIVIDUAL' ? 'text-white' : 'text-black'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${variantConfigMode === 'INDIVIDUAL' ? 'bg-red-600 animate-pulse' : 'bg-gray-300'}`}></span>
                    Custom Sizing (Individually)
                  </div>
                  <p className={`text-[10px] leading-relaxed font-sans normal-case ${variantConfigMode === 'INDIVIDUAL' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Set separate custom inventories and individualized SKU codes for each specific clothing dimension & color combination.
                  </p>
                </button>
              </div>

              {/* If UNIFIED mode: Render unified stock input multiplier */}
              {variantConfigMode === 'UNIFIED' && (
                <div className="bg-white/60 p-4 border border-gray-200 rounded-xl flex items-center justify-between gap-4 flex-wrap animate-fade-in">
                  <div className="space-y-0.5">
                    <span className="text-sm text-red-600 font-bold uppercase tracking-wider block font-medium">Unified Sizing Unit Stock</span>
                    <p className="text-[10px] text-gray-500 font-sans font-medium">This quantity syncs automatically to S, M, L, XL variant items in real-time.</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white border border-gray-300 p-1.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUnifiedStock(Math.max(0, unifiedStock - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-black hover:bg-red-600 rounded-lg text-white text-sm cursor-pointer font-bold select-none transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={unifiedStock}
                      onChange={(e) => setUnifiedStock(Math.max(0, Number(e.target.value)))}
                      className="w-16 bg-white border-0 text-center text-sm text-gray-900 font-bold focus:ring-0 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setUnifiedStock(unifiedStock + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-black hover:bg-red-600 rounded-lg text-white text-sm cursor-pointer font-bold select-none transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Matrix triggers action bar */}
            <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-200/40">
              <div className="text-left space-y-1">
                <span className="text-sm text-red-600 uppercase tracking-wider font-semibold block">
                  ⚡ Step C: Generate Variant Combinations
                </span>
                <span className="text-sm text-gray-500">
                  Currently selected: {selectedColors.length} colors and {selectedSizes.length} sizes ({selectedColors.length * selectedSizes.length} total variations).
                </span>
              </div>
              
              <button
                type="button"
                onClick={handleGenerateMatrix}
                className="bg-red-600 hover:bg-red-600/80 text-gray-900 text-sm tracking-wider font-bold px-5 py-2.5 rounded-lg uppercase transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                title="Generates or clears combinations"
              >
                Generate Variations <Grid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Variant Rows Table Grid */}
            {variantMatrix.length > 0 && (
              <div className="space-y-4 pt-2">
                
                {/* Bulk tools - only show or make active in individual mode */}
                {variantConfigMode === 'INDIVIDUAL' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-200/30 rounded-xl p-3 text-sm animate-fade-in">
                    <span className="text-red-600 font-bold">Quick Bulk Adjustment: Set in-stock quantity of all variations below to:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[0, 5, 12, 25, 50, 100].map(qty => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => handleBulkSetQuantity(qty)}
                          className="px-2.5 py-1 text-sm border border-gray-200 hover:border-red-600 hover:text-red-600 transition-all rounded-lg cursor-pointer text-gray-500 font-semibold bg-white"
                        >
                          {qty} items each
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-500 border border-gray-200/20 rounded-xl p-3 text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                    ✨ Stock locked as <span className="text-red-600 font-bold">Unified</span>. To assign unique stock levels per size, switch to <span className="text-blue-400 font-bold">Custom Sizing</span> above.
                  </div>
                )}

                {/* Grid Table */}
                <div className="border border-gray-200/40 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-sm text-gray-500 tracking-wide uppercase border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Variant Name</th>
                        <th className="px-4 py-3 font-semibold">SKU Code</th>
                        <th className="px-4 py-3 text-right font-semibold">In-Stock Qty</th>
                        <th className="px-4 py-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-grey/25 bg-black/20">
                      {variantMatrix.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50/10 transition-colors uppercase">
                          <td className="px-4 py-3 font-semibold text-gray-900 text-sm">
                            <span className="text-red-600 font-bold capitalize">{row.color.toLowerCase()}</span> • <span className="text-gray-500">{row.size}</span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            <input
                              type="text"
                              value={row.sku}
                              onChange={(e) => handleMatrixChange(index, 'sku', e.target.value.toUpperCase())}
                              className="w-full bg-white border border-gray-200/40 rounded px-2.5 py-1.5 text-sm text-gray-900 font-medium tracking-wider focus:border-red-600 focus:outline-none"
                              placeholder="SKU-XXXX-XXXX"
                              required
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min={0}
                              value={row.stockQuantity}
                              onChange={(e) => handleMatrixChange(index, 'stockQuantity', Number(e.target.value))}
                              className={`w-20 bg-white/80 border border-gray-200/40 rounded px-2.5 py-1.5 text-right text-sm text-gray-900 focus:border-red-600 focus:outline-none font-sans ${
                                variantConfigMode === 'UNIFIED' ? 'opacity-60 cursor-not-allowed select-none bg-black/40 text-gray-500' : ''
                              }`}
                              required
                              disabled={variantConfigMode === 'UNIFIED'}
                              title={variantConfigMode === 'UNIFIED' ? "Value managed by Unified Sizing controller" : "Set custom stock level"}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setVariantMatrix(variantMatrix.filter((_, idx) => idx !== index))}
                              className="p-1 text-gray-500 hover:text-red-400 font-sans transition-colors cursor-pointer text-base"
                              title="Delete Variant"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </div>

        {/* Buttons Action */}
        <div className="border-t border-gray-200/40 pt-6 flex flex-col sm:flex-row justify-end gap-3 text-sm pl-2 pr-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl hover:text-gray-900 hover:border-gray-900 transition-all cursor-pointer font-semibold"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-red-600 text-gray-900 hover:bg-gray-900 text-gray-900 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
          </button>
        </div>

      </form>
    </div>
  );
}
