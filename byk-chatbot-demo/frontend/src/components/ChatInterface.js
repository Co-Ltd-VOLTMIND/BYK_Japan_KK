import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Flex,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  Avatar,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Card,
  CardBody
} from '@chakra-ui/react';
import { ChatIcon, AttachmentIcon } from '@chakra-ui/icons';
import { chatAPI } from '../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const toast = useToast();

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
    <Box>
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Card height="600px" overflow="hidden">
        <CardBody display="flex" flexDirection="column" p={0}>
          <VStack
            flex="1"
            overflowY="auto"
            spacing={4}
            p={4}
            align="stretch"
          >
            {messages.map((message) => (
              <Flex
                key={message.id}
                justify={message.type === 'user' ? 'flex-end' : 'flex-start'}
              >
                <HStack
                  maxW="70%"
                  bg={message.type === 'user' ? 'blue.500' : 'gray.100'}
                  color={message.type === 'user' ? 'white' : 'gray.800'}
                  p={4}
                  borderRadius="lg"
                  spacing={3}
                  align="start"
                >
                  <Avatar
                    size="sm"
                    icon={message.type === 'user' ? <ChatIcon /> : <ChatIcon />}
                    bg={message.type === 'user' ? 'blue.600' : 'gray.300'}
                  />
                  <VStack align="start" spacing={2}>
                    <Text fontSize="xs" opacity={0.8}>
                      {formatTimestamp(message.timestamp)}
                    </Text>
                    <Text whiteSpace="pre-wrap">{message.content}</Text>
                    {message.relatedFiles && message.relatedFiles.length > 0 && (
                      <VStack align="start" spacing={1} mt={2}>
                        <Text fontSize="sm" fontWeight="bold">関連文書:</Text>
                        <HStack wrap="wrap" spacing={2}>
                          {message.relatedFiles.map((file) => (
                            <Badge
                              key={file.id}
                              colorScheme="gray"
                              cursor="pointer"
                              p={2}
                            >
                              <AttachmentIcon mr={1} />
                              {file.filename}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                    )}
                  </VStack>
                </HStack>
              </Flex>
            ))}
            {isLoading && (
              <Flex justify="center" align="center">
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm">回答を生成中...</Text>
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </VStack>

          <Box p={4} borderTop="1px" borderColor="gray.200">
            <form onSubmit={handleSubmit}>
              <InputGroup size="lg">
                <Input
                  placeholder="質問を入力してください..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    colorScheme="blue"
                  >
                    送信
                  </Button>
                </InputRightElement>
              </InputGroup>
            </form>
          </Box>
        </CardBody>
      </Card>

      <Card mt={4}>
        <CardBody>
          <Text fontWeight="bold" mb={3}>サンプル質問:</Text>
          <HStack wrap="wrap" spacing={2}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputMessage('海外出張の旅費精算方法を教えてください')}
            >
              海外出張の旅費精算方法を教えてください
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputMessage('分析装置の電源の入れ方は？')}
            >
              分析装置の電源の入れ方は？
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputMessage('有給申請の締切はいつですか？')}
            >
              有給申請の締切はいつですか？
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ChatInterface; 