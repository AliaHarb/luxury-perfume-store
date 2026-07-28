import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductDetails({ productsList, addToCart, setPage }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);

  // 1. جلب المنتج بالـ ID
  const product = productsList.find((p) => String(p.id) === String(id));

  // 2. سحب الوصف المباشر
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

  // دالة أضف للسلة (تضيف للملف مع تنبيه بسيط وبدون تحويل)
  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    alert("تمت إضافة المنتج إلى السلة بنجاح!");
  };

  // دالة إتمام الطلب المباشر (تضيف وتحول فوراً للسلة/إتمام الطلب)
  const handleCheckoutNow = () => {
    addToCart(product, selectedSize);
    if (setPage) setPage("cart");
    navigate('/cart'); // ينقل للـ URL الخاص بالسلة مباشرةً
  };

  if (productsList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-zinc-800 dir-rtl">
        <p className="text-lg animate-pulse font-bold text-zinc-600">جاري تحميل تفاصيل العطر...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 dir-rtl p-4">
        <h2 className="text-2xl font-bold mb-4">العطر غير موجود أو تم إزالته</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition"
        >
          العودة للمتجر الرئيسي
        </button>
      </div>
    );
  }

  const currentPrice = selectedSize ? selectedSize.price : (product.price || 0);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dir-rtl py-10 px-4 md:px-12 flex flex-col items-center">
      
      {/* الهيدر العلوي */}
      <div className="w-full max-w-6xl mb-8 flex justify-between items-center border-b pb-4 border-zinc-100">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-700 hover:text-black font-semibold text-sm bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-lg transition"
        >
          العودة للمتجر
        </button>
        <span className="font-bold text-sm tracking-wide text-zinc-800">دار حرب للعطور الفاخرة</span>
      </div>

      {/* كارت المنتج */}
      <div className="w-full max-w-5xl bg-white grid grid-cols-1 md:grid-cols-2 gap-12 items-start mt-4">
        
        {/* العمود الأيمن: التفاصيل والزراير */}
        <div className="flex flex-col text-center md:text-right order-2 md:order-1">
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-4 leading-snug">
            {product.name || product.title}
          </h1>

          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span className="text-3xl font-extrabold text-zinc-900">{currentPrice} <span className="text-xl font-bold">ج.م</span></span>
            {product.oldPrice && (
              <>
                <span className="text-zinc-400 line-through text-lg">{product.oldPrice} ج.م</span>
                <span className="bg-zinc-200 text-zinc-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  -37%
                </span>
              </>
            )}
          </div>

          <p className="text-zinc-400 text-sm font-normal mb-8">
            {product.slug || product.englishName || "Dar-Harb-Perfumes"}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* زرار إتمام الطلب */}
            <button
              onClick={handleCheckoutNow}
              className="py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-base rounded-2xl transition active:scale-[0.98]"
            >
              إتمام الطلب
            </button>

            {/* زرار أضف للسلة */}
            <button
              onClick={handleAddToCart}
              className="py-3.5 bg-white border border-black hover:bg-zinc-50 text-black font-bold text-base rounded-2xl transition active:scale-[0.98]"
            >
              أضف للسلة
            </button>
          </div>

          <div className="text-zinc-800 text-sm md:text-base leading-relaxed font-normal whitespace-pre-line border-t border-zinc-100 pt-6">
            {dynamicDescription || "مزيج عطري فاخر يناسب جميع المناسبات."}
          </div>

        </div>

        {/* العمود الأيسر: صورة المنتج */}
        <div className="flex justify-center items-center order-1 md:order-2">
          <img
            src={product.imageUrl || product.image || '/placeholder.png'}
            alt={product.name || product.title}
            className="max-h-[450px] object-contain"
          />
        </div>

      </div>
    </div>
  );
}