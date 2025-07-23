import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  ListGroup,
  Spinner
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFile, 
  faFolder,
  faTag,
  faHighlighter
} from '@fortawesome/free-solid-svg-icons';
import { searchAPI } from '../services/api';

const SearchInterface = ({ refreshTrigger }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // カテゴリ一覧を取得
  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]);

  const loadCategories = async () => {
    try {
      const data = await searchAPI.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Load categories error:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('検索キーワードを入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchAPI.search(query, selectedCategory);
      setResults(data.results || []);
    } catch (err) {
      setError('検索中にエラーが発生しました。');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    
    // <mark>タグが既に含まれている場合はそのまま返す
    if (text.includes('<mark>')) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
    
    // 含まれていない場合は通常のテキストとして返す
    return text;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  return (
    <Container fluid>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>検索キーワード</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="検索したいキーワードを入力..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>カテゴリ</Form.Label>
                  <Form.Select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">すべてのカテゴリ</option>
                    {categories.map((cat) => (
                      <option key={cat.category} value={cat.category}>
                        {cat.category} ({cat.count}件)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      検索中...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSearch} className="me-2" />
                      検索
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 検索結果 */}
      {hasSearched && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              検索結果 
              {!isLoading && (
                <Badge bg="secondary" className="ms-2">
                  {results.length}件
                </Badge>
              )}
            </h5>
          </Card.Header>
          <Card.Body>
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">検索中...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">
                  「{query}」に一致する文書は見つかりませんでした。
                </p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {results.map((result) => (
                  <ListGroup.Item key={result.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-2">
                          <FontAwesomeIcon 
                            icon={faFile} 
                            className="me-2 text-primary" 
                          />
                          {result.filename}
                        </h6>
                        
                        {result.snippet && (
                          <div className="text-muted small mb-2">
                            <FontAwesomeIcon 
                              icon={faHighlighter} 
                              className="me-2" 
                            />
                            {highlightText(result.snippet)}
                          </div>
                        )}
                        
                        <div className="d-flex gap-3 small">
                          {result.category && (
                            <span>
                              <FontAwesomeIcon 
                                icon={faFolder} 
                                className="me-1 text-info" 
                              />
                              {result.category}
                            </span>
                          )}
                          {result.tags && (
                            <span>
                              <FontAwesomeIcon 
                                icon={faTag} 
                                className="me-1 text-secondary" 
                              />
                              {result.tags}
                            </span>
                          )}
                          <span className="text-muted">
                            {formatDate(result.uploaded_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      )}

      {/* 検索のヒント */}
      {!hasSearched && (
        <Card className="bg-light">
          <Card.Body>
            <h6>検索のヒント</h6>
            <ul className="mb-0">
              <li>複数のキーワードで検索すると、より精度の高い結果が得られます</li>
              <li>カテゴリを指定すると、特定の分野の文書に絞り込めます</li>
              <li>「旅費精算」「機器操作」など、具体的なキーワードを使用してください</li>
            </ul>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default SearchInterface; 