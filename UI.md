import React, { useState } from 'react';
import { User, Calendar, Globe, MessageSquare, Sun, Moon } from 'lucide-react';

export default function PersonalInfoPage() {
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState('关于我');

  const menuItems = [
    '关于我',
    '我的作品', 
    '我的经验',
    '我的思考',
    '其他东西',
    '私有访问1',
    '私有访问2'
  ];

  const renderContent = () => {
    if (activeSection === '关于我') {
      return (
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            个人信息
          </h1>
          <p className={`font-bold mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            管理你的个人信息，其中包括可以联系到你的电话号码和电子邮件地址。
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Name Field */}
            <div className={`border rounded-lg p-4 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-bold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>姓名</label>
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <input
                type="text"
                value="LINGINK"
                className={`w-full text-lg font-bold bg-transparent border-none outline-none ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                readOnly
              />
            </div>

            {/* Birth Date Field */}
            <div className={`border rounded-lg p-4 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-bold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>出生日期</label>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <input
                type="text"
                value="2002年2月2日"
                className={`w-full text-lg font-bold bg-transparent border-none outline-none ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                readOnly
              />
            </div>

            {/* Country/Region Field */}
            <div className={`border rounded-lg p-4 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-bold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>国家或地区</label>
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <input
                type="text"
                value="美国"
                className={`w-full text-lg font-bold bg-transparent border-none outline-none ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                readOnly
              />
            </div>

            {/* Language Field */}
            <div className={`border rounded-lg p-4 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-bold ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>语言</label>
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <input
                type="text"
                value="简体中文 - 中文（简体）"
                className={`w-full text-lg font-bold bg-transparent border-none outline-none ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                readOnly
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-64">
          <p className={`text-xl font-bold ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {activeSection} - 页面内容待开发
          </p>
        </div>
      );
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Left Sidebar */}
      <div className={`w-64 border-r p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Profile Section */}
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mr-4">
            <div className="w-8 h-6 bg-orange-500 rounded-sm"></div>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>LINGINK</h2>
            <p className={`text-sm font-bold ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>huinkling@gmail.com</p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${
              isDark ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full transition-transform duration-200 flex items-center justify-center ${
              isDark 
                ? 'bg-gray-700 translate-x-6 text-white' 
                : 'bg-white translate-x-0 text-gray-600'
            }`}>
              {isDark ? <Moon className="w-2 h-2" /> : <Sun className="w-2 h-2" />}
            </div>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div
              key={item}
              onClick={() => setActiveSection(item)}
              className={`px-3 py-2 rounded font-bold cursor-pointer transition-colors ${
                activeSection === item
                  ? isDark 
                    ? 'bg-blue-900 text-blue-300 border border-blue-800' 
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}