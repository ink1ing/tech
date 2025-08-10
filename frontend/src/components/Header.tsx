import { Link } from 'react-router-dom'

interface HeaderProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gradient">
            我的网站
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-primary-500 transition-colors">
              首页
            </Link>
            <Link to="/projects" className="hover:text-primary-500 transition-colors">
              项目
            </Link>
            <Link to="/blog" className="hover:text-primary-500 transition-colors">
              文章
            </Link>
            <Link to="/contact" className="hover:text-primary-500 transition-colors">
              联系
            </Link>
            <Link to="/protected" className="hover:text-primary-500 transition-colors">
              密码区域
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="切换主题"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
} 