export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">我的文章</h1>
      <div className="space-y-6">
        <article className="card">
          <h2 className="text-xl font-semibold mb-2">文章标题</h2>
          <p className="text-gray-600 mb-4">文章摘要...</p>
          <div className="text-sm text-gray-500">发布时间: 2024-01-01</div>
        </article>
      </div>
    </div>
  )
} 