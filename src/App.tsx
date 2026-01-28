import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Stock Genius</h1>
          <p className="subtitle">智能股票分析平台</p>
        </header>
        
        <main className="main-content">
          <div className="card">
            <div className="card-icon">📈</div>
            <h2 className="card-title">实时行情</h2>
            <p className="card-description">获取最新的股票市场数据和实时行情分析</p>
          </div>
          
          <div className="card">
            <div className="card-icon">🤖</div>
            <h2 className="card-title">智能分析</h2>
            <p className="card-description">利用AI技术进行深度市场分析和预测</p>
          </div>
          
          <div className="card">
            <div className="card-icon">💼</div>
            <h2 className="card-title">投资组合</h2>
            <p className="card-description">管理和优化您的个人投资组合</p>
          </div>
        </main>
        
        <footer className="footer">
          <p>© 2026 Stock Genius. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
