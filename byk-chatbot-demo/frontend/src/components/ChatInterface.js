import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  Alert,
  Spinner,
  Badge
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faFile, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import { chatAPI } from '../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // 初期メッセージ
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      type: 'bot',
      content: 'こんにちは！社内ナレッジに関する質問をお答えします。お気軽にご質問ください。',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  // メッセージ送信後に自動スクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatAPI.sendMessage(inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer,
        relatedFiles: response.relatedFiles || [],
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('メッセージの送信に失敗しました。再度お試しください。');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container fluid className="chat-interface">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="chat-container" style={{ height: '600px' }}>
        <Card.Body className="d-flex flex-column">
          <div className="messages-container flex-grow-1 overflow-auto mb-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-wrapper mb-3 ${
                  message.type === 'user' ? 'text-end' : 'text-start'
                }`}
              >
                <div
                  className={`message-bubble d-inline-block p-3 rounded ${
                    message.type === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-light text-dark'
                  }`}
                  style={{ maxWidth: '70%' }}
                >
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon 
                      icon={message.type === 'user' ? faUser : faRobot} 
                      className="me-2"
                    />
                    <small className="text-muted">
                      {formatTimestamp(message.timestamp)}
                    </small>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                  {message.relatedFiles && message.relatedFiles.length > 0 && (
                    <div className="related-files mt-3">
                      <small className="d-block mb-2">関連文書:</small>
                      {message.relatedFiles.map((file) => (
                        <Badge 
                          key={file.id} 
                          bg="secondary" 
                          className="me-2 mb-1"
                          style={{ cursor: 'pointer' }}
                        >
                          <FontAwesomeIcon icon={faFile} className="me-1" />
                          {file.filename}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center">
                <Spinner animation="border" size="sm" />
                <small className="ms-2">回答を生成中...</small>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Form onSubmit={handleSubmit}>
            <Row className="g-2">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="質問を入力してください..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                />
              </Col>
              <Col xs="auto">
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  {' '}送信
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-3">
        <Card.Body>
          <h6>サンプル質問:</h6>
          <div className="sample-questions">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2 mb-2"
              onClick={() => setInputMessage('海外出張の旅費精算方法を教えてください')}
            >
              海外出張の旅費精算方法を教えてください
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2 mb-2"
              onClick={() => setInputMessage('分析装置の電源の入れ方は？')}
            >
              分析装置の電源の入れ方は？
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="mb-2"
              onClick={() => setInputMessage('有給申請の締切はいつですか？')}
            >
              有給申請の締切はいつですか？
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ChatInterface; 