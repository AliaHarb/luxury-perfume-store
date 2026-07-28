import React, { useState } from 'react';
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

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

    try {
      const formattedSizes = sizes
        .filter((item) => item.label.trim() !== '' || item.price !== '')
        .map((item) => ({
          label: item.label.trim(),
          price: Number(item.price) || 0
        }));

      // الإضافة مباشرة في Firestore بالـ Modular SDK
      await addDoc(collection(db, "products"), {
        name: formData.name.trim(),
        brandLabel: formData.brandLabel.trim(),
        tone: formData.tone.trim(),
        imageUrl: formData.imageUrl.trim(),
        isAvailable: formData.isAvailable,
        sizes: formattedSizes.length > 0 ? formattedSizes : [{ label: 'الحجم القياسي', price: 0 }],
        createdAt: new Date().toISOString()
      });

      alert("تمت إضافة المنتج بنجاح! 🎉");
      setFormData({ name: '', brandLabel: '', tone: '', imageUrl: '', isAvailable: true });
      setSizes([{ label: '', price: '' }]);
    } catch (error) {
      alert("خطأ أثناء إضافة المنتج: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', border: '1px solid #E8E8E8', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#ffffff', direction: 'rtl' }}>
      <h2 style={{ textAlign: 'center', color: '#111111', marginBottom: '8px', fontSize: '24px' }}>لوحة إدخال المنتجات 📑</h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#767676', marginBottom: '24px' }}>إضافة العطور والأسعار بسهولة لمتجر دار حرب</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3A3A3A' }}>اسم المنتج</label>
          <input type="text" required placeholder="مثال: مسك عبق الرمان" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D9D9D9', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3A3A3A' }}>الماركة / الفلتر (Brand Label)</label>
          <input type="text" required placeholder="مثال: إبراهيم القرشي، عساف" value={formData.brandLabel} onChange={e => setFormData({...formData, brandLabel: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D9D9D9', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3A3A3A' }}>وصف العطر والمكونات</label>
          <textarea required placeholder="اكتبي المكونات والافتتاحية والقلب..." value={formData.tone} onChange={e => setFormData({...formData, tone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D9D9D9', boxSizing: 'border-box', minHeight: '80px' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3A3A3A' }}>رابط الصورة (URL)</label>
          <input type="text" required placeholder="ضعي رابط الصورة هنا..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D9D9D9', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px solid #EDEDED' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#3A3A3A' }}>الأحجام والأسعار</label>
          {sizes.map((sizeItem, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input type="text" required placeholder="الحجم (مثال: 100مل)" value={sizeItem.label} onChange={e => handleSizeChange(index, 'label', e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #D9D9D9' }} />
              <input type="number" required min="0" placeholder="السعر" value={sizeItem.price} onChange={e => handleSizeChange(index, 'price', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D9D9D9' }} />
              {sizes.length > 1 && (
                <button type="button" onClick={() => removeSizeRow(index)} style={{ padding: '10px 14px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSizeRow} style={{ marginTop: '5px', padding: '8px 12px', backgroundColor: '#111111', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            + إضافة حجم أو خيار آخر
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: '600', color: '#3A3A3A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} style={{ width: '18px', height: '18px' }} />
            متوفر في المخزون ومتاح للبيع
          </label>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#767676' : '#111111', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          {loading ? 'جاري رفع البيانات...' : 'نشر المنتج'}
        </button>
      </form>
    </div>
  );
}