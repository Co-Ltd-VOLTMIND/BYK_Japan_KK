import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
  Modal,
  Spinner,
  Badge
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faFile, 
  faTrash, 
  faTag,
  faFolder,
  faFilePdf,
  faFileWord
} from '@fortawesome/free-solid-svg-icons';
import { fileAPI } from '../services/api';

const FileManager = ({ onFileUploaded }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // アップロード用state
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  // ファイル一覧を取得
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fileAPI.list();
      setFiles(data);
    } catch (err) {
      setError('ファイル一覧の取得に失敗しました。');
      console.error('Load files error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
        setSelectedFile(file);
      } else {
        setError('PDF、Word（.doc, .docx）、テキスト（.txt）ファイルのみアップロード可能です。');
        e.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    
    try {
      await fileAPI.upload(selectedFile, category, tags);
      setSuccess('ファイルが正常にアップロードされました。');
      setShowUploadModal(false);
      resetUploadForm();
      loadFiles();
      if (onFileUploaded) onFileUploaded();
    } catch (err) {
      setError('ファイルのアップロードに失敗しました。');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`"${filename}" を削除してもよろしいですか？`)) return;

    try {
      await fileAPI.deleteFile(id);
      setSuccess('ファイルが削除されました。');
      loadFiles();
    } catch (err) {
      setError('ファイルの削除に失敗しました。');
      console.error('Delete error:', err);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setCategory('');
    setTags('');
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return faFilePdf;
    if (['doc', 'docx'].includes(ext)) return faFileWord;
    if (ext === 'txt') return faFile;
    return faFile;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <Container fluid>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">アップロード済みファイル</h5>
          <Button onClick={() => setShowUploadModal(true)}>
            <FontAwesomeIcon icon={faUpload} /> ファイルをアップロード
          </Button>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">読み込み中...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">アップロードされたファイルはありません。</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>ファイル名</th>
                  <th>カテゴリ</th>
                  <th>タグ</th>
                  <th>アップロード日時</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <FontAwesomeIcon 
                        icon={getFileIcon(file.filename)} 
                        className="me-2 text-primary" 
                      />
                      {file.filename}
                    </td>
                    <td>
                      {file.category ? (
                        <Badge bg="info">
                          <FontAwesomeIcon icon={faFolder} className="me-1" />
                          {file.category}
                        </Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {file.tags ? (
                        file.tags.split(',').map((tag, idx) => (
                          <Badge key={idx} bg="secondary" className="me-1">
                            <FontAwesomeIcon icon={faTag} className="me-1" />
                            {tag.trim()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{formatDate(file.uploaded_at)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(file.id, file.filename)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* アップロードモーダル */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>ファイルアップロード</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ファイル選択</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />
              <Form.Text className="text-muted">
                PDF、Word（.doc, .docx）、テキスト（.txt）ファイルのみ（最大10MB）
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>カテゴリ</Form.Label>
              <Form.Select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="規則・規定">規則・規定</option>
                <option value="マニュアル">マニュアル</option>
                <option value="人事制度">人事制度</option>
                <option value="その他">その他</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>タグ（カンマ区切り）</Form.Label>
              <Form.Control
                type="text"
                placeholder="例: 旅費, 出張"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            キャンセル
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                アップロード中...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                アップロード
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FileManager; 