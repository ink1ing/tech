import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, BookOpen, Check, CheckCircle2, CreditCard, FileText, Hammer, Menu,
  MessageCircle, Package, Receipt as ReceiptText, Search, Settings, ShoppingBag, Star, Trash2, X,
} from 'lucide-react';
import { storeApi } from '../services/storeApi';
import type { Category, LookupOrder, OrderReceipt, Product } from '../types/store';
import '../styles/store.css';

const iconMap: Record<string, typeof Package> = {
  MessageCircle, Star, Hammer, ChartNoAxesColumnIncreasing: BarChart3, Settings, FileText, Package, BookOpenText: BookOpen,
};

const money = (cents: number) => `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;
const paymentNames: Record<string, string> = { alipay: '支付宝', wechat: '微信支付', usdt: 'USDT' };
const orderStatusNames: Record<string, string> = {
  pending: '等待处理', processing: '处理中', fulfilled: '已交付', shipped: '已发货', completed: '已完成', cancelled: '已取消',
};
const paymentStatusNames: Record<string, string> = {
  awaiting_payment: '等待付款', submitted: '等待核验', verified: '付款已核验', rejected: '付款资料有误', refunded: '已退款',
};

interface CheckoutForm {
  contactName: string; email: string; messenger: string; shippingAddress: string;
  shippingPhone: string; shippingPostalCode: string; paymentMethod: 'alipay' | 'wechat' | 'usdt'; note: string;
}

const initialCheckout: CheckoutForm = {
  contactName: '', email: '', messenger: '', shippingAddress: '', shippingPhone: '', shippingPostalCode: '', paymentMethod: 'alipay', note: '',
};

export default function StorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [bag, setBag] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [lookup, setLookup] = useState({ orderNumber: '', lookupKey: '' });
  const [lookupResult, setLookupResult] = useState<LookupOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Silas Store';
    storeApi.getCatalog().then(data => {
      setCategories(data.categories);
      setProducts(data.products);
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
    return () => { document.title = previousTitle; };
  }, []);

  const filteredProducts = useMemo(() => products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category_slug === activeCategory;
    const matchesFulfillment = fulfillmentFilter === 'all' || product.fulfillment === fulfillmentFilter;
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || `${product.name} ${product.subtitle} ${product.description}`.toLowerCase().includes(term);
    return matchesCategory && matchesFulfillment && matchesQuery;
  }), [products, activeCategory, fulfillmentFilter, query]);

  const bagProducts = bag.map(id => products.find(product => product.id === id)).filter(Boolean) as Product[];
  const bagTotal = bagProducts.reduce((sum, product) => sum + product.price_cents, 0);
  const needsShipping = bagProducts.some(product => product.fulfillment === 'shipping');

  const addToBag = (product: Product) => {
    setBag(current => current.includes(product.id) ? current : [...current, product.id]);
    setSelectedProduct(null);
    setNotice('已加入购物袋');
  };

  const createOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const result = await storeApi.createOrder({ ...checkout, productIds: bag });
      setReceipt(result);
      localStorage.setItem(`silas-store-${result.orderNumber}`, result.lookupKey);
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!receipt) return;
    const form = new FormData();
    form.set('lookupKey', receipt.lookupKey);
    form.set('paymentReference', paymentReference);
    if (paymentProof) form.set('proof', paymentProof);
    setBusy(true); setError('');
    try {
      await storeApi.submitPayment(receipt.orderNumber, form);
      setNotice('付款资料已提交，我们会尽快核验');
      setCheckoutOpen(false); setBag([]);
      setLookup({ orderNumber: receipt.orderNumber, lookupKey: receipt.lookupKey });
      setReceipt(null); setPaymentReference(''); setPaymentProof(null);
      setLookupOpen(true);
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  const lookupOrder = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { setLookupResult((await storeApi.lookupOrder(lookup.orderNumber.trim(), lookup.lookupKey.trim())).order); }
    catch (err) { setLookupResult(null); setError((err as Error).message); }
    finally { setBusy(false); }
  };

  const chooseCategory = (slug: string) => { setActiveCategory(slug); setNavOpen(false); };

  return (
    <div className="store-app">
      <aside className={`store-sidebar ${navOpen ? 'open' : ''}`} aria-label="商店导航">
        <a className="store-brand" href="/mystore"><span>S</span>Silas Store</a>
        <label className="store-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索" /></label>
        <nav className="store-nav">
          <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => chooseCategory('all')}><Star size={18} />发现</button>
          {categories.map(category => <button key={category.id} className={activeCategory === category.slug ? 'active' : ''} onClick={() => chooseCategory(category.slug)}><Package size={18} />{category.name}</button>)}
        </nav>
        <div className="store-nav-section"><small>订单</small><button onClick={() => setLookupOpen(true)}><ReceiptText size={18} />查询订单</button></div>
        <div className="store-health"><i />支付服务正常</div>
      </aside>

      {navOpen && <button className="store-nav-scrim" aria-label="关闭导航" onClick={() => setNavOpen(false)} />}

      <main className="store-main">
        <header className="store-topbar">
          <button className="store-icon-button mobile-only" aria-label="打开导航" onClick={() => setNavOpen(true)}><Menu size={20} /></button>
          <strong className="mobile-only">Silas Store</strong>
          <div className="store-top-actions"><button className="text-button" onClick={() => setLookupOpen(true)}>订单查询</button><button className="store-icon-button bag-button" aria-label="打开购物袋" onClick={() => setBagOpen(true)}><ShoppingBag size={19} /><span>{bag.length}</span></button></div>
        </header>

        <div className="store-content">
          <section className="store-intro"><p>为你的工作流精选</p><h1>数字服务，简单购买。</h1><div>无需注册账户。付款完成后，使用订单号随时查询处理进度。</div></section>
          <section className="store-feature" aria-label="本周推荐">
            <div><small>本周推荐</small><h2>把 AI 真正接入你的工作。</h2><p>从账号配置到自动化落地，提供一对一远程协助。</p><button onClick={() => setSelectedProduct(products.find(product => product.slug === 'tech-consulting') || null)}>了解详情</button></div>
            <div className="feature-art"><span><Hammer /></span><span><MessageCircle /></span><Hammer /></div>
          </section>

          <section className="store-catalog">
            <div className="catalog-heading"><div><small>精选</small><h2>值得入手</h2></div><div className="segmented" aria-label="商品类型">{[['all','全部'],['digital','非邮寄'],['shipping','需邮寄']].map(([value,label]) => <button key={value} className={fulfillmentFilter === value ? 'active' : ''} onClick={() => setFulfillmentFilter(value)}>{label}</button>)}</div></div>
            {loading && <div className="store-empty">正在载入商品…</div>}
            {!loading && filteredProducts.length === 0 && <div className="store-empty">没有找到相关商品</div>}
            <div className="store-product-grid">{filteredProducts.map(product => <ProductCard key={product.id} product={product} onOpen={() => setSelectedProduct(product)} />)}</div>
          </section>

          <section className="store-trust"><div><CreditCard /><h3>灵活支付</h3><p>支持支付宝、微信与 USDT。</p></div><div><CheckCircle2 /><h3>付款可核验</h3><p>每笔订单均保留支付流水。</p></div><div><MessageCircle /><h3>处理有提醒</h3><p>付款后自动触发订单通知。</p></div></section>
          <footer className="store-footer"><span>Copyright © 2026 Silas Store</span><a href="/navigation">返回主站</a><a href="/mystore/admin">管理员</a></footer>
        </div>
      </main>

      <aside className={`bag-drawer ${bagOpen ? 'open' : ''}`} aria-label="购物袋">
        <div className="drawer-head"><div><small>购物袋</small><h2>你的商品</h2></div><button className="store-icon-button" aria-label="关闭购物袋" onClick={() => setBagOpen(false)}><X /></button></div>
        <div className="bag-lines">{bagProducts.length === 0 ? <div className="store-empty"><ShoppingBag /><h3>购物袋是空的</h3><p>加入商品后可在这里统一结账。</p></div> : bagProducts.map(product => <div className="bag-line" key={product.id}><div><h3>{product.name}</h3><p>{money(product.price_cents)} · {product.fulfillment === 'shipping' ? '需邮寄' : '非邮寄'}</p></div><button aria-label={`移除 ${product.name}`} onClick={() => setBag(current => current.filter(id => id !== product.id))}><Trash2 size={16} /></button></div>)}</div>
        {bagProducts.length > 0 && <div className="bag-total"><div><span>合计</span><strong>{money(bagTotal)}</strong></div><p>最终支付金额以结账页面为准。</p><button className="store-primary" onClick={() => { setBagOpen(false); setCheckoutOpen(true); }}>继续结账</button></div>}
      </aside>
      {bagOpen && <button className="drawer-scrim" aria-label="关闭购物袋" onClick={() => setBagOpen(false)} />}

      {selectedProduct && <Modal onClose={() => setSelectedProduct(null)}><ProductDetail product={selectedProduct} onAdd={() => addToBag(selectedProduct)} /></Modal>}
      {checkoutOpen && <Modal wide onClose={() => { setCheckoutOpen(false); setReceipt(null); }}><CheckoutContent form={checkout} setForm={setCheckout} needsShipping={needsShipping} products={bagProducts} total={bagTotal} receipt={receipt} paymentReference={paymentReference} setPaymentReference={setPaymentReference} setPaymentProof={setPaymentProof} onCreate={createOrder} onPayment={submitPayment} busy={busy} /></Modal>}
      {lookupOpen && <Modal onClose={() => { setLookupOpen(false); setLookupResult(null); }}><LookupContent lookup={lookup} setLookup={setLookup} result={lookupResult} onSubmit={lookupOrder} busy={busy} /></Modal>}

      {error && <div className="store-toast error" role="alert">{error}<button onClick={() => setError('')}><X size={15} /></button></div>}
      {notice && <div className="store-toast" role="status"><Check size={16} />{notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
    </div>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const Icon = iconMap[product.icon] || Package;
  return <article className="store-product-card" onClick={onOpen} tabIndex={0} onKeyDown={event => event.key === 'Enter' && onOpen()}><div className={`product-icon tone-${product.sort_order % 4}`}><Icon /></div><div className="product-copy"><h3>{product.name}</h3><p>{product.subtitle}</p><div><span>{product.fulfillment === 'shipping' ? '需邮寄' : '非邮寄'}</span><span>{product.delivery_note}</span></div></div><div className="product-buy"><strong>{money(product.price_cents)}</strong><button onClick={event => { event.stopPropagation(); onOpen(); }}>获取</button></div></article>;
}

function Modal({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="store-modal-layer" role="presentation"><section className={`store-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true"><button className="store-icon-button modal-close" aria-label="关闭" onClick={onClose}><X /></button>{children}</section></div>;
}

