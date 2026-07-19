import React, { useState } from 'react';

export default function AdminProducts() {
  const [formData, setFormData] = useState({
    name: '',
    brandLabel: '',
    tone: '',
    imageUrl: '',
    isAvailable: true
  });

  const [sizes, setSizes] = useState([{ label: '', price: '' }]);
  const [loading, setLoading] = useState(false);

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...sizes];
    updatedSizes[index][field] = value;
    setSizes(updatedSizes);
  };

  const addSizeRow = () => {
    setSizes([...sizes, { label: '', price: '' }]);
  };

  const removeSizeRow = (index) => {
    if (sizes.length > 1) {
      setSizes(sizes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // الوصول للـ db المحقون في الـ window
    const firestoreDb = window.db || (window.firebase && window.firebase.firestore());

    if (!firestoreDb) {
      alert("Firebase is still loading... Please wait a second and try again. ⏳");
      setLoading(false);
      return;
    }

    try {
      const formattedSizes = sizes
        .filter((item) => item.label.trim() !== '' || item.price !== '')
        .map((item) => ({
          label: item.label.trim(),
          price: Number(item.price) || 0
        }));

      // استخدام طريقة الـ Compat (القديمة المعتمدة في السكريبت عندك)
      await firestoreDb.collection("products").add({
        name: formData.name.trim(),
        brandLabel: formData.brandLabel.trim(),
        tone: formData.tone.trim(),
        imageUrl: formData.imageUrl.trim(),
        isAvailable: formData.isAvailable,
        sizes: formattedSizes.length > 0 ? formattedSizes : [{ label: 'الحجم القياسي', price: 0 }]
      });

      alert("Product added successfully to Firestore! 🎉");
      setFormData({ name: '', brandLabel: '', tone: '', imageUrl: '', isAvailable: true });
      setSizes([{ label: '', price: '' }]);
    } catch (error) {
      alert("Error adding product: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', border: '1px solid #E8E8E8', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#ffffff', direction: 'ltr' }}>
      <h2 style={{ textAlign: 'center', color: '#111111', marginBottom: '8px', fontSize: '24px' }}>Dar Harp Store Manager 📑</h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#767676', marginBottom: '24px' }}>Add dynamic products with multiple variations easily</p>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#9C7A45', marginBottom: '24px', fontWeight: 600 }}>
        Tip: "Brand (Filter Tag)" becomes a clickable filter tab on the storefront automatically — spelling and spacing should stay consistent between products of the same brand.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3A3A3A' }}>Product Name</label>
          <input type="text" required placeholder="e.g., Musk Abaq Al-Roman" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D9D9D9', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3A3A3A' }}>Brand (Filter Tag)</label>
          <input type="text" required placeholder="e.g., Ebraq, Assaf" value={formData.brandLabel} onChange={e => setFormData({...formData, brandLabel: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D9D9D9', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3A3A3A' }}>Description / Fragrance Notes</label>
          <textarea required placeholder="Enter materials, notes..." value={formData.tone} onChange={e => setFormData({...formData, tone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D9D9D9', boxSizing: 'border-box', minHeight: '80px' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3A3A3A' }}>Image Link (URL)</label>
          <input type="text" required placeholder="Paste image link here..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D9D9D9', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px solid #EDEDED' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#3A3A3A' }}>Sizes & Pricing</label>
          {sizes.map((sizeItem, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input type="text" required placeholder="Size (e.g., 75ml)" value={sizeItem.label} onChange={e => handleSizeChange(index, 'label', e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #D9D9D9' }} />
              <input type="number" required min="0" placeholder="Price" value={sizeItem.price} onChange={e => handleSizeChange(index, 'price', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D9D9D9' }} />
              {sizes.length > 1 && (
                <button type="button" onClick={() => removeSizeRow(index)} style={{ padding: '10px 14px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSizeRow} style={{ marginTop: '5px', padding: '8px 12px', backgroundColor: '#111111', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            + Add Another Size/Option
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: '600', color: '#3A3A3A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} style={{ width: '18px', height: '18px' }} />
            In Stock & Available for Sale
          </label>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#767676' : '#111111', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          {loading ? 'Uploading Data...' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
}