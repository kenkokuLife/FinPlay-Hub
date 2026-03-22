"use client";

import { useState, useEffect } from "react";
import "./dev.css";

export default function DevPage() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dev/prototypes")
      .then((r) => r.json())
      .then((d) => {
        const list = d.files || [];
        setFiles(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const displayName = (filename) => filename.replace(/\.html$/, "");

  return (
    <div className="dev-root">
      <div className="dev-sidebar">
        <div className="dev-sidebar-header">
          <div className="dev-sidebar-title">原型测试台</div>
          <div className="dev-sidebar-count">
            {loading ? "加载中…" : `${files.length} 个文件`}
          </div>
        </div>

        <div className="dev-file-list">
          {!loading && files.length === 0 && (
            <div className="dev-empty">
              <p>暂无原型文件</p>
              <p>将 .html 文件放入：</p>
              <code>public/prototypes/</code>
            </div>
          )}
          {files.map((f) => (
            <button
              key={f}
              className={`dev-file-btn ${selected === f ? "active" : ""}`}
              onClick={() => setSelected(f)}
            >
              {displayName(f)}
            </button>
          ))}
        </div>

        <div className="dev-sidebar-footer">
          <code>public/prototypes/</code>
        </div>
      </div>

      <div className="dev-preview">
        {selected ? (
          <iframe
            key={selected}
            src={`/prototypes/${selected}`}
            className="dev-iframe"
            title={selected}
          />
        ) : (
          <div className="dev-placeholder">
            {loading ? "加载中…" : "将 .html 文件放入 public/prototypes/ 即可在此预览"}
          </div>
        )}
      </div>
    </div>
  );
}