function ProductDetail({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const Icon = iconMap[product.icon] || Package;
  return <div className="product-detail"><div className="product-detail-head"><div className="product-icon large"><Icon /></div><div><small>{product.fulfillment === 'shipping' ? '需邮寄' : '非邮寄'}</small><h2>{product.name}</h2><p>{product.subtitle}</p></div></div><div className="detail-price"><strong>{money(product.price_cents)}</strong><button className="store-primary" onClick={onAdd}>加入购物袋</button></div><p className="detail-description">{product.description}</p><dl><div><dt>交付方式</dt><dd>{product.fulfillment === 'shipping' ? '快递邮寄' : '线上交付'}</dd></div><div><dt>预计时间</dt><dd>{product.delivery_note}</dd></div><div><dt>订单查询</dt><dd>无需登录</dd></div></dl></div>;
}

function CheckoutContent(props: { form: CheckoutForm; setForm: React.Dispatch<React.SetStateAction<CheckoutForm>>; needsShipping: boolean; products: Product[]; total: number; receipt: OrderReceipt | null; paymentReference: string; setPaymentReference: (value: string) => void; setPaymentProof: (file: File | null) => void; onCreate: (event: React.FormEvent) => void; onPayment: (event: React.FormEvent) => void; busy: boolean }) {
  const { form, setForm, needsShipping, products, total, receipt, busy } = props;
  const update = (field: keyof CheckoutForm, value: string) => setForm(current => ({ ...current, [field]: value }));
  if (receipt) {
    const configValue = receipt.paymentMethod === 'usdt' ? receipt.paymentConfig.usdtAddress : receipt.paymentMethod === 'alipay' ? receipt.paymentConfig.alipayQrUrl : receipt.paymentConfig.wechatQrUrl;
    return <form className="payment-step" onSubmit={props.onPayment}><small>订单已创建</small><h2>完成付款并提交流水</h2><div className="order-credentials"><div><span>订单号</span><strong>{receipt.orderNumber}</strong></div><div><span>查询密钥</span><strong>{receipt.lookupKey}</strong></div><p>查询密钥只显示一次，已同时保存在当前浏览器。</p></div><div className="payment-instruction"><h3>{paymentNames[receipt.paymentMethod]} · {money(receipt.totalCents)}</h3>{receipt.paymentMethod === 'usdt' ? <><p>网络：TRC20</p><code>{configValue || '上线后配置 USDT 收款地址'}</code></> : configValue ? <img src={configValue} alt={`${paymentNames[receipt.paymentMethod]}收款码`} /> : <div className="qr-placeholder"><CreditCard /><span>上线后配置收款码</span></div>}</div><label>付款流水号 / USDT 交易哈希<input required value={props.paymentReference} onChange={event => props.setPaymentReference(event.target.value)} placeholder="用于核验付款" /></label><label>付款截图（可选，最大 5MB）<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => props.setPaymentProof(event.target.files?.[0] || null)} /></label><button className="store-primary" disabled={busy}>{busy ? '正在提交…' : '我已付款，提交核验'}</button></form>;
  }
  return <form className="checkout-layout" onSubmit={props.onCreate}><div className="checkout-form"><small>安全结账</small><h2>完成订单</h2><p>无需登录。订单号将用于后续查询。</p><h3>联系方式</h3><div className="form-grid"><label>姓名<input required value={form.contactName} onChange={event => update('contactName', event.target.value)} placeholder="收件人或联系人" /></label><label>邮箱<input type="email" value={form.email} onChange={event => update('email', event.target.value)} placeholder="name@example.com" /></label></div><label>Telegram / 微信<input value={form.messenger} onChange={event => update('messenger', event.target.value)} placeholder="至少填写邮箱或此项" /></label>{needsShipping && <><h3>配送信息</h3><label>地址<input required value={form.shippingAddress} onChange={event => update('shippingAddress', event.target.value)} placeholder="省市区及详细地址" /></label><div className="form-grid"><label>电话<input required value={form.shippingPhone} onChange={event => update('shippingPhone', event.target.value)} placeholder="联系电话" /></label><label>邮编<input value={form.shippingPostalCode} onChange={event => update('shippingPostalCode', event.target.value)} placeholder="邮政编码" /></label></div></>}<h3>支付方式</h3><div className="payment-options">{(['alipay','wechat','usdt'] as const).map(method => <label key={method} className={form.paymentMethod === method ? 'selected' : ''}><input type="radio" name="payment" checked={form.paymentMethod === method} onChange={() => update('paymentMethod', method)} /><b>{method === 'alipay' ? '支' : method === 'wechat' ? '微' : '₮'}</b><span><strong>{paymentNames[method]}</strong><small>{method === 'usdt' ? 'TRC20' : '扫码支付'}</small></span></label>)}</div><label>订单备注（可选）<textarea value={form.note} onChange={event => update('note', event.target.value)} placeholder="交付要求或其他说明" /></label></div><aside className="checkout-summary"><h3>订单摘要</h3>{products.map(product => <div key={product.id}><span>{product.name}</span><strong>{money(product.price_cents)}</strong></div>)}<hr /><div className="checkout-total"><span>应付</span><strong>{money(total)}</strong></div><button className="store-primary" disabled={busy}>{busy ? '正在创建…' : '创建订单并付款'}</button><p><Check size={14} />订单与支付信息将留存供核验</p></aside></form>;
}

