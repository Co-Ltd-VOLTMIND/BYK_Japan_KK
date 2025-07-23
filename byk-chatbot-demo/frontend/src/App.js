import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Tab, Tabs } from 'react-bootstrap';
import ChatInterface from './components/ChatInterface';
import FileManager from './components/FileManager';
import SearchInterface from './components/SearchInterface';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [refreshSearch, setRefreshSearch] = useState(0);

  const handleFileUploaded = () => {
    // ファイルがアップロードされたら検索を更新
    setRefreshSearch(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="bg-primary text-white py-3">
        <Container>
          <h1 className="h3 mb-0">社内ナレッジ共有チャットボット - デモ版</h1>
        </Container>
      </header>

      <Container className="mt-4">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="chat" title="チャット">
            <ChatInterface />
          </Tab>
          <Tab eventKey="files" title="ファイル管理">
            <FileManager onFileUploaded={handleFileUploaded} />
          </Tab>
          <Tab eventKey="search" title="検索">
            <SearchInterface refreshTrigger={refreshSearch} />
          </Tab>
        </Tabs>
      </Container>

      <footer className="mt-5 py-3 bg-light text-center">
        <Container>
          <p className="mb-0 text-muted">
            BYK Japan KK チャットボット プロトタイプ v1.0
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
