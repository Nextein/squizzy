import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Button } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, pieData, options } from '../data/charts';

const Baloth = () => {

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Baloth</Heading>
      <Text mb={5}>Information and trends of Baloth account.</Text>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Amount of Bad Assets in Baloth</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Bad Assets in Baloth</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">$ Value (Market Cap) of Good Assets Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Distribution of Good vs. Bad Assets</Text>
          <Pie data={pieData} options={options} />
        </Box>
        <Button>SELL BAD ASSETS</Button>
        <Button>SAFE LIQUIDATE</Button>
      </Flex>
    </Box>
  );
};

export default Baloth;
