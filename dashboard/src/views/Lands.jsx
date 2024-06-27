import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, options, samplePieData } from '../data/charts';

export default function Lands({ lands }) {
  const [pieData, setPieData] = useState(samplePieData);

  useEffect(() => {
    if (lands.length > 0) {
      const tierCounts = lands.reduce((acc, land) => {
        const tier = land.metadata?.tier || 'Unknown';
        if (!acc[tier]) acc[tier] = 0;
        acc[tier] += 1;
        return acc;
      }, {});

      const pieLabels = Object.keys(tierCounts);
      const pieValues = Object.values(tierCounts);

      setPieData({
        labels: pieLabels,
        datasets: [
          {
            data: pieValues,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF9F40',
              '#FFCD56',
              '#4BC0C0',
              '#9966FF',
            ],
            hoverBackgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF9F40',
              '#FFCD56',
              '#4BC0C0',
              '#9966FF',
            ],
          },
        ],
      });
    }
  }, [lands]);

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Lands</Heading>
      <Text mb={5}>Information and trends about Lands on the platform.</Text>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average Land Price Change Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Min Land Price Change Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box></Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Lands for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Distribution of Lands for Sale</Text>
          <Pie data={pieData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Lands</Text>
          <Pie data={pieData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average Price for Sale of Lands</Text>
          <Pie data={pieData} options={options} />
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
      </Flex>
    </Box>
  );
};