function LookupContent({ lookup, setLookup, result, onSubmit, busy }: { lookup: { orderNumber: string; lookupKey: string }; setLookup: React.Dispatch<React.SetStateAction<{ orderNumber: string; lookupKey: string }>>; result: LookupOrder | null; onSubmit: (event: React.FormEvent) => void; busy: boolean }) {
  return <div className="lookup-content"><ReceiptText className="lookup-symbol" /><small>无需登录</small><h2>查询订单</h2><p>输入创建订单时获得的订单号与查询密钥。</p><form onSubmit={onSubmit}><label>订单号<input required value={lookup.orderNumber} onChange={event => setLookup(current => ({ ...current, orderNumber: event.target.value }))} placeholder="SS-20260718-…" /></label><label>查询密钥<input required value={lookup.lookupKey} onChange={event => setLookup(current => ({ ...current, lookupKey: event.target.value }))} placeholder="区分大小写" /></label><button className="store-primary" disabled={busy}>{busy ? '正在查询…' : '查询'}</button></form>{result && <div className="lookup-result"><div><span>订单状态</span><strong>{orderStatusNames[result.order_status] || result.order_status}</strong></div><div><span>付款状态</span><strong>{paymentStatusNames[result.payment_status] || result.payment_status}</strong></div><div><span>订单金额</span><strong>{money(result.total_cents)}</strong></div><ul>{result.items.map(item => <li key={item.product_name}>{item.product_name}</li>)}</ul></div>}</div>;
}
