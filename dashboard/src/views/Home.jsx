import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Button, VStack } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, pieData, options } from '../data/charts';

const Home = () => {

  return (
    <Box p={5} w='100vw'>
      <Heading as="h1" mb={5}>Home</Heading>
      <Text mb={5}>Overview of the platform with key statistics and trends.</Text>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Ranking points over time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total wallets change over time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total lands for sale change over time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box></Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Capitalization Distribution</Text>
          <Pie data={pieData} options={options} />
        </Box>
        <Box>
          <VStack>

            <Button>SELL BAD ASSETS</Button>
            <Button>SAFE LIQUIDATE</Button>
          </VStack>
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
      </Flex>
    </Box>
  );
};

export default Home;
