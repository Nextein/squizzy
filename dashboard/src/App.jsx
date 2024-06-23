import { Box, ChakraProvider, VStack } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRouter from './Router';

function App() {
  
  return (
      <ChakraProvider>
        <Router>
          <VStack w="100vw">
            <Navbar />
            <AppRouter />
          </VStack>
        </Router>
      </ChakraProvider>
  );
}

export default App;
