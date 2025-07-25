import React, { useState, useEffect } from 'react';
import { 
  Container, 
  FormControl,
  FormLabel,
  Textarea,
  Button, 
  Alert,
  AlertIcon,
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  useToast,
  Heading,
  Text,
  FormHelperText
} from '@chakra-ui/react';
import { SettingsIcon, CheckIcon, RepeatIcon } from '@chakra-ui/icons';
import { chatAPI } from '../services/api';

const SystemPromptConfig = () => {
  const [prompt, setPrompt] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const toast = useToast();

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
        type: 'error', 
        text: 'システムプロンプトの読み込みに失敗しました' 
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await chatAPI.updateSystemPrompt(prompt);
      setOriginalPrompt(prompt);
      toast({
        title: '保存完了',
        description: 'システムプロンプトを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'システムプロンプトの更新に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt(originalPrompt);
    toast({
      title: 'リセット完了',
      description: '変更をリセットしました',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.lg" py={4}>
      <Card>
        <CardHeader bg="blue.500" color="white">
          <HStack>
            <SettingsIcon />
            <Heading size="md">システムプロンプト設定</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {message.text && (
              <Alert 
                status={message.type === 'danger' ? 'error' : message.type}
                borderRadius="md"
              >
                <AlertIcon />
                {message.text}
              </Alert>
            )}
            
            <FormControl>
              <FormLabel>
                AIアシスタントの振る舞いを定義するシステムプロンプト
              </FormLabel>
              <Textarea
                rows={15}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="システムプロンプトを入力してください..."
                fontFamily="monospace"
                size="sm"
              />
              <FormHelperText>
                このプロンプトがAIの応答の前提となります。
                文書への参照方法や回答スタイルを指定できます。
              </FormHelperText>
            </FormControl>
            
            <HStack spacing={2}>
              <Button 
                colorScheme="blue" 
                onClick={handleSave}
                isLoading={loading}
                isDisabled={prompt === originalPrompt}
                leftIcon={<CheckIcon />}
              >
                保存
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                isDisabled={prompt === originalPrompt}
                leftIcon={<RepeatIcon />}
              >
                リセット
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default SystemPromptConfig; 