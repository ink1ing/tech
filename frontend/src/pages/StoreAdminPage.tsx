import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Image,
  ImagePlus as Images,
  LayoutGrid,
  LogOut,
  Moon,
  PackagePlus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import { storeApi } from "../services/storeApi";
import type {
  Category,
  OrderSummary,
  Product,
  ProductImage,
} from "../types/store";
import "../styles/store.css";

const emptyProduct: Product = {
  id: "",
  category_id: "",
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  price_cents: 0,
  original_price_cents: 0,
  image_id: "",
  image_url: "",
  description_images: [],
  fulfillment: "digital",
  delivery_note: "",
  icon: "Package",
  sort_order: 0,
  active: 1,
};
const paymentStatusOptions = [
  "awaiting_payment",
  "submitted",
  "verified",
  "rejected",
  "refunded",
];
const orderStatusOptions = [
  "pending",
  "processing",
  "fulfilled",
  "shipped",
  "completed",
  "cancelled",
];

type ProductUpdater = (current: Product) => Product;
const retryDelay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export default function StoreAdminPage() {
  const [token, setToken] = useState("checking");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<
    "orders" | "products" | "categories" | "settings"
  >("orders");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProductIsNew, setEditingProductIsNew] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const productEditorRef = useRef<HTMLDivElement>(null);
  const pendingImages = useRef(new Map<string, string>());
  const editorSession = useRef(0);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    sortOrder: 0,
    gridColumns: 2,
  });
  const [search, setSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [productFulfillment, setProductFulfillment] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("silas-store-admin-theme") === "dark",
  );

  const deletePendingImageWithRetry = async (
    productId: string,
    imageId: string,
  ) => {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await storeApi.deletePendingProductImage(productId, imageId);
        pendingImages.current.delete(imageId);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < 2) await retryDelay(150 * (attempt + 1));
      }
    }
    throw lastError instanceof Error ? lastError : new Error("临时图片清理失败");
  };

  const flushPendingImages = async (productId?: string) => {
    const entries = [...pendingImages.current.entries()].filter(
      ([, ownerProductId]) => !productId || ownerProductId === productId,
    );
    const results = await Promise.allSettled(
      entries.map(([imageId, ownerProductId]) =>
        deletePendingImageWithRetry(ownerProductId, imageId),
      ),
    );
    return results.filter((result) => result.status === "rejected").length;
  };

  const updateEditingProduct = (update: ProductUpdater) => {
    setEditingProduct((current) => (current ? update(current) : current));
  };

  const loadData = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await storeApi.getAdminData();
      setOrders(data.orders);
      setProducts(data.products);
      setCategories(data.categories);
    } catch (err) {
      setError((err as Error).message);
      if ((err as Error).message.includes("登录")) logout(true);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Silas Store 管理";
    if (token) void loadData();
    return () => {
      document.title = previousTitle;
    };
    // Loading is intentionally keyed to the session token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    localStorage.setItem(
      "silas-store-admin-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  useEffect(() => () => {
    editorSession.current += 1;
    for (const [imageId, productId] of pendingImages.current.entries()) {
      void fetch(
        `/api/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
        { method: "DELETE", credentials: "same-origin", keepalive: true },
      );
    }
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await storeApi.adminLogin(password);
      setToken("authenticated");
      setPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const logout = (force = false) => {
    if (busy && !force) return;
    editorSession.current += 1;
    setBusy(true);
    void (async () => {
      try {
        await flushPendingImages();
      } finally {
        await storeApi.adminLogout().catch(() => undefined);
        setEditingProduct(null);
        setEditingProductIsNew(false);
        setToken("");
        setBusy(false);
      }
    })();
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        `${order.order_number} ${order.contact_name} ${order.product_names} ${order.payment_reference}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [orders, search],
  );
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const term = productSearch.trim().toLowerCase();
        const matchesSearch =
          !term ||
          `${product.name} ${product.subtitle} ${product.category_name}`
            .toLowerCase()
            .includes(term);
        const matchesCategory =
          productCategory === "all" || product.category_id === productCategory;
        const matchesFulfillment =
          productFulfillment === "all" ||
          product.fulfillment === productFulfillment;
        return matchesSearch && matchesCategory && matchesFulfillment;
      }),
    [products, productSearch, productCategory, productFulfillment],
  );

  const editingProductKey = editingProduct ? editingProduct.id || "new" : "";
  useEffect(() => {
    if (!editingProductKey) return;
    requestAnimationFrame(() => {
      productEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [editingProductKey]);

  const saveOrder = async () => {
    if (!selectedOrder) return;
    setBusy(true);
    setError("");
    try {
      await storeApi.updateOrder(selectedOrder.order_number, {
        orderStatus: selectedOrder.order_status,
        paymentStatus: selectedOrder.payment_status,
        adminNote: selectedOrder.admin_note,
      });
      await loadData();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProduct) return;
    setBusy(true);
    setError("");
    try {
      await storeApi.saveProduct(editingProduct, editingProductIsNew);
      const retained = new Set([
        editingProduct.image_id,
        ...(editingProduct.description_images || []).map((image) => image.id),
      ].filter(Boolean));
      retained.forEach((id) => pendingImages.current.delete(id));
      const cleanupFailures = await flushPendingImages(editingProduct.id);
      editorSession.current += 1;
      setEditingProduct(null);
      setEditingProductIsNew(false);
      await loadData();
      if (cleanupFailures) setError("商品已保存；少量临时图片会在过期后由管理端自动清理。");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const createCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await storeApi.createCategory(newCategory);
      setNewCategory({ name: "", slug: "", sortOrder: 0, gridColumns: 2 });
      await loadData();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const viewProof = async (orderNumber: string) => {
    try {
      const blob = await storeApi.fetchProof(orderNumber);
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateCategoryLayout = async (
    category: Category,
    gridColumns: 1 | 2,
  ) => {
    setBusy(true);
    setError("");
    try {
      await storeApi.updateCategory({ ...category, grid_columns: gridColumns });
      await loadData();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCategory) return;
    setBusy(true);
    setError("");
    try {
      await storeApi.updateCategory(editingCategory);
      setEditingCategory(null);
      await loadData();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const uploadProductImage = async (file: File, role: "avatar" | "description") => {
    if (!editingProduct) return null;
    const productId = editingProduct.id;
    const session = editorSession.current;
    setBusy(true);
    setError("");
    try {
      const result = await storeApi.uploadProductImage(productId, role, file);
      pendingImages.current.set(result.image.id, productId);
      if (session !== editorSession.current) {
        await deletePendingImageWithRetry(productId, result.image.id);
        return null;
      }
      return result.image;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const discardPendingImage = async (imageId: string) => {
    if (!editingProduct) return false;
    const ownerProductId = pendingImages.current.get(imageId);
    if (!ownerProductId) return true;
    setBusy(true);
    setError("");
    try {
      await deletePendingImageWithRetry(ownerProductId, imageId);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const closeProductEditor = async () => {
    if (!editingProduct) return true;
    if (busy) return false;
    setBusy(true);
    setError("");
    const cleanupFailures = await flushPendingImages(editingProduct.id);
    if (cleanupFailures) {
      setError("临时图片清理失败，请检查网络后再次点击取消。");
      setBusy(false);
      return false;
    }
    editorSession.current += 1;
    setEditingProduct(null);
    setEditingProductIsNew(false);
    setBusy(false);
    return true;
  };

  const openProductEditor = async (product: Product, isNew: boolean) => {
    if (busy) return;
    if (editingProduct && !await closeProductEditor()) return;
    editorSession.current += 1;
    setEditingProduct(product);
    setEditingProductIsNew(isNew);
  };

  const changeTab = async (nextTab: typeof tab) => {
    if (busy) return;
    if (editingProduct && !await closeProductEditor()) return;
    setTab(nextTab);
  };

  if (!token)
    return (
      <div
        className="store-admin admin-login"
        data-theme={darkMode ? "dark" : "light"}
      >
        <button
          className="admin-theme-toggle"
          title="切换深色模式"
          onClick={() => setDarkMode((value) => !value)}
        >
          {darkMode ? <Sun /> : <Moon />}
        </button>
        <form onSubmit={login}>
          <ShieldCheck size={36} />
          <h1>商店管理</h1>
          <p>输入 Cloudflare 中配置的管理员密码。</p>
          <label className="admin-field">
            管理员密码
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button className="store-primary" disabled={busy}>
            {busy ? "正在登录…" : "登录"}
          </button>
        </form>
      </div>
    );

  return (
    <div
      className="store-admin admin-shell"
      data-theme={darkMode ? "dark" : "light"}
    >
      <aside className="admin-sidebar">
        <h1>Silas Store 管理</h1>
        <nav>
          <button
            className={tab === "orders" ? "active" : ""}
            onClick={() => void changeTab("orders")}
            disabled={busy}
          >
            订单
          </button>
          <button
            className={tab === "products" ? "active" : ""}
            onClick={() => void changeTab("products")}
            disabled={busy}
          >
            商品
          </button>
          <button
            className={tab === "categories" ? "active" : ""}
            onClick={() => void changeTab("categories")}
            disabled={busy}
          >
            分类
          </button>
          <button
            className={tab === "settings" ? "active" : ""}
            onClick={() => void changeTab("settings")}
            disabled={busy}
          >
            页面设置
          </button>
        </nav>
        <button className="logout" onClick={() => logout()} disabled={busy}>
          <LogOut size={15} /> 退出登录
        </button>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <small>管理员后台</small>
            <h2>
              {tab === "orders"
                ? "订单管理"
                : tab === "products"
                  ? "商品管理"
                  : tab === "categories"
                    ? "分类管理"
                    : "页面设置"}
            </h2>
          </div>
          <div className="admin-toolbar">
            {tab === "orders" && (
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索订单"
              />
            )}
            <button
              className="admin-secondary admin-theme-button"
              title="切换深色模式"
              onClick={() => setDarkMode((value) => !value)}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="admin-secondary"
              onClick={loadData}
              disabled={busy}
            >
              <RefreshCw size={15} /> 刷新
            </button>
            {tab === "products" && (
              <button
                className="store-primary"
                disabled={busy}
                onClick={() =>
                  void openProductEditor({
                    ...emptyProduct,
                    id: `prod-${crypto.randomUUID()}`,
                    category_id:
                      productCategory !== "all"
                        ? productCategory
                        : categories[0]?.id || "",
                  }, true)
                }
              >
                <PackagePlus size={15} /> 新增商品
              </button>
            )}
          </div>
        </header>
        {error && <div className="admin-panel admin-error">{error}</div>}

        {tab === "orders" && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>时间</th>
                    <th>客户</th>
                    <th>商品</th>
                    <th>金额</th>
                    <th>付款</th>
                    <th>订单状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder({ ...order })}
                    >
                      <td>{order.order_number}</td>
                      <td>
                        {new Date(`${order.created_at}Z`).toLocaleString(
                          "zh-CN",
                        )}
                      </td>
                      <td>{order.contact_name}</td>
                      <td>{order.product_names}</td>
                      <td>¥{(order.total_cents / 100).toFixed(2)}</td>
                      <td>
                        <span className="status-pill">
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{order.order_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedOrder && (
              <section className="admin-panel">
                <h3>{selectedOrder.order_number}</h3>
                <div className="admin-form-grid">
                  <label className="admin-field">
                    订单状态
                    <select
                      value={selectedOrder.order_status}
                      onChange={(event) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          order_status: event.target.value,
                        })
                      }
                    >
                      {orderStatusOptions.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    付款状态
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(event) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          payment_status: event.target.value,
                        })
                      }
                    >
                      {paymentStatusOptions.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">
                    付款方式
                    <input readOnly value={selectedOrder.payment_method} />
                  </label>
                  <label className="admin-field">
                    付款流水
                    <input
                      readOnly
                      value={selectedOrder.payment_reference || "尚未提交"}
                    />
                  </label>
                  <label className="admin-field">
                    联系方式
                    <input
                      readOnly
                      value={[selectedOrder.email, selectedOrder.messenger]
                        .filter(Boolean)
                        .join(" / ")}
                    />
                  </label>
                  <label className="admin-field">
                    配送信息
                    <input
                      readOnly
                      value={
                        [
                          selectedOrder.shipping_address,
                          selectedOrder.shipping_phone,
                        ]
                          .filter(Boolean)
                          .join(" / ") || "非邮寄"
                      }
                    />
                  </label>
                </div>
                <label className="admin-field">
                  管理员备注
                  <textarea
                    value={selectedOrder.admin_note || ""}
                    onChange={(event) =>
                      setSelectedOrder({
                        ...selectedOrder,
                        admin_note: event.target.value,
                      })
                    }
                  />
                </label>
                <div className="admin-form-actions">
                  {selectedOrder.payment_proof_key && (
                    <button
                      className="admin-secondary"
                      onClick={() => viewProof(selectedOrder.order_number)}
                    >
                      <ExternalLink size={15} /> 查看付款截图
                    </button>
                  )}
                  <button
                    className="admin-secondary"
                    onClick={() => setSelectedOrder(null)}
                  >
                    关闭
                  </button>
                  <button
                    className="store-primary"
                    disabled={busy}
                    onClick={saveOrder}
                  >
                    <Save size={15} /> 保存状态
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {tab === "products" && (
          <>
            <div className="admin-product-filters">
              <label>
                <Search size={15} />
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="搜索商品"
                />
              </label>
              <select
                value={productCategory}
                onChange={(event) => setProductCategory(event.target.value)}
              >
                <option value="all">全部分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="segmented">
                {[
                  ["all", "全部"],
                  ["digital", "非邮寄"],
                  ["shipping", "需邮寄"],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={productFulfillment === value ? "active" : ""}
                    onClick={() => setProductFulfillment(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-product-grid">
              {filteredProducts.map((product) => {
                const hasDiscount =
                  product.original_price_cents > product.price_cents;
                const discount = hasDiscount
                  ? Number(
                      (
                        (product.price_cents / product.original_price_cents) *
                        10
                      ).toFixed(1),
                    )
                  : null;
                return (
                  <article className="admin-product-row" key={product.id}>
                    {product.image_url && (
                      <img
                        className="admin-product-thumb"
                        src={product.image_url}
                        alt=""
                      />
                    )}
                    <h3>{product.name}</h3>
                    <p>
                      {product.category_name} · ¥
                      {(product.price_cents / 100).toFixed(2)}
                      {hasDiscount && (
                        <>
                          {" "}
                          / 原价 ¥
                          {(product.original_price_cents / 100).toFixed(
                            2,
                          )} · {discount}折
                        </>
                      )}{" "}
                      · {product.fulfillment === "shipping" ? "邮寄" : "线上"}
                    </p>
                    <footer>
                      <span className="status-pill">
                        {product.active === 0 ? "已下架" : "销售中"}
                      </span>
                      <button
                        className="admin-secondary"
                        disabled={busy}
                        onClick={() =>
                          void openProductEditor({
                            ...product,
                            description_images:
                              product.description_images || [],
                          }, false)
                        }
                      >
                        编辑
                      </button>
                    </footer>
                  </article>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="admin-empty">没有符合条件的商品</div>
            )}
            {editingProduct && (
              <div className="admin-product-editor-stack" ref={productEditorRef}>
                <ProductDescriptionImages
                  key={`description-${editingProduct.id || "new"}`}
                  product={editingProduct}
                  setProduct={updateEditingProduct}
                  onUpload={(file) => uploadProductImage(file, "description")}
                  onDiscard={discardPendingImage}
                  busy={busy}
                />
                <ProductEditor
                  key={`editor-${editingProduct.id || "new"}`}
                  product={editingProduct}
                  categories={categories}
                  setProduct={updateEditingProduct}
                  onUpload={(file) => uploadProductImage(file, "avatar")}
                  onDiscard={discardPendingImage}
                  isNew={editingProductIsNew}
                  onSubmit={saveProduct}
                  onClose={() => void closeProductEditor()}
                  busy={busy}
                />
              </div>
            )}
          </>
        )}

        {tab === "categories" && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>标识</th>
                    <th>排序</th>
                    <th>状态</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.slug}</td>
                      <td>{category.sort_order}</td>
                      <td>{category.active === 0 ? "停用" : "启用"}</td>
                      <td>
                        <button
                          className="admin-secondary"
                          onClick={() => setEditingCategory({ ...category })}
                        >
                          编辑
                        </button>{" "}
                        <button
                          className="admin-secondary"
                          onClick={async (event) => {
                            event.stopPropagation();
                            await storeApi.updateCategory({
                              ...category,
                              active: category.active === 0 ? 1 : 0,
                            });
                            await loadData();
                          }}
                        >
                          {category.active === 0 ? "启用" : "停用"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {editingCategory && (
              <form className="admin-panel" onSubmit={saveCategory}>
                <h3>编辑分类</h3>
                <div className="admin-form-grid">
                  <label className="admin-field">
                    名称
                    <input
                      required
                      value={editingCategory.name}
                      onChange={(event) =>
                        setEditingCategory({ ...editingCategory, name: event.target.value })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    英文标识
                    <input
                      required
                      pattern="[a-z0-9-]+"
                      value={editingCategory.slug}
                      onChange={(event) =>
                        setEditingCategory({ ...editingCategory, slug: event.target.value })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    排序
                    <input
                      type="number"
                      value={editingCategory.sort_order}
                      onChange={(event) =>
                        setEditingCategory({ ...editingCategory, sort_order: Number(event.target.value) })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    每行商品数
                    <select
                      value={editingCategory.grid_columns || 2}
                      onChange={(event) =>
                        setEditingCategory({ ...editingCategory, grid_columns: Number(event.target.value) === 1 ? 1 : 2 })
                      }
                    >
                      <option value={1}>每行一个</option>
                      <option value={2}>每行两个</option>
                    </select>
                  </label>
                  <label className="admin-field">
                    状态
                    <select
                      value={editingCategory.active === 0 ? 0 : 1}
                      onChange={(event) =>
                        setEditingCategory({ ...editingCategory, active: Number(event.target.value) })
                      }
                    >
                      <option value={1}>启用</option>
                      <option value={0}>停用</option>
                    </select>
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="admin-secondary" onClick={() => setEditingCategory(null)}>
                    取消
                  </button>
                  <button className="store-primary" disabled={busy}>
                    <Save size={15} /> 保存分类
                  </button>
                </div>
              </form>
            )}
            <form className="admin-panel" onSubmit={createCategory}>
              <h3>新增分类</h3>
              <div className="admin-form-grid">
                <label className="admin-field">
                  名称
                  <input
                    required
                    value={newCategory.name}
                    onChange={(event) =>
                      setNewCategory({
                        ...newCategory,
                        name: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="admin-field">
                  英文标识
                  <input
                    required
                    pattern="[a-z0-9-]+"
                    value={newCategory.slug}
                    onChange={(event) =>
                      setNewCategory({
                        ...newCategory,
                        slug: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button className="store-primary">新增分类</button>
              </div>
            </form>
          </>
        )}
        {tab === "settings" && (
          <CategoryLayoutSettings
            categories={categories}
            busy={busy}
            onChange={updateCategoryLayout}
          />
        )}
      </main>
    </div>
  );
}

function ProductDescriptionImages({
  product,
  setProduct,
  onUpload,
  onDiscard,
  busy,
}: {
  product: Product;
  setProduct: (update: ProductUpdater) => void;
  onUpload: (file: File) => Promise<ProductImage | null>;
  onDiscard: (imageId: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [uploadSummary, setUploadSummary] = useState("");
  const selected = product.description_images || [];
  return (
    <section className="admin-panel description-image-editor">
      <div className="settings-heading">
        <Images size={22} />
        <div>
          <h3>商品描述图像</h3>
          <p>可一次选择多张图片；这些图片只用于商品详情，不会替换商品头像。</p>
        </div>
      </div>
      <div className="product-image-actions">
        <label className="admin-secondary">
          <Upload size={15} /> 批量上传描述图
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={async (event) => {
              const files = Array.from(event.target.files || []);
              if (!files.length) return;
              const uploaded: ProductImage[] = [];
              for (const file of files) {
                const image = await onUpload(file);
                if (image && image.id !== product.image_id) uploaded.push(image);
              }
              const unique = uploaded.filter(
                (image, index) =>
                  !selected.some((item) => item.id === image.id) &&
                  uploaded.findIndex((item) => item.id === image.id) === index,
              );
              if (unique.length)
                setProduct((current) => {
                  const currentImages = current.description_images || [];
                  const additions = unique.filter(
                    (image) => !currentImages.some((item) => item.id === image.id),
                  );
                  return {
                    ...current,
                    description_images: [...currentImages, ...additions],
                  };
                });
              const skipped = files.length - unique.length;
              setUploadSummary(
                `已加入 ${unique.length} 张${skipped > 0 ? `，${skipped} 张未加入` : ""}`,
              );
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {uploadSummary && <p className="image-upload-summary">{uploadSummary}</p>}
      {selected.length > 0 && (
        <div className="selected-description-images">
          {selected.map((image) => (
            <article key={image.id}>
              <img src={image.url} alt={image.file_name} />
              <button
                type="button"
                aria-label={`移除 ${image.file_name}`}
                disabled={busy}
                onClick={() => {
                  void (async () => {
                    if (!await onDiscard(image.id)) return;
                    setProduct((current) => ({
                      ...current,
                      description_images: (current.description_images || []).filter(
                        (item) => item.id !== image.id,
                      ),
                    }));
                  })();
                }}
              >
                <Trash2 size={15} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductEditor({
  product,
  categories,
  setProduct,
  onUpload,
  onDiscard,
  isNew,
  onSubmit,
  onClose,
  busy,
}: {
  product: Product;
  categories: Category[];
  setProduct: (update: ProductUpdater) => void;
  onUpload: (file: File) => Promise<ProductImage | null>;
  onDiscard: (imageId: string) => Promise<boolean>;
  isNew: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
  busy: boolean;
}) {
  const update = (field: keyof Product, value: string | number) =>
    setProduct((current) => ({ ...current, [field]: value }));
  const discount =
    product.original_price_cents > product.price_cents
      ? Number(
          ((product.price_cents / product.original_price_cents) * 10).toFixed(
            1,
          ),
        )
      : null;
  const chooseImage = (image: ProductImage) => {
    setProduct((current) => ({ ...current, image_id: image.id, image_url: image.url }));
  };
  return (
    <form className="admin-panel" onSubmit={onSubmit}>
      <h3>{isNew ? "新增商品" : "编辑商品"}</h3>
      <section className="product-image-editor">
        <div className="product-image-preview">
          {product.image_url ? (
            <img src={product.image_url} alt="当前商品头像" />
          ) : (
            <Image />
          )}
        </div>
        <div>
          <strong>商品头像</strong>
          <p>显示在商品列表中；每次上传一张，新图片会替换当前头像。支持 JPG、PNG、WebP，单张最大 5MB。</p>
          <div className="product-image-actions">
            <label className="admin-secondary">
              <Upload size={15} /> 上传单张头像
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const image = await onUpload(file);
                  if (image) {
                    if (await onDiscard(product.image_id)) chooseImage(image);
                  }
                  event.target.value = "";
                }}
              />
            </label>
            {product.image_id && (
              <button
                type="button"
                className="admin-secondary"
                disabled={busy}
                onClick={() => {
                  void (async () => {
                    if (!await onDiscard(product.image_id)) return;
                    setProduct((current) => ({ ...current, image_id: "", image_url: "" }));
                  })();
                }}
              >
                取消图片
              </button>
            )}
          </div>
        </div>
      </section>
      <div className="admin-form-grid">
        <label className="admin-field">
          商品名称
          <input
            required
            value={product.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label className="admin-field">
          英文标识
          <input
            required
            pattern="[a-z0-9-]+"
            value={product.slug}
            onChange={(event) => update("slug", event.target.value)}
          />
        </label>
        <label className="admin-field">
          分类
          <select
            required
            value={product.category_id}
            onChange={(event) => update("category_id", event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          售价（元）
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={product.price_cents / 100}
            onChange={(event) =>
              update(
                "price_cents",
                Math.round(Number(event.target.value) * 100),
              )
            }
          />
        </label>
        <label className="admin-field">
          原价（元）
          <input
            type="number"
            min="0"
            step="0.01"
            value={product.original_price_cents / 100}
            onChange={(event) =>
              update(
                "original_price_cents",
                Math.round(Number(event.target.value) * 100),
              )
            }
          />
          <small>
            {discount ? `前端将显示 ${discount}折` : "原价高于售价时显示折扣"}
          </small>
        </label>
        <label className="admin-field">
          交付方式
          <select
            value={product.fulfillment}
            onChange={(event) => update("fulfillment", event.target.value)}
          >
            <option value="digital">线上交付</option>
            <option value="shipping">需要邮寄</option>
          </select>
        </label>
        <label className="admin-field">
          预计时间
          <input
            value={product.delivery_note}
            onChange={(event) => update("delivery_note", event.target.value)}
          />
        </label>
        <label className="admin-field">
          副标题
          <input
            value={product.subtitle}
            onChange={(event) => update("subtitle", event.target.value)}
          />
        </label>
        <label className="admin-field">
          排序
          <input
            type="number"
            value={product.sort_order}
            onChange={(event) =>
              update("sort_order", Number(event.target.value))
            }
          />
        </label>
      </div>
      <label className="admin-field">
        详细说明
        <textarea
          value={product.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </label>
      <div className="admin-form-actions">
        <button type="button" className="admin-secondary" onClick={onClose} disabled={busy}>
          取消
        </button>
        <button className="store-primary" disabled={busy}>
          <Save size={15} /> 保存商品
        </button>
      </div>
    </form>
  );
}

function CategoryLayoutSettings({
  categories,
  busy,
  onChange,
}: {
  categories: Category[];
  busy: boolean;
  onChange: (category: Category, gridColumns: 1 | 2) => void;
}) {
  return (
    <section className="admin-panel category-layout-settings">
      <div className="settings-heading">
        <LayoutGrid size={22} />
        <div>
          <h3>分类页面布局</h3>
          <p>分别设置用户进入每个分类后，商品列表每行显示一个或两个条目。</p>
        </div>
      </div>
      <div className="category-layout-list">
        {categories.map((category) => (
          <div key={category.id} className="category-layout-row">
            <div>
              <strong>{category.name}</strong>
              <small>/{category.slug}</small>
            </div>
            <label className="admin-field">
              条目布局
              <select
                value={category.grid_columns === 1 ? 1 : 2}
                disabled={busy}
                onChange={(event) =>
                  onChange(category, Number(event.target.value) === 1 ? 1 : 2)
                }
              >
                <option value={1}>每行 1 个</option>
                <option value={2}>每行 2 个</option>
              </select>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
