import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Badge,
  HStack,
  VStack,
  useToast,
  IconButton,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useDisclosure,
  Textarea
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, AttachmentIcon } from '@chakra-ui/icons';
import { fileAPI } from '../services/api';

const FileManager = ({ onFileUploaded }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('ファイルを選択してください。');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      await fileAPI.upload(selectedFile, category, tags);
      toast({
        title: 'アップロード成功',
        description: 'ファイルが正常にアップロードされました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
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
      toast({
        title: '削除成功',
        description: 'ファイルが削除されました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
    return ext.toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">アップロード済みファイル</Heading>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
              ファイルをアップロード
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <VStack py={5}>
              <Spinner />
              <Text>読み込み中...</Text>
            </VStack>
          ) : files.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Text color="gray.500">アップロードされたファイルはありません。</Text>
            </Box>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ファイル名</Th>
                    <Th>カテゴリ</Th>
                    <Th>タグ</Th>
                    <Th>アップロード日時</Th>
                    <Th>操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {files.map((file) => (
                    <Tr key={file.id}>
                      <Td>
                        <HStack>
                          <Badge colorScheme="blue">{getFileIcon(file.filename)}</Badge>
                          <Text>{file.filename}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        {file.category ? (
                          <Badge colorScheme="teal">{file.category}</Badge>
                        ) : (
                          <Text color="gray.500">-</Text>
                        )}
                      </Td>
                      <Td>
                        {file.tags ? (
                          <HStack>
                            {file.tags.split(',').map((tag, idx) => (
                              <Badge key={idx} colorScheme="gray">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </HStack>
                        ) : (
                          <Text color="gray.500">-</Text>
                        )}
                      </Td>
                      <Td>{formatDate(file.uploaded_at)}</Td>
                      <Td>
                        <IconButton
                          aria-label="削除"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(file.id, file.filename)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>

      {/* アップロードモーダル */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ファイルアップロード</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleUpload}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>ファイル選択</FormLabel>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    pt={1}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>カテゴリ</FormLabel>
                  <Input
                    placeholder="例: 人事制度、技術文書"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>タグ（カンマ区切り）</FormLabel>
                  <Textarea
                    placeholder="例: 海外出張, 旅費精算, 規定"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                キャンセル
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={uploading}
                loadingText="アップロード中..."
                leftIcon={<AttachmentIcon />}
              >
                アップロード
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FileManager; 