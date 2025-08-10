export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient mb-6">
          欢迎来到我的个人网站
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          专为中国大陆用户优化访问速度
        </p>
        <div className="space-x-4">
          <button className="btn btn-primary">
            开始探索
          </button>
          <button className="btn btn-secondary">
            了解更多
          </button>
        </div>
      </div>
    </div>
  )
} 