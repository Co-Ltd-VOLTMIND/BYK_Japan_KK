import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  Button,
  Alert,
  AlertIcon,
  Badge,
  Spinner,
  FormControl,
  FormLabel,
  Heading,
  Text,
  useToast,
  Icon,
  Flex,
  Spacer,
  List,
  ListItem,
  Divider
} from '@chakra-ui/react';
import { 
  Search2Icon, 
  AttachmentIcon,
  InfoIcon 
} from '@chakra-ui/icons';
import { searchAPI } from '../services/api';

const SearchInterface = ({ refreshTrigger }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const toast = useToast();

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
    <Container maxW="container.xl">
      <VStack spacing={4} align="stretch">
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Card>
          <CardBody>
            <form onSubmit={handleSearch}>
              <VStack spacing={4}>
                <HStack spacing={4} w="full">
                  <FormControl flex={2}>
                    <FormLabel>検索キーワード</FormLabel>
                    <Input
                      type="text"
                      placeholder="検索したいキーワードを入力..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </FormControl>
                  <FormControl flex={1}>
                    <FormLabel>カテゴリ</FormLabel>
                    <Select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">すべてのカテゴリ</option>
                      {categories.map((cat) => (
                        <option key={cat.category} value={cat.category}>
                          {cat.category} ({cat.count}件)
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="検索中..."
                  leftIcon={<Search2Icon />}
                >
                  検索
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* 検索結果 */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <HStack>
                <Heading size="md">
                  検索結果
                </Heading>
                {!isLoading && (
                  <Badge colorScheme="gray" ml={2}>
                    {results.length}件
                  </Badge>
                )}
              </HStack>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <VStack py={10}>
                  <Spinner size="xl" />
                  <Text mt={2}>検索中...</Text>
                </VStack>
              ) : results.length === 0 ? (
                <VStack py={10}>
                  <Text color="gray.500">
                    「{query}」に一致する文書は見つかりませんでした。
                  </Text>
                </VStack>
              ) : (
                <List spacing={3}>
                  {results.map((result) => (
                    <ListItem key={result.id}>
                      <Card variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={2}>
                            <HStack>
                              <AttachmentIcon color="blue.500" />
                              <Text fontWeight="bold">
                                {result.filename}
                              </Text>
                            </HStack>
                            
                            {result.snippet && (
                              <Box pl={6}>
                                <Text fontSize="sm" color="gray.600">
                                  {highlightText(result.snippet)}
                                </Text>
                              </Box>
                            )}
                            
                            <HStack pl={6} fontSize="sm" color="gray.500">
                              {result.category && (
                                <HStack>
                                  <Text>📁 {result.category}</Text>
                                </HStack>
                              )}
                              {result.tags && (
                                <HStack>
                                  <Text>🏷️ {result.tags}</Text>
                                </HStack>
                              )}
                              <Spacer />
                              <Text>
                                {formatDate(result.uploaded_at)}
                              </Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardBody>
          </Card>
        )}

        {/* 検索のヒント */}
        {!hasSearched && (
          <Card bg="gray.50">
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <InfoIcon color="blue.500" />
                  <Heading size="sm">検索のヒント</Heading>
                </HStack>
                <List spacing={2} pl={6}>
                  <ListItem>• 複数のキーワードで検索すると、より精度の高い結果が得られます</ListItem>
                  <ListItem>• カテゴリを指定すると、特定の分野の文書に絞り込めます</ListItem>
                  <ListItem>• 「旅費精算」「機器操作」など、具体的なキーワードを使用してください</ListItem>
                </List>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default SearchInterface; 