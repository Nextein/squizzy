import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, pieData, options } from '../data/charts';

const Wallets = () => {

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Wallets</Heading>
      <Text mb={5}>Information and trends about wallets on the platform.</Text>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total Wallets Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average $ Value of Wallets Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Wallets Market Capitalization Distribution</Text>
          <Pie data={pieData} options={options} />
        </Box>
      </Flex>
    </Box>
  );
};

export default Wallets;
