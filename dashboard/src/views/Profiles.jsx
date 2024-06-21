import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Center } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, pieData, options } from '../data/charts';

function Profiles() {

  return (
    <Box p={5}>
      <Center>
        <Heading as="h1" mb={5}>Profiles</Heading>
      </Center>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Stat 1</Text>
          <Text>Value</Text>
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Stat 2</Text>
          <Text>Value</Text>
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Stat 3</Text>
          <Text>Value</Text>
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
        <Box>
          <Line data={lineData} options={options} />
        </Box>
        <Box>
          <Pie data={pieData} options={options} />
        </Box>
        {/* Add more charts or tables as needed */}
      </Flex>
    </Box>
  );
}

export default Profiles;
