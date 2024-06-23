import React from 'react';
import { Box, Heading, Button, Text, SimpleGrid, Flex, Center, useToast } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { lineData, samplePieData, options } from '../data/charts';
import '../chartConfig';
import ADDRESS from '../data/addresses';


export default function Other() {
  const toast = useToast();

  const handleCellClick = (value) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
      description: value,
      status: "success",
      duration: 1500,
      position: 'top',
    });
  };

  return (
    <Box p={5}>
      <Center>
        <Heading as="h1" mb={5}>Squizz</Heading>
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
        <Box>
          <Line data={lineData} options={options} />
        </Box>
        <Box>
          <Pie data={samplePieData} options={options} />
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
        <Box>
          <Text fontSize="xl">
            Lands Collection Address:{" "}
            <Button onClick={() => handleCellClick(ADDRESS.lands)} variant="link" colorScheme="teal">
              {ADDRESS.lands}
            </Button>
          </Text>
        </Box>
        {/* Add more charts or tables as needed */}
      </Flex>
    </Box>
  );
}
