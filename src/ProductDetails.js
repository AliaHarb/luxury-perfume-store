import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductDetails({ productsList, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);

  // 1. جلب المنتج بالـ ID
  const product = productsList.find((p) => String(p.id) === String(id));

  // 2. سحب الوصف المباشر بنفس الحقل المستخدم في الصفحة الرئيسية (product.tone)
  const dynamicDescription = product 
    ? (product.tone || product.story || product.desc || product.description || product.details)
    : "";

  // 3. ضبط الحجم الافتراضي والبيكسل
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize({ label: "150مل", price: product.price || 0 });
      }

      // Meta Pixel Event
      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: product.name || product.title,
          content_ids: [product.id],
          content_type: 'product',
          value: product.price || 0,
          currency: 'EGP'
        });
      }
    }
  }, [product]);

  if (productsList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-zinc-800 dir-rtl">
        <p className="text-lg animate-pulse font-bold text-[#b8860b]">جاري تحميل تفاصيل العطر...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 dir-rtl p-4">
        <h2 className="text-2xl font-bold mb-4">العطر غير موجود أو تم إزالته</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition shadow-md"
        >
          العودة للمتجر الرئيسي
        </button>
      </div>
    );
  }

  const currentPrice = selectedSize ? selectedSize.price : (product.price || 0);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dir-rtl py-8 px-4 flex flex-col items-center">
      
      {/* الهيدر العلوي */}
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center border-b pb-4 border-zinc-100">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-700 hover:text-black font-bold text-sm bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl transition"
        >
          ← العودة للمتجر
        </button>
        <span className="font-bold text-sm tracking-wide text-[#b8860b]">دار حرب للعطور الفاخرة</span>
      </div>

      {/* كارت المنتج */}
      <div className="w-full max-w-4xl bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xl">
        
        {/* الصورة */}
        <div className="flex justify-center items-center bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 min-h-[320px]">
          <img
            src={product.imageUrl || product.image || '/placeholder.png'}
            alt={product.name || product.title}
            className="max-h-80 object-contain hover:scale-105 transition duration-300 drop-shadow-md"
          />
        </div>

        {/* البيانات */}
        <div className="flex flex-col gap-4 text-right">
          
          {(product.brandLabel || product.brand) && (
            <span className="font-bold text-sm tracking-wide text-[#b8860b]">
              {product.brandLabel || product.brand}
            </span>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-tight">
            {product.name || product.title}
          </h1>

          {/* عرض الوصف القادم من product.tone */}
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed font-normal whitespace-pre-line">
            {dynamicDescription || "مزيج عطري فاخر يناسب جميع المناسبات."}
          </p>

          {/* الأحجام */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-bold text-zinc-400">الحجم المتاح:</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                      selectedSize?.label === size.label
                        ? 'border-[#b8860b] bg-amber-50/50 text-zinc-900'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    {size.label} ({size.price} ج.م)
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">
            {currentPrice} <span className="text-base font-bold text-zinc-600">ج.م</span>
          </div>

          <button
            onClick={() => {
              addToCart(product, selectedSize);
              alert("تمت إضافة العطر إلى السلة بنجاح ✨");
            }}
            className="w-full mt-2 py-4 bg-black hover:bg-zinc-800 text-white font-bold text-lg rounded-2xl shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>أضف للسلة</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>

        </div>

      </div>
    </div>
  );
}