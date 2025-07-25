import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSave, faUndo } from '@fortawesome/free-solid-svg-icons';
import { chatAPI } from '../services/api';

const SystemPromptConfig = () => {
  const [prompt, setPrompt] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadCurrentPrompt();
  }, []);

  const loadCurrentPrompt = async () => {
    try {
      const data = await chatAPI.getSystemPrompt();
      console.log('System prompt data:', data);
      setPrompt(data.prompt || '');
      setOriginalPrompt(data.prompt || '');
    } catch (error) {
      console.error('Load error:', error);
      setMessage({ 
        type: 'danger', 
        text: 'システムプロンプトの読み込みに失敗しました' 
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await chatAPI.updateSystemPrompt(prompt);
      setOriginalPrompt(prompt);
      setMessage({ 
        type: 'success', 
        text: 'システムプロンプトを更新しました' 
      });
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: 'システムプロンプトの更新に失敗しました' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt(originalPrompt);
    setMessage({ type: 'info', text: '変更をリセットしました' });
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <FontAwesomeIcon icon={faCog} className="me-2" />
          システムプロンプト設定
        </Card.Header>
        <Card.Body>
          {message.text && (
            <Alert 
              variant={message.type} 
              dismissible 
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                AIアシスタントの振る舞いを定義するシステムプロンプト
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={15}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="システムプロンプトを入力してください..."
                style={{ fontFamily: 'monospace' }}
              />
              <Form.Text className="text-muted">
                このプロンプトがAIの応答の前提となります。
                文書への参照方法や回答スタイルを指定できます。
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={loading || prompt === originalPrompt}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                保存
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleReset}
                disabled={prompt === originalPrompt}
              >
                <FontAwesomeIcon icon={faUndo} className="me-2" />
                リセット
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SystemPromptConfig; 