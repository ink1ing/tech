export default function Protected() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">密码保护区域</h1>
      <div className="max-w-md mx-auto card">
        <p className="text-gray-600 mb-4">此区域需要密码才能访问</p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input type="password" className="input" placeholder="请输入访问密码" />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            进入
          </button>
        </form>
      </div>
    </div>
  )
} 