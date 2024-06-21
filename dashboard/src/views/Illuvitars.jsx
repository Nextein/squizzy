import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, pieData, options } from '../data/charts';

const Illuvitars = () => {

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Illuvitars</Heading>
      <Text mb={5}>Information and trends about Illuvitars on the platform.</Text>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Illuvitars Market Cap over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Distribution of Illuvitars for Sale</Text>
          <Pie data={pieData} options={options} />
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total Amount of Illuvitars for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Change in Amount of Illuvitars for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Illuvitars</Text>
          <Pie data={pieData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average Price for Sale of Illuvitars</Text>
          <Pie data={pieData} options={options} />
        </Box>
      </Flex>
    </Box>
  );
};

export default Illuvitars;
