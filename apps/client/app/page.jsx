const games = [
  {
    title: "Milk Tea Pro",
    path: "/games/milk-tea-pro/",
    status: "pending"
  }
];

export default function Home() {
  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">FinPlay Hub</p>
          <h1>用游戏驱动投行训练</h1>
          <p className="lead">
            选择一个游戏开始。我们会持续把新游戏自动加入列表。
          </p>
          <div className="actions">
            <a className="btn primary" href={games[0].path}>
              进入奶茶店
            </a>
            <a className="btn ghost" href="/api/games">
              查看游戏列表
            </a>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <span>快速访问</span>
            <span className="pill">Pending</span>
          </div>
          <div className="card-body">
            <div className="game-row">
              <div>
                <p className="game-title">Milk Tea Pro</p>
                <p className="game-meta">经营模拟 · EBITDA 训练</p>
              </div>
              <a className="btn mini" href={games[0].path}>
                启动
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <h2>游戏库</h2>
        <div className="grid">
          {games.map((game) => (
            <div className="tile" key={game.path}>
              <div className="tile-meta">
                <p className="tile-title">{game.title}</p>
                <span className={`tag ${game.status}`}>{game.status}</span>
              </div>
              <p className="tile-desc">用轻量化模拟快速理解财务杠杆。</p>
              <a className="btn ghost" href={game.path}>
                打开游戏
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
