import React, { useState } from 'react';
import './App.css';
import {
  Box,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Text,
  VStack,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import ChatInterface from './components/ChatInterface';
import FileManager from './components/FileManager';
import SearchInterface from './components/SearchInterface';
import SystemPromptConfig from './components/SystemPromptConfig';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshSearch, setRefreshSearch] = useState(0);

  const handleFileUploaded = () => {
    // ファイルがアップロードされたら検索を更新
    setRefreshSearch(prev => prev + 1);
  };

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('blue.600', 'blue.800');

  return (
    <Flex direction="column" minH="100vh" bg={bgColor}>
      <Box bg={headerBg} color="white" py={4} boxShadow="md">
        <Container maxW="container.xl">
          <Heading size="md">社内ナレッジ共有チャットボット - デモ版</Heading>
        </Container>
      </Box>

      <Container maxW="container.xl" flex="1" mt={6}>
        <Box bg="white" borderRadius="lg" boxShadow="sm" p={4}>
          <Tabs index={activeTab} onChange={setActiveTab} colorScheme="blue">
            <TabList>
              <Tab>チャット</Tab>
              <Tab>ファイル管理</Tab>
              <Tab>検索</Tab>
              <Tab>設定</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <ChatInterface />
              </TabPanel>
              <TabPanel>
                <FileManager onFileUploaded={handleFileUploaded} />
              </TabPanel>
              <TabPanel>
                <SearchInterface refreshTrigger={refreshSearch} />
              </TabPanel>
              <TabPanel>
                <SystemPromptConfig />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>

      <Box bg="gray.100" py={4} mt={8}>
        <Container maxW="container.xl">
          <Text textAlign="center" color="gray.600" fontSize="sm">
            BYK Japan KK チャットボット プロトタイプ v1.0
          </Text>
        </Container>
      </Box>
    </Flex>
  );
}

export default App;
