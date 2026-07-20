import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Image, ImagePlus as Images, LayoutGrid, LogOut, PackagePlus, RefreshCw, Save, Search, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { storeApi } from '../services/storeApi';
import type { Category, OrderSummary, Product, ProductImage } from '../types/store';
import '../styles/store.css';

const emptyProduct: Product = { id: '', category_id: '', slug: '', name: '', subtitle: '', description: '', price_cents: 0, original_price_cents: 0, image_id: '', image_url: '', fulfillment: 'digital', delivery_note: '', icon: 'Package', sort_order: 0, active: 1 };
const paymentStatusOptions = ['awaiting_payment', 'submitted', 'verified', 'rejected', 'refunded'];
const orderStatusOptions = ['pending', 'processing', 'fulfilled', 'shipped', 'completed', 'cancelled'];

export default function StoreAdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('silas-store-admin-token') || '');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'orders' | 'products' | 'categories' | 'settings'>('orders');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageLimit, setImageLimit] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', sortOrder: 0, gridColumns: 2 });
  const [search, setSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productFulfillment, setProductFulfillment] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setBusy(true); setError('');
    try {
      const data = await storeApi.getAdminData();
      setOrders(data.orders); setProducts(data.products); setCategories(data.categories); setImages(data.images); setImageLimit(data.imageLimit);
    } catch (err) {
      setError((err as Error).message);
      if ((err as Error).message.includes('登录')) logout();
    } finally { setBusy(false); }
  };

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Silas Store 管理';
    if (token) void loadData();
    return () => { document.title = previousTitle; };
    // Loading is intentionally keyed to the session token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await storeApi.adminLogin(password);
      sessionStorage.setItem('silas-store-admin-token', result.token); setToken(result.token); setPassword('');
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  const logout = () => { sessionStorage.removeItem('silas-store-admin-token'); setToken(''); };

  const filteredOrders = useMemo(() => orders.filter(order => `${order.order_number} ${order.contact_name} ${order.product_names} ${order.payment_reference}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const filteredProducts = useMemo(() => products.filter(product => {
    const term = productSearch.trim().toLowerCase();
    const matchesSearch = !term || `${product.name} ${product.subtitle} ${product.category_name}`.toLowerCase().includes(term);
    const matchesCategory = productCategory === 'all' || product.category_id === productCategory;
    const matchesFulfillment = productFulfillment === 'all' || product.fulfillment === productFulfillment;
    return matchesSearch && matchesCategory && matchesFulfillment;
  }), [products, productSearch, productCategory, productFulfillment]);

  const saveOrder = async () => {
    if (!selectedOrder) return;
    setBusy(true); setError('');
    try {
      await storeApi.updateOrder(selectedOrder.order_number, { orderStatus: selectedOrder.order_status, paymentStatus: selectedOrder.payment_status, adminNote: selectedOrder.admin_note });
      await loadData();
    } catch (err) { setError((err as Error).message); setBusy(false); }
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault(); if (!editingProduct) return;
    setBusy(true); setError('');
    try { await storeApi.saveProduct(editingProduct, !editingProduct.id); setEditingProduct(null); await loadData(); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  };

  const createCategory = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await storeApi.createCategory(newCategory); setNewCategory({ name: '', slug: '', sortOrder: 0, gridColumns: 2 }); await loadData(); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  };

  const viewProof = async (orderNumber: string) => {
    try { const blob = await storeApi.fetchProof(orderNumber); window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer'); }
    catch (err) { setError((err as Error).message); }
  };

  const updateCategoryLayout = async (category: Category, gridColumns: 1 | 2) => {
    setBusy(true); setError('');
    try { await storeApi.updateCategory({ ...category, grid_columns: gridColumns }); await loadData(); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  };

  const uploadProductImage = async (file: File) => {
    setBusy(true); setError('');
    try {
      const result = await storeApi.uploadProductImage(file);
      setImages(current => [result.image, ...current]);
      return result.image;
    } catch (err) { setError((err as Error).message); return null; }
    finally { setBusy(false); }
  };

  const deleteProductImage = async (image: ProductImage) => {
    setBusy(true); setError('');
    try { await storeApi.deleteProductImage(image.id); setImages(current => current.filter(item => item.id !== image.id)); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  const updateImageLimit = async (limit: number) => {
    setBusy(true); setError('');
    try { const result = await storeApi.updateImageLimit(limit); setImageLimit(result.limit); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  if (!token) return <div className="store-admin admin-login"><form onSubmit={login}><ShieldCheck size={36} /><h1>商店管理</h1><p>输入 Cloudflare 中配置的管理员密码。</p><label className="admin-field">管理员密码<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>{error && <p className="admin-error">{error}</p>}<button className="store-primary" disabled={busy}>{busy ? '正在登录…' : '登录'}</button></form></div>;

  return <div className="store-admin admin-shell">
    <aside className="admin-sidebar"><h1>Silas Store 管理</h1><nav><button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>订单</button><button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>商品</button><button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>分类</button><button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>页面设置</button></nav><button className="logout" onClick={logout}><LogOut size={15} /> 退出登录</button></aside>
    <main className="admin-main">
      <header className="admin-header"><div><small>管理员后台</small><h2>{tab === 'orders' ? '订单管理' : tab === 'products' ? '商品管理' : tab === 'categories' ? '分类管理' : '页面设置'}</h2></div><div className="admin-toolbar">{tab === 'orders' && <input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索订单" />}<button className="admin-secondary" onClick={loadData} disabled={busy}><RefreshCw size={15} /> 刷新</button>{tab === 'products' && <button className="store-primary" onClick={() => setEditingProduct({ ...emptyProduct, category_id: categories[0]?.id || '' })}><PackagePlus size={15} /> 新增商品</button>}</div></header>
      {error && <div className="admin-panel admin-error">{error}</div>}

      {tab === 'orders' && <><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>订单号</th><th>时间</th><th>客户</th><th>商品</th><th>金额</th><th>付款</th><th>订单状态</th></tr></thead><tbody>{filteredOrders.map(order => <tr key={order.id} onClick={() => setSelectedOrder({ ...order })}><td>{order.order_number}</td><td>{new Date(`${order.created_at}Z`).toLocaleString('zh-CN')}</td><td>{order.contact_name}</td><td>{order.product_names}</td><td>¥{(order.total_cents / 100).toFixed(2)}</td><td><span className="status-pill">{order.payment_status}</span></td><td>{order.order_status}</td></tr>)}</tbody></table></div>{selectedOrder && <section className="admin-panel"><h3>{selectedOrder.order_number}</h3><div className="admin-form-grid"><label className="admin-field">订单状态<select value={selectedOrder.order_status} onChange={event => setSelectedOrder({ ...selectedOrder, order_status: event.target.value })}>{orderStatusOptions.map(value => <option key={value}>{value}</option>)}</select></label><label className="admin-field">付款状态<select value={selectedOrder.payment_status} onChange={event => setSelectedOrder({ ...selectedOrder, payment_status: event.target.value })}>{paymentStatusOptions.map(value => <option key={value}>{value}</option>)}</select></label><label className="admin-field">付款方式<input readOnly value={selectedOrder.payment_method} /></label><label className="admin-field">付款流水<input readOnly value={selectedOrder.payment_reference || '尚未提交'} /></label><label className="admin-field">联系方式<input readOnly value={[selectedOrder.email, selectedOrder.messenger].filter(Boolean).join(' / ')} /></label><label className="admin-field">配送信息<input readOnly value={[selectedOrder.shipping_address, selectedOrder.shipping_phone].filter(Boolean).join(' / ') || '非邮寄'} /></label></div><label className="admin-field">管理员备注<textarea value={selectedOrder.admin_note || ''} onChange={event => setSelectedOrder({ ...selectedOrder, admin_note: event.target.value })} /></label><div className="admin-form-actions">{selectedOrder.payment_proof_key && <button className="admin-secondary" onClick={() => viewProof(selectedOrder.order_number)}><ExternalLink size={15} /> 查看付款截图</button>}<button className="admin-secondary" onClick={() => setSelectedOrder(null)}>关闭</button><button className="store-primary" disabled={busy} onClick={saveOrder}><Save size={15} /> 保存状态</button></div></section>}</>}

      {tab === 'products' && <><div className="admin-product-filters"><label><Search size={15} /><input value={productSearch} onChange={event => setProductSearch(event.target.value)} placeholder="搜索商品" /></label><select value={productCategory} onChange={event => setProductCategory(event.target.value)}><option value="all">全部分类</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select><div className="segmented">{[['all','全部'],['digital','非邮寄'],['shipping','需邮寄']].map(([value,label]) => <button type="button" key={value} className={productFulfillment === value ? 'active' : ''} onClick={() => setProductFulfillment(value)}>{label}</button>)}</div></div><div className="admin-product-grid">{filteredProducts.map(product => { const hasDiscount = product.original_price_cents > product.price_cents; const discount = hasDiscount ? Number(((product.price_cents / product.original_price_cents) * 10).toFixed(1)) : null; return <article className="admin-product-row" key={product.id}>{product.image_url && <img className="admin-product-thumb" src={product.image_url} alt="" />}<h3>{product.name}</h3><p>{product.category_name} · ¥{(product.price_cents / 100).toFixed(2)}{hasDiscount && <> / 原价 ¥{(product.original_price_cents / 100).toFixed(2)} · {discount}折</>} · {product.fulfillment === 'shipping' ? '邮寄' : '线上'}</p><footer><span className="status-pill">{product.active === 0 ? '已下架' : '销售中'}</span><button className="admin-secondary" onClick={() => setEditingProduct({ ...product })}>编辑</button></footer></article>; })}</div>{filteredProducts.length === 0 && <div className="admin-empty">没有符合条件的商品</div>}{editingProduct && <ProductEditor product={editingProduct} categories={categories} images={images} setProduct={setEditingProduct} onUpload={uploadProductImage} onSubmit={saveProduct} onClose={() => setEditingProduct(null)} busy={busy} />}</>}

      {tab === 'categories' && <><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>名称</th><th>标识</th><th>排序</th><th>状态</th><th /></tr></thead><tbody>{categories.map(category => <tr key={category.id}><td>{category.name}</td><td>{category.slug}</td><td>{category.sort_order}</td><td>{category.active === 0 ? '停用' : '启用'}</td><td><button className="admin-secondary" onClick={async event => { event.stopPropagation(); await storeApi.updateCategory({ ...category, active: category.active === 0 ? 1 : 0 }); await loadData(); }}>{category.active === 0 ? '启用' : '停用'}</button></td></tr>)}</tbody></table></div><form className="admin-panel" onSubmit={createCategory}><h3>新增分类</h3><div className="admin-form-grid"><label className="admin-field">名称<input required value={newCategory.name} onChange={event => setNewCategory({ ...newCategory, name: event.target.value })} /></label><label className="admin-field">英文标识<input required pattern="[a-z0-9-]+" value={newCategory.slug} onChange={event => setNewCategory({ ...newCategory, slug: event.target.value })} /></label></div><div className="admin-form-actions"><button className="store-primary">新增分类</button></div></form></>}
      {tab === 'settings' && <><CategoryLayoutSettings categories={categories} busy={busy} onChange={updateCategoryLayout} /><ImageLibrarySettings images={images} limit={imageLimit} busy={busy} onLimitChange={updateImageLimit} onDelete={deleteProductImage} /></>}
    </main>
  </div>;
}

function ProductEditor({ product, categories, images, setProduct, onUpload, onSubmit, onClose, busy }: { product: Product; categories: Category[]; images: ProductImage[]; setProduct: (product: Product) => void; onUpload: (file: File) => Promise<ProductImage | null>; onSubmit: (event: React.FormEvent) => void; onClose: () => void; busy: boolean }) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const update = (field: keyof Product, value: string | number) => setProduct({ ...product, [field]: value });
  const discount = product.original_price_cents > product.price_cents ? Number(((product.price_cents / product.original_price_cents) * 10).toFixed(1)) : null;
  const chooseImage = (image: ProductImage) => { setProduct({ ...product, image_id: image.id, image_url: image.url }); setLibraryOpen(false); };
  return <form className="admin-panel" onSubmit={onSubmit}><h3>{product.id ? '编辑商品' : '新增商品'}</h3><section className="product-image-editor"><div className="product-image-preview">{product.image_url ? <img src={product.image_url} alt="当前商品" /> : <Image />}</div><div><strong>商品图片</strong><p>支持 JPG、PNG、WebP，单张最大 5MB。</p><div className="product-image-actions"><label className="admin-secondary"><Upload size={15} /> 上传图片<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event => { const file = event.target.files?.[0]; if (!file) return; const image = await onUpload(file); if (image) chooseImage(image); event.target.value = ''; }} /></label><button type="button" className="admin-secondary" onClick={() => setLibraryOpen(value => !value)}><Images size={15} /> 选择图片库</button>{product.image_id && <button type="button" className="admin-secondary" onClick={() => setProduct({ ...product, image_id: '', image_url: '' })}>取消图片</button>}</div></div></section>{libraryOpen && <div className="image-picker">{images.length ? images.map(image => <button type="button" key={image.id} className={product.image_id === image.id ? 'selected' : ''} onClick={() => chooseImage(image)}><img src={image.url} alt={image.file_name} /><span>{image.file_name}</span></button>) : <div className="admin-empty">图片库为空，请先上传图片</div>}</div>}<div className="admin-form-grid"><label className="admin-field">商品名称<input required value={product.name} onChange={event => update('name', event.target.value)} /></label><label className="admin-field">英文标识<input required pattern="[a-z0-9-]+" value={product.slug} onChange={event => update('slug', event.target.value)} /></label><label className="admin-field">分类<select required value={product.category_id} onChange={event => update('category_id', event.target.value)}>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="admin-field">售价（元）<input required type="number" min="0" step="0.01" value={product.price_cents / 100} onChange={event => update('price_cents', Math.round(Number(event.target.value) * 100))} /></label><label className="admin-field">原价（元）<input type="number" min="0" step="0.01" value={product.original_price_cents / 100} onChange={event => update('original_price_cents', Math.round(Number(event.target.value) * 100))} /><small>{discount ? `前端将显示 ${discount}折` : '原价高于售价时显示折扣'}</small></label><label className="admin-field">交付方式<select value={product.fulfillment} onChange={event => update('fulfillment', event.target.value)}><option value="digital">线上交付</option><option value="shipping">需要邮寄</option></select></label><label className="admin-field">预计时间<input value={product.delivery_note} onChange={event => update('delivery_note', event.target.value)} /></label><label className="admin-field">副标题<input value={product.subtitle} onChange={event => update('subtitle', event.target.value)} /></label><label className="admin-field">排序<input type="number" value={product.sort_order} onChange={event => update('sort_order', Number(event.target.value))} /></label></div><label className="admin-field">详细说明<textarea value={product.description} onChange={event => update('description', event.target.value)} /></label><div className="admin-form-actions"><button type="button" className="admin-secondary" onClick={onClose}>取消</button><button className="store-primary" disabled={busy}><Save size={15} /> 保存商品</button></div></form>;
}

function CategoryLayoutSettings({ categories, busy, onChange }: { categories: Category[]; busy: boolean; onChange: (category: Category, gridColumns: 1 | 2) => void }) {
  return <section className="admin-panel category-layout-settings">
    <div className="settings-heading"><LayoutGrid size={22} /><div><h3>分类页面布局</h3><p>分别设置用户进入每个分类后，商品列表每行显示一个或两个条目。</p></div></div>
    <div className="category-layout-list">{categories.map(category => <div key={category.id} className="category-layout-row"><div><strong>{category.name}</strong><small>/{category.slug}</small></div><label className="admin-field">条目布局<select value={category.grid_columns === 1 ? 1 : 2} disabled={busy} onChange={event => onChange(category, Number(event.target.value) === 1 ? 1 : 2)}><option value={1}>每行 1 个</option><option value={2}>每行 2 个</option></select></label></div>)}</div>
  </section>;
}

function ImageLibrarySettings({ images, limit, busy, onLimitChange, onDelete }: { images: ProductImage[]; limit: number; busy: boolean; onLimitChange: (limit: number) => void; onDelete: (image: ProductImage) => void }) {
  const [value, setValue] = useState(limit);
  useEffect(() => setValue(limit), [limit]);
  return <section className="admin-panel image-library-settings"><div className="settings-heading"><Images size={22} /><div><h3>商品图片库</h3><p>已使用 {images.length} / {limit} 张。文件存储在私有 R2，通过商店图片接口访问。</p></div></div><div className="image-limit-control"><label className="admin-field">图片数量上限<input type="number" min="1" max="100" value={value} onChange={event => setValue(Number(event.target.value))} /></label><button className="admin-secondary" disabled={busy || value === limit} onClick={() => onLimitChange(value)}>保存上限</button></div><div className="image-library-grid">{images.map(image => <article key={image.id}><img src={image.url} alt={image.file_name} /><div><strong>{image.file_name}</strong><small>{(image.size_bytes / 1024).toFixed(0)} KB · 使用 {image.usage_count || 0} 次</small></div><button title="删除图片" disabled={busy || Number(image.usage_count) > 0} onClick={() => onDelete(image)}><Trash2 size={15} /></button></article>)}</div>{images.length === 0 && <div className="admin-empty">图片库为空</div>}</section>;
}
