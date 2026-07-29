import React, { useState, useEffect } from 'react';
import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  
  // حالات المنتجات
  const [formData, setFormData] = useState({
    name: '',
    brandLabel: '',
    tone: '',
    imageUrl: '',
    isAvailable: true
  });
  const [sizes, setSizes] = useState([{ label: '', price: '' }]);
  const [loading, setLoading] = useState(false);
  const [productsList, setProductsList] = useState([]);

  // حالات الطلبات
  const [ordersList, setOrdersList] = useState([]);

  // 1. جلب الطلبات والمنتجات لحظياً (Real-time listener)
  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // ترتيب الطلبات من الأحدث للأقدم
      orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrdersList(orders);
    });

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductsList(products);
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  // حساب الإحصائيات
  const totalSales = ordersList.reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
  const pendingOrdersCount = ordersList.filter(o => !o.status || o.status === 'pending').length;

  // 2. معالجة الأحجام
  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...sizes];
    updatedSizes[index][field] = value;
    setSizes(updatedSizes);
  };

  const addSizeRow = () => setSizes([...sizes, { label: '', price: '' }]);
  const removeSizeRow = (index) => {
    if (sizes.length > 1) setSizes(sizes.filter((_, i) => i !== index));
  };

  // 3. إضافة منتج جديد
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedSizes = sizes
        .filter((item) => item.label.trim() !== '' || item.price !== '')
        .map((item) => ({
          label: item.label.trim(),
          price: Number(item.price) || 0
        }));

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

  // 4. تحديث حالة الطلب
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      alert("خطأ في تحديث الحالة: " + error.message);
    }
  };

  // 5. حذف طلب
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("هل أنت متاكد من حذف هذا الطلب؟")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
      } catch (error) {
        alert("خطأ أثناء الحذف: " + error.message);
      }
    }
  };

  // 6. حذف منتج
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("هل أنت متاكد من حذف هذا المنتج؟")) {
      try {
        await deleteDoc(doc(db, "products", productId));
      } catch (error) {
        alert("خطأ أثناء الحذف: " + error.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', fontFamily: 'Segoe UI, Tajawal, sans-serif', direction: 'rtl', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      
      {/* 🟢 الهيدر الرئيسي */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827' }}>لوحة التحكم | دار حرب</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>إدارة الطلبات والمنتجات بسهولة</p>
        </div>

        {/* أزرار التنقل بين التبويبات */}
        <div style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('orders')} 
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'orders' ? '#111827' : 'transparent', color: activeTab === 'orders' ? '#fff' : '#4B5563', transition: 'all 0.2s' }}
          >
            📦 الطلبات ({ordersList.length})
          </button>
          <button 
            onClick={() => setActiveTab('products')} 
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'products' ? '#111827' : 'transparent', color: activeTab === 'products' ? '#fff' : '#4B5563', transition: 'all 0.2s' }}
          >
            🏷️ المنتجات ({productsList.length})
          </button>
        </div>
      </div>

      {/* 🟢 كروت الإحصائيات (Stats Bar) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>إجمالي المبيعات</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', marginTop: '4px' }}>{totalSales.toLocaleString('ar-EG')} ج.م</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>إجمالي الطلبات</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginTop: '4px' }}>{ordersList.length} طلب</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>طلبات جديدة (معلقة)</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B', marginTop: '4px' }}>{pendingOrdersCount}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>العطور المعروضة</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366F1', marginTop: '4px' }}>{productsList.length} منتج</div>
        </div>
      </div>

      {/* 🟢 تبويب إدارة الطلبات */}
      {activeTab === 'orders' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>قائمة الطلبات الأخيرة</h2>
          </div>

          {ordersList.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>لا توجد طلبات بعد.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                    <th style={{ padding: '14px 16px' }}>رقم الطلب</th>
                    <th style={{ padding: '14px 16px' }}>بيانات العميل</th>
                    <th style={{ padding: '14px 16px' }}>المحافظة والعنوان</th>
                    <th style={{ padding: '14px 16px' }}>المنتجات</th>
                    <th style={{ padding: '14px 16px' }}>المبلغ</th>
                    <th style={{ padding: '14px 16px' }}>حالة الطلب</th>
                    <th style={{ padding: '14px 16px' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((order) => {
                    const status = order.status || 'pending';
                    const formattedPhone = order.mobile1 ? order.mobile1.replace(/[^0-9]/g, '') : '';
                    
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold', color: '#9C7A45' }}>
                          {order.orderNumber || order.id.slice(0, 6)}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 'bold', color: '#111827' }}>{order.customerName || order.form?.name}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', dir: 'ltr', textAlign: 'right' }}>
                            📱 {order.mobile1 || order.form?.mobile1}
                          </div>
                          {order.mobile1 && (
                            <a 
                              href={`https://wa.me/2${formattedPhone}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ display: 'inline-block', marginTop: '4px', fontSize: '11px', color: '#10B981', fontWeight: 'bold', textDecoration: 'none' }}
                            >
                              💬 واتساب
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '16px', maxWidth: '200px' }}>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{order.governorate || order.form?.governorate}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{order.address || order.form?.address}</div>
                        </td>
                        <td style={{ padding: '16px', maxWidth: '220px' }}>
                          {order.items?.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '13px', marginBottom: '2px' }}>
                              • {item.name} ({item.size}) × {item.qty}
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 'bold', color: '#111827' }}>{(order.totalPrice || order.subtotal)?.toLocaleString('ar-EG')} ج.م</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>شحن: {order.shippingFee || 80} ج.م</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <select 
                            value={status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{ 
                              padding: '6px 10px', 
                              borderRadius: '8px', 
                              border: '1px solid #D1D5DB', 
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: 
                                status === 'pending' ? '#FEF3C7' :
                                status === 'processing' ? '#DBEAFE' :
                                status === 'shipped' ? '#E0E7FF' :
                                status === 'delivered' ? '#D1FAE5' : '#FEE2E2',
                              color: 
                                status === 'pending' ? '#92400E' :
                                status === 'processing' ? '#1E40AF' :
                                status === 'shipped' ? '#3730A3' :
                                status === 'delivered' ? '#065F46' : '#991B1B'
                            }}
                          >
                            <option value="pending">⏳ قيد الانتظار</option>
                            <option value="processing">⚙️ جاري التجهيز</option>
                            <option value="shipped">🚚 تم الشحن</option>
                            <option value="delivered">✅ مكتمل (تم التوصيل)</option>
                            <option value="cancelled">❌ ملغي</option>
                          </select>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            style={{ padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 🟢 تبويب إدارة المنتجات */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* فورم إضافة منتج */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', height: 'fit-content' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>إضافة عطر جديد ➕</h2>
            
            <form onSubmit={handleSubmitProduct}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>اسم المنتج</label>
                <input type="text" required placeholder="مثال: مسك عبق الرمان" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>الماركة / الفلتر (Brand Label)</label>
                <input type="text" required placeholder="مثال: إبراهيم القرشي" value={formData.brandLabel} onChange={e => setFormData({...formData, brandLabel: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>وصف العطر والمكونات</label>
                <textarea required placeholder="اكتبي المكونات والافتتاحية..." value={formData.tone} onChange={e => setFormData({...formData, tone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box', minHeight: '70px' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>رابط الصورة (URL)</label>
                <input type="text" required placeholder="ضعي رابط الصورة هنا..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>الأحجام والأسعار</label>
                {sizes.map((sizeItem, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" required placeholder="الحجم (100مل)" value={sizeItem.label} onChange={e => handleSizeChange(index, 'label', e.target.value)} style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }} />
                    <input type="number" required min="0" placeholder="السعر" value={sizeItem.price} onChange={e => handleSizeChange(index, 'price', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }} />
                    {sizes.length > 1 && (
                      <button type="button" onClick={() => removeSizeRow(index)} style={{ padding: '8px 12px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSizeRow} style={{ marginTop: '4px', padding: '6px 10px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  + إضافة حجم آخر
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                  متاح للبيع في المتجر
                </label>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#9CA3AF' : '#111827', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {loading ? 'جاري النشر...' : 'نشر المنتج'}
              </button>
            </form>
          </div>

          {/* قائمة المنتجات الحالية */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>العطور المعروضة حالياً</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
              {productsList.map((product) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                  <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{product.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{product.brandLabel}</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#9C7A45', marginTop: '2px' }}>
                      {product.sizes?.map(s => `${s.label}: ${s.price}ج.م`).join(' | ')}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    style={{ padding: '6px 10px', backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}