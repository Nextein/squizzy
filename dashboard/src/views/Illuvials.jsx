import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, pieData, options } from '../data/charts';

const Illuvials = () => {

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Illuvials</Heading>
      <Text mb={5}>Information and trends about Illuvials on the platform.</Text>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Illuvials Market Cap over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total Amount of Illuvials for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Change in Amount of Illuvials for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Distribution of Illuvials for Sale</Text>
          <Pie data={pieData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Illuvials</Text>
          <Pie data={pieData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average Price for Sale of Illuvials</Text>
          <Pie data={pieData} options={options} />
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
        
        
        
      </Flex>
    </Box>
  );
};

export default Illuvials;
