export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">联系我</h1>
      <div className="max-w-md mx-auto card">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <input type="text" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input type="email" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">消息</label>
            <textarea className="input h-24 resize-none"></textarea>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            发送消息
          </button>
        </form>
      </div>
    </div>
  )
} 